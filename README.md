# JOSH-Net

  

**A Comprehensive Network for St. Joseph's Degree and PG College Students**

  

---

  

## Table of Contents

  

-  [About](#about)

-  [Features](#features)

-  [Architecture](#architecture)

-  [Project Structure](#project-structure)

-  [Contributing](#contributing)

-  [Team](#team)

-  [License](#license)

  

---

  

##  About

  

**JOSH-Net** is a comprehensive digital platform designed to enhance the academic experience of students at St. Joseph's Degree and PG College. The platform integrates academic resource management, performance tracking, real-time communication, and AI-powered assistance into a unified web application.

  

### Key Objectives

  

-  Centralized access to study materials and exam papers

-  Interactive attendance and performance tracking

-  Real-time student collaboration through servers and channels

-  AI-powered assistance through Josephine chatbot

-  Smart notifications and alerts system

  

---

  

##  Features

  

###  Academic Management

-  **Resource Repository**: Organized study materials, lecture notes, and previous year question papers

-  **Course Work Management**: Semester-wise, subject-wise material organization

-  **File Upload/Download**: Secure cloud-based file storage with S3 integration

  

### Performance Tracking

-  **Attendance Monitoring**: Real-time attendance tracking with visual analytics

-  **Results Dashboard**: Examination results with CGPA/SGPA calculations

-  **Progress Analytics**: Detailed performance insights and trends

  

###  Social Networking

-  **Server Creation**: Department/class/project-based servers

-  **Real-time Messaging**: WebSocket-based instant communication

-  **Friend System**: Connect with classmates and build study groups

-  **File Sharing**: Share documents and media within conversations

  

###  AI-Powered Assistance

-  **Josephine AI**: RAG-powered AI Chat bot for academic queries

-  **Document Analysis**: PDF attachment support for context-aware responses

-  **Conversation History**: Persistent chat history with search functionality

-  **Smart Titles**: Auto-generated conversation titles


  
---

##  Architecture

  
![High Level Architecture Diagram](/images/high-level-system-architecture.png "a title")

  

### Key Components

  

1.  **Authentication Layer**: JWT-based auth with refresh tokens, OAuth, and 2FA

2.  **Academic Module**: Material management, attendance tracking, results

3.  **Social Module**: Real-time messaging, servers, channels, friend system

4.  **AI Module**: Claude integration for intelligent assistance

5.  **Storage Layer**: MongoDB for structured data, S3 for files, Redis for caching

  

---

  

## Project Structure

  

```

josh-net/

├── backend/ # Node.js/Express backend

│ ├── config/ # Configuration files

│ ├── controllers/ # Route controllers

│ ├── database/ # DB connection & Redis

│ ├── middleware/ # Custom middleware

│ ├── models/ # Mongoose models

│ ├── routes/ # API routes

│ ├── services/ # Business logic & external services

│ ├── sockets/ # WebSocket handlers

│ ├── tests/ # Test suites

│ ├── utils/ # Helper functions

│ └── server.js # Entry point

│

├── frontend/ # Next.js frontend

│ ├── app/ # App router pages

│ ├── public/ # Static assets

│ └── src/

│ ├── components/ # React components

│ ├── context/ # Context providers

│ ├── hooks/ # Custom hooks

│ ├── store/ # Redux store

│ └── ui/ # UI components

│

└── README.md # This file

```

---

  



  

## Team

  

**JOSH-Net** is developed by students of St. Joseph's Degree and PG College:

 

**Piyush Jain**  --- [Github](https://github.com/whyismeleige)

**Bobby Anthene Rao** --- [Github](https://github.com/noturbob) 

**K Vyshnavi**  --- [Github](https://github.com/vyshnavi0907)

  

---

  

##  License

  

This project is licensed under the MIT License - see the [LICENSE](https://github.com/whyismeleige/josh-net/blob/main/LICENSE.txt) file for details.

  
  

---

  

##  Support

  

For support, email us at:

- Piyush Jain: pjain.work@proton.me

- Bobby Anthene Rao: bobbyanthene@gmail.com

- K Vyshnavi: 

  

---



**Made with ❤️ by JOSH-Net Team**

  

[Report Bug](https://github.com/your-username/josh-net/issues) · [Request Feature](https://github.com/your-username/josh-net/issues)

