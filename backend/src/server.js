const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const { setSocketIO: setNotificationSocketIO } = require('./services/notificationService');
const { setSocketIO: setMessageSocketIO } = require('./controllers/messageController');

// Initialize HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.clientUrl || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Inject Socket.IO instance to notification and messaging services
setNotificationSocketIO(io);
setMessageSocketIO(io);

// Socket.IO Authentication & Connection Handlers
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId = decoded.id;
      return next();
    } catch (err) {
      console.warn('[Socket Auth Failed]: Invalid Token');
    }
  }
  next();
});

io.on('connection', (socket) => {
  if (socket.userId) {
    // Join personal user notification room
    socket.join(`user_${socket.userId}`);
    console.log(`[Socket Connected] User ${socket.userId} joined user_${socket.userId}`);
  }

  // Join a specific conversation room for real-time chat
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  // Real-time typing indicators
  socket.on('typing_start', ({ conversationId, userName }) => {
    socket.to(`conversation_${conversationId}`).emit('user_typing', { conversationId, userName, isTyping: true });
  });

  socket.on('typing_stop', ({ conversationId, userName }) => {
    socket.to(`conversation_${conversationId}`).emit('user_typing', { conversationId, userName, isTyping: false });
  });

  socket.on('disconnect', () => {
    // disconnected
  });
});

// Start Server after connecting to Database
const startServer = async () => {
  await connectDB();
  const PORT = config.port;
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Alumni-Student Portal API Server running on port ${PORT}`);
    console.log(`📡 Environment: ${config.nodeEnv}`);
    console.log(`🌐 Client URL: ${config.clientUrl}`);
    console.log(`======================================================\n`);
  });
};

startServer();

module.exports = { app, server, io };
