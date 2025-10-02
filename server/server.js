import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app = express();

// Connect Cloudinary
await connectCloudinary();

// Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Test route
app.get('/', (req, res) => res.send('Server is Live!'));

// Mount user routes under /api/user with authentication
// Now /api/user/get-published-creations matches frontend
app.use('/api/user', requireAuth(), userRouter);

// Mount AI routes under /api/ai
// Protect with auth if needed, or leave unprotected
app.use('/api/ai', aiRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
