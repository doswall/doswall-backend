import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { query } from './src/db.js';
import { createWIBTime } from './src/lib/lib.js';
import router_appKey from './src/routes/router_appKey.js';
import router_secured from './src/routes/router_secured.js';

// Initialize Express app
const app = express();
dotenv.config();

// Security Middlewares
app.use(cors()); // Enable CORS for all routes
app.use(express.json());


// Token verification middleware
const verifyToken = async (req, res, next) => {
   const { token, appkey, _id } = req.body;

   if (!token || !appkey || !_id) {
      return res.status(400).json({
         success: false,
         message: 'Unauthorized'
      });
   }

   // Verify app key
   if (appkey !== process.env.APP_KEY) {
      return res.status(403).json({
         success: false,
         message: 'Unauthorized'
      });
   }

   try {
      // Verify token belongs to user with _id
      const result = await query(
         'SELECT * FROM accounts_tb WHERE token = ? AND user_id = ?',
         [token, _id]
      );

      if (result.length === 0) {
         return res.status(403).json({
            success: false,
            message: 'Unauthorized'
         });
      }

      // Attach user to request for downstream use
      req.user = result[0];
      next();
   } catch (error) {
      console.error('Token verification error:', error);
      return res.status(500).json({
         success: false,
         message: 'Internal server error during authentication'
      });
   }
};


// Route handlers
app.use('/api', verifyToken, router_secured);
app.use(router_appKey);

// Health check endpoint
app.get('/health', (req, res) => {
   res.status(200).json({
      status: 'healthy',
      timestamp: createWIBTime()
   });
});

// 404 handler
app.use((req, res) => {
   res.status(404).json({
      success: false,
      message: 'Resource not found'
   });
});

// Global error handler
app.use((err, req, res, next) => {
   console.error('Global error handler:', err);
   res.status(500).json({
      success: false,
      message: 'Internal server error'
   });
});


// Server initialization
app.listen(0, () => {
   console.log(`Server running `);
});