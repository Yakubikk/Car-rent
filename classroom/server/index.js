import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import classRoutes from './routes/classes.js';
import postRoutes from './routes/posts.js';
import assignmentRoutes from './routes/assignments.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Set up Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/assignments', assignmentRoutes);

// Error handling middleware
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Authentication handling
  const token = socket.handshake.auth.token;
  // Here we would validate the token and store user info if needed
  
  // Class subscription
  socket.on('subscribe:class', ({ classId }) => {
    socket.join(`class:${classId}`);
    console.log(`User ${socket.id} subscribed to class ${classId}`);
  });
  
  socket.on('unsubscribe:class', ({ classId }) => {
    socket.leave(`class:${classId}`);
    console.log(`User ${socket.id} unsubscribed from class ${classId}`);
  });
  
  // Assignment subscription
  socket.on('subscribe:assignment', ({ assignmentId }) => {
    socket.join(`assignment:${assignmentId}`);
    console.log(`User ${socket.id} subscribed to assignment ${assignmentId}`);
  });
  
  socket.on('unsubscribe:assignment', ({ assignmentId }) => {
    socket.leave(`assignment:${assignmentId}`);
    console.log(`User ${socket.id} unsubscribed from assignment ${assignmentId}`);
  });
  
  // Disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for testing
export { app, server, io };
