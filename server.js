const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Store document content and active users (moved from socket-server.mjs)
const docs = new Map(); // docId -> content
const users = new Map(); // socketId -> { name, color, docId }

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Attach Socket.io to the SAME httpServer
  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', ({ docId, user }) => {
      socket.join(docId);
      users.set(socket.id, { ...user, docId });
      
      if (docs.has(docId)) {
        socket.emit('document-update', docs.get(docId));
      }

      const roomUsers = Array.from(users.values()).filter(u => u.docId === docId);
      io.to(docId).emit('users-update', roomUsers);
    });

    socket.on('content-change', ({ docId, content }) => {
      docs.set(docId, content);
      socket.to(docId).emit('document-update', content);
    });

    socket.on('disconnect', () => {
      const user = users.get(socket.id);
      if (user) {
        const { docId } = user;
        users.delete(socket.id);
        const roomUsers = Array.from(users.values()).filter(u => u.docId === docId);
        io.to(docId).emit('users-update', roomUsers);
      }
    });
  });

  const PORT = process.env.PORT || 3007;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Unified Server ready on http://localhost:${PORT}`);
  });
});
