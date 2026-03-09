import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.SOCKET_PORT || 1234;
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store document content and active users
const docs = new Map(); // docId -> content
const users = new Map(); // socketId -> { name, color, docId }

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', ({ docId, user }) => {
    socket.join(docId);
    users.set(socket.id, { ...user, docId });
    
    console.log(`${user.name} joined room: ${docId}`);

    // Send current content to the new user
    if (docs.has(docId)) {
      socket.emit('document-update', docs.get(docId));
    }

    // Notify others in the room
    const roomUsers = Array.from(users.values()).filter(u => u.docId === docId);
    io.to(docId).emit('users-update', roomUsers);
  });

  socket.on('content-change', ({ docId, content }) => {
    docs.set(docId, content);
    // Broadcast to others in the room
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
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io Server running at http://localhost:${PORT}`);
});
