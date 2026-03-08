/**
 * Yjs WebSocket Collaboration Server
 * Implements the full y-websocket sync protocol using y-protocols + lib0
 * Run with: npm run collab:server (port 1234)
 */

import http from 'http';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

const PORT = process.env.COLLAB_PORT || 1234;

// Message type constants (y-websocket protocol)
const messageSync = 0;
const messageAwareness = 1;

// In-memory store of Yjs docs + awareness per room
const rooms = new Map(); // roomName -> { doc, awareness, connections: Set<ws> }

function getRoom(name) {
  if (!rooms.has(name)) {
    const doc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(doc);
    rooms.set(name, { doc, awareness, connections: new Set() });
  }
  return rooms.get(name);
}

function send(ws, message) {
  if (ws.readyState === 1 /* OPEN */) {
    try {
      ws.send(message, { binary: true });
    } catch (e) {
      // ignore
    }
  }
}

function broadcast(room, message, excludeWs = null) {
  for (const conn of room.connections) {
    if (conn !== excludeWs) send(conn, message);
  }
}

function onConnect(ws, roomName) {
  const room = getRoom(roomName);
  room.connections.add(ws);

  // Send sync step 1: state vector
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, room.doc);
  send(ws, encoding.toUint8Array(encoder));

  // Send current awareness states
  const awarenessStates = room.awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(room.awareness, Array.from(awarenessStates.keys()))
    );
    send(ws, encoding.toUint8Array(awarenessEncoder));
  }

  ws.on('message', (data) => {
    try {
      const message = new Uint8Array(data);
      const decoder = decoding.createDecoder(message);
      const msgType = decoding.readVarUint(decoder);

      if (msgType === messageSync) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, room.doc, ws);

        // Only send reply if the encoder has content (sync step 2 or update ack)
        if (encoding.length(encoder) > 1) {
          send(ws, encoding.toUint8Array(encoder));
        }

        // If it was a sync step 2, the doc is now in sync — broadcast update to all others
        if (syncMessageType === syncProtocol.messageYjsSyncStep2) {
          // We already applied the update in readSyncMessage
        }
      } else if (msgType === messageAwareness) {
        const update = decoding.readVarUint8Array(decoder);
        awarenessProtocol.applyAwarenessUpdate(room.awareness, update, ws);

        // Broadcast awareness to all other connections
        const awarenessEncoder = encoding.createEncoder();
        encoding.writeVarUint(awarenessEncoder, messageAwareness);
        encoding.writeVarUint8Array(awarenessEncoder, update);
        broadcast(room, encoding.toUint8Array(awarenessEncoder), ws);
      }
    } catch (e) {
      console.error(`[${roomName}] Error handling message:`, e.message);
    }
  });

  // Listen for doc updates and broadcast to all connections in room
  const docUpdateHandler = (update, origin) => {
    if (origin === ws) return; // Don't echo back to sender
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, update);
    broadcast(room, encoding.toUint8Array(encoder));
  };

  room.doc.on('update', docUpdateHandler);

  // Listen for awareness changes and broadcast
  const awarenessChangeHandler = ({ added, updated, removed }, origin) => {
    if (origin === ws) return;
    const changedClients = [...added, ...updated, ...removed];
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(room.awareness, changedClients)
    );
    broadcast(room, encoding.toUint8Array(encoder), ws);
  };

  room.awareness.on('change', awarenessChangeHandler);

  ws.on('close', () => {
    room.connections.delete(ws);
    room.doc.off('update', docUpdateHandler);
    room.awareness.off('change', awarenessChangeHandler);

    // Remove client's awareness state
    awarenessProtocol.removeAwarenessStates(room.awareness, [room.doc.clientID], null);

    if (room.connections.size === 0) {
      // Keep the doc in memory for a while; clean up after timeout if still empty
      setTimeout(() => {
        if (rooms.get(roomName)?.connections.size === 0) {
          rooms.delete(roomName);
          console.log(`[${roomName}] Room cleaned up (no connections).`);
        }
      }, 30000);
    }

    console.log(`[${roomName}] Client disconnected. Remaining: ${room.connections.size}`);
  });

  console.log(`[${roomName}] Client connected. Total: ${room.connections.size}`);
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Yjs Collaboration Server is running.\n');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const roomName = decodeURIComponent(url.pathname.slice(1)) || 'default';
  onConnect(ws, roomName);
});

server.listen(PORT, () => {
  console.log(`✅ Yjs Collaboration Server running at ws://localhost:${PORT}`);
  console.log(`   Open the same doc in multiple browsers to collaborate in real-time!`);
});
