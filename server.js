const express = require('express');
const path = require('path');

class ModernServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.environment = process.env.NODE_ENV || 'development';
    this.startTime = Date.now();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddleware() {
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static files (if you have any)
    this.app.use(express.static('public'));

    // Request logging
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
      next();
    });
  }

  initializeRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      
      res.json({
        status: 'healthy',
        uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
        timestamp: new Date().toISOString(),
        environment: this.environment,
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
        },
        node: process.version
      });
    });

    // API endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        service: 'Lokith API',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        environment: this.environment,
        endpoints: {
          health: '/health',
          api: '/api',
          home: '/'
        }
      });
    });

    // Main route - Serve HTML
    this.app.get('/', (req, res) => {
      res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lokith</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .container {
            text-align: center;
            padding: 2rem;
            animation: fadeIn 1s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }

        p {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 2rem;
        }

        .info {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 1.5rem;
            border-radius: 15px;
            display: inline-block;
        }

        .info-item {
            margin: 0.5rem 0;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello from Lokith</h1>
        <p>Simple & Modern Server Running</p>
        <div class="info">
            <div class="info-item">Version: 1.0.0</div>
            <div class="info-item">Status: Active</div>
            <div class="info-item">Port: ${PORT}</div>
        </div>
    </div>
</body>
</html>`);
    });
  }

  initializeErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });

    // Error handler
    this.app.use((err, req, res, next) => {
      console.error(`[ERROR] ${err.stack}`);
      res.status(err.status || 500).json({
        error: this.environment === 'production' ? 'Internal Server Error' : err.message,
        timestamp: new Date().toISOString()
      });
    });
  }

  start() {
    const server = this.app.listen(this.port, () => {
      console.log('\n🚀 Server Status');
      console.log('=====================================');
      console.log(`✓ Environment: ${this.environment}`);
      console.log(`✓ Port: ${this.port}`);
      console.log(`✓ URL: http://localhost:${this.port}`);
      console.log(`✓ Health: http://localhost:${this.port}/health`);
      console.log(`✓ Started: ${new Date().toISOString()}`);
      console.log('=====================================\n');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    return server;
  }
}

// Start the server
const server = new ModernServer();
server.start();

module.exports = server;
