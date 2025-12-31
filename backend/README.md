# JOSH-Net Backend

**Node.js/Express REST API with WebSocket Support**

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)

---

## Overview

The JOSH-Net backend is a robust RESTful API built with Node.js and Express.js that powers the entire platform. It handles authentication, academic resource management, real-time communication, and AI integration.

### Key Features

- **Secure Authentication**: JWT-based auth with refresh tokens, OAuth, and 2FA
- **Academic Management**: Material uploads, attendance tracking, results management
- **Real-time Communication**: WebSocket-based messaging and notifications
- **AI Integration**: Anthropic Claude API for intelligent chatbot
- **File Storage**: AWS S3 integration for secure file management
- **Performance**: Redis caching for optimized response times
- **Web Scraping**: Automated data extraction from college portal

---

## Architecture

### High-Level Architecture

![High Level Backend Architecture Diagram](/images/high-level-backend-architecture.png "High Level Backend Architecture Diagram")

### Layer Responsibilities

1.  **Routes**: Define endpoints and map to controllers
2.  **Middleware**: Authentication, validation, file upload handling
3.  **Controllers**: Request/response handling and orchestration
4.  **Services**: External API integration, complex business logic
5.  **Models**: MongoDB schemas and data operations
6.  **Utils**: Helper functions and utilities

---

## Project Structure

```
backend/
├── config/                 # Configuration files
│   └── s3.config.js       # AWS S3 client setup
│
├── controllers/           # Request handlers
│   ├── auth.controller.js        # Authentication logic
│   ├── josephine.controller.js   # AI chatbot logic
│   ├── materials.controller.js   # Academic materials
│   ├── server.controller.js      # Server management
│   └── inbox.controller.js       # Social features
│
├── database/              # Database connections
│   ├── connectDB.js      # MongoDB connection
│   └── redis.js          # Redis client setup
│
├── middleware/            # Custom middleware
│   ├── auth.middleware.js        # JWT verification
│   ├── upload.middleware.js      # File upload handling
│   ├── material.middleware.js    # Material validation
│   └── voice.middleware.js       # Voice file handling
│
├── models/                # MongoDB schemas
│   ├── user.model.js     # User schema
│   ├── chat.model.js     # Chat conversation schema
│   ├── material.model.js # Academic material schema
│   ├── server.model.js   # Server schema
│   ├── channel.model.js  # Channel schema
│   ├── message.model.js  # Message schema
│   ├── otp.model.js      # OTP verification schema
│   └── index.js          # Model exports
│
├── routes/                # API route definitions
│   ├── auth.routes.js    # Authentication routes
│   ├── josephine.routes.js       # AI chatbot routes
│   ├── materials.routes.js       # Material routes
│   ├── server.routes.js          # Server routes
│   └── inbox.routes.js           # Social routes
│
├── services/              # Business logic & external APIs
│   ├── email.service.js  # Email sending service
│   └── scraper.service.js        # Web scraping service
│
├── sockets/               # WebSocket handlers
│   ├── index.js          # Socket.IO initialization
│   ├── channel.socket.js # Channel events
│   ├── message.socket.js # Message events
│   └── inbox.socket.js   # Inbox events
│
├── tests/                 # Test suites
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── setup/            # Test setup files
│
├── utils/                 # Helper functions
│   ├── auth.utils.js     # Auth helper functions
│   ├── s3.utils.js       # S3 operations
│   └── prompts/          # AI prompts
│       └── josephine.prompts.js
│
├── .env                   # Environment variables
├── .env.example          # Environment template
├── package.json          # Dependencies
├── server.js             # Entry point
└── README.md             # This file

```

---

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/whyismeleige/josh-net/blob/main/LICENSE.txt) file for details.

---

## Support

For issues and questions:

- Create an issue on GitHub
- Email: pjain.work@proton.me

---

**Built with 💙 by JOSH-Net Team**
