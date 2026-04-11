// Module: index | Responsibility: Bootstrap Express server, security middleware, API routes, DB, and Socket.IO alerts.
const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const { verifyAuthToken } = require('./utils/jwtHelper');

const env = require('./config/env');
const connectDB = require('./config/db');
const { globalLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const fraudRoutes = require('./routes/fraud');

const allowedOrigins = [env.clientUrl, 'http://127.0.0.1:5173'];
const adminRoutes = require('./routes/admin');
const disputeRoutes = require('./routes/dispute');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

app.use(express.json({ limit: '1mb' }));
app.use(helmet()); // LAYER 7
app.use(cors({ origin: allowedOrigins, credentials: true })); // LAYER 7
app.use(globalLimiter);
// LAYER 7: Hardening headers and CORS applied globally

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'secure-wallet-backend is running' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'secure-wallet-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dispute', disputeRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  return res.status(status).json({
    message: err.message || 'Internal server error.'
  });
});

io.on('connection', (socket) => {
  const token = socket.handshake.auth?.token;

  if (token) {
    try {
      const payload = verifyAuthToken(token);
      socket.data.userId = payload.userId;
      socket.data.role = payload.role;
      socket.join(`user:${payload.userId}`);
      if (payload.role === 'admin') {
        socket.join('admin');
      }
    } catch (error) {
      socket.disconnect(true);
      return;
    }
  }

  socket.on('join_room', ({ userId, role }) => {
    if (socket.data.userId && socket.data.userId === userId) {
      socket.join(`user:${userId}`);
    }
    if (socket.data.role === 'admin' && role === 'admin') {
      socket.join('admin');
    }
  });

  socket.emit('connected', { message: 'Fraud alert channel connected.' });
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
