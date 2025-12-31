
# JOSH-Net Frontend


**JOSH-Net Frontend Website built on NextJS**


----------

## Table of Contents

-   [Overview](#overview)
-   [Project Structure](#project-structure)
-   [Architecture](#architecture)
-   [Routing](#routing)
-   [Deployment](#deployment)

----------

## Overview

The JOSH-Net frontend is a modern, responsive web application built with Next.js 14, leveraging the App Router for optimal performance and user experience. It provides an intuitive interface for students to access academic resources, track performance, communicate with peers, and interact with AI assistance.

### Key Features

-   **Modern UI**: Beautiful, responsive design with Tailwind CSS
-   **Fast Performance**: Server-side rendering and optimization
-   **Real-time Updates**: WebSocket integration for real-time communication
-   **Mobile Responsive**: Optimized for all device sizes
-   **Dark Mode**: Automatic theme switching
-   **AI Integration**: Seamless Josephine chatbot interface

---

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Global styles
│   │
│   ├── auth/                    # Authentication pages
│   │   ├── layout.tsx          # Auth layout
│   │   ├── page.tsx            # Login/Register
│   │   ├── callback/           # OAuth callback
│   │   └── error/              # Auth error page
│   │
│   ├── student/                 # Student portal
│   │   ├── layout.tsx          # Student layout with sidebar
│   │   ├── dashboard/          # Dashboard page
│   │   ├── attendance/         # Attendance tracking
│   │   ├── materials/          # Academic materials
│   │   │   ├── layout.tsx     # Materials layout
│   │   │   └── page.tsx       # Materials list
│   │   │
│   │   ├── server/             # Social servers
│   │   │   ├── layout.tsx     # Server layout
│   │   │   └── page.tsx       # Server view
│   │   │
│   │   └── josephine/          # AI Chatbot
│   │       ├── layout.tsx     # Josephine layout
│   │       ├── new/           # New chat
│   │       ├── chats/         # All chats
│   │       ├── chat/[id]/     # Specific chat
│   │       └── share/[id]/    # Shared chat
│   │
│   └── admin/                   # Admin portal
│       ├── layout.tsx          # Admin layout
│       └── dashboard/          # Admin dashboard
│
├── public/                      # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
└── src/                         # Source code
    ├── components/              # React components
    │   ├── pages/              # Page-specific components
    │   │   ├── Landing/       # Landing page components
    │   │   ├── Auth/          # Auth components
    │   │   ├── Student/       # Student portal components
    │   │   │   ├── Dashboard/
    │   │   │   ├── Materials/
    │   │   │   ├── Josephine/
    │   │   │   ├── Server/
    │   │   │   ├── header.tsx
    │   │   │   └── sidebar.tsx
    │   │   └── Admin/         # Admin components
    │   │
    │   └── shared/             # Reusable components
    │       ├── Notification/
    │       └── ...
    │
    ├── context/                 # Context providers
    │   ├── josephine.provider.tsx
    │   ├── material.provider.tsx
    │   └── server.provider.tsx
    │
    ├── hooks/                   # Custom React hooks
    │   ├── usePageTitle.ts
    │   ├── useAuth.ts
    │   └── useWebSocket.ts
    │
    ├── store/                   # Redux store
    │   ├── index.ts
    │   ├── slices/
    │   │   ├── authSlice.ts
    │   │   ├── chatSlice.ts
    │   │   └── ...
    │   └── providers/
    │       ├── providers.tsx
    │       ├── PersistProvider.tsx
    │       └── PublicRoute.tsx
    │
    ├── ui/                      # UI component library
    │   ├── button.tsx
    │   ├── input.tsx
    │   ├── sidebar.tsx
    │   └── ...
    │
    ├── lib/                     # Utilities & helpers
    │   ├── api.ts
    │   ├── socket.ts
    │   └── utils.ts
    │
    └── types/                   # TypeScript types
        ├── user.types.ts
        ├── chat.types.ts
        └── ...

```

----------

##  Architecture

### Component Architecture

![High Level Web PWA Architecture Diagram](/images/high-level-web-pwa-architecture.png "High Level Web PWA Architecture2")

### Data Flow

```
User Action
    │
    ▼
Component (React)
    │
    ├─→ Local State (useState/useReducer)
    │
    ├─→ Context (React Context)
    │
    ├─→ Redux Store (Global State)
    │       │
    │       ├─→ Thunk (Async Actions)
    │       │       │
    │       │       ▼
    │       │   API Call (Axios)
    │       │       │
    │       │       ▼
    │       │   Backend API
    │       │
    │       └─→ State Update
    │               │
    │               ▼
    │           Component Re-render
    │
    └─→ WebSocket (Socket.IO)
            │
            ▼
        Real-time Updates

```

----------


## Routing

### App Router Structure

Next.js 14 uses the App Router with file-based routing:

```
app/
├── layout.tsx                 # Root layout (applies to all pages)
├── page.tsx                   # Homepage (/)
│
├── auth/
│   ├── layout.tsx            # Auth-specific layout
│   └── page.tsx              # Login/Register (/auth)
│
├── student/
│   ├── layout.tsx            # Student layout with sidebar
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard (/student/dashboard)
│   │
│   └── josephine/
│       ├── layout.tsx        # Josephine-specific layout
│       ├── new/
│       │   └── page.tsx      # New chat (/student/josephine/new)
│       └── chat/[id]/
│           └── page.tsx      # Chat detail (/student/josephine/chat/123)



--------
```
----------

## Deployment

### Vercel (Recommended)

1.  **Push to GitHub**
    
    ```bash
    git push origin main
    
    ```
    
2.  **Import to Vercel**
    
    -   Visit [vercel.com](https://vercel.com/)
    -   Import GitHub repository
    -   Vercel auto-detects Next.js
3.  **Configure Environment Variables**
    
    -   Add all environment variables from `.env.local`
    -   Set production API URL
4.  **Deploy**
    
    -   Automatic deployment on every push
    -   Preview deployments for PRs

### Build Commands

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}

```

----

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/whyismeleige/josh-net/blob/main/LICENSE.txt) file for details.

----------

## Support

For issues and questions:

-   Create an issue on GitHub
-   Email: pjain.work@proton.me

----------

**Crafted with ⚛️ by JOSH-Net Team**
