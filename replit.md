# YouTube Unblocker Application

## Overview

This is a YouTube unblocker application built with a modern full-stack architecture using React (frontend), Express.js (backend), and PostgreSQL (database). The application appears to be designed to help users access YouTube content through privacy-focused embedding, using YouTube's nocookie domain for enhanced privacy.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: TSX for TypeScript execution
- **Build**: ESBuild for production bundling
- **Architecture Pattern**: RESTful API design

### Database Layer
- **Database**: PostgreSQL (configured via Drizzle)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon Database serverless driver

## Key Components

### Frontend Components
1. **Home Page**: Main interface for YouTube URL input and video embedding
2. **UI Components**: Comprehensive Shadcn/ui component library including:
   - Form controls (Input, Button, Select, etc.)
   - Layout components (Card, Dialog, Sheet, etc.)
   - Data display (Table, Toast, Progress, etc.)
   - Navigation (Accordion, Tabs, Menubar, etc.)

### Backend Components
1. **Storage Interface**: Abstracted storage layer with memory-based implementation
2. **User Management**: Basic user schema with username/password authentication
3. **Route Registration**: Modular route setup with error handling
4. **Development Server**: Vite integration for hot reloading

### Core Features
1. **YouTube URL Processing**: Extract video IDs from various YouTube URL formats
2. **Privacy-Focused Embedding**: Uses youtube-nocookie.com domain
3. **Responsive Design**: Mobile-first approach with dark theme
4. **Error Handling**: Comprehensive error states and user feedback

## Data Flow

1. **User Input**: Users paste YouTube URLs into the input field
2. **URL Validation**: Frontend extracts and validates video IDs
3. **Embed Generation**: Creates privacy-focused embed URLs using youtube-nocookie.com
4. **Video Display**: Renders embedded video with custom styling and controls
5. **State Management**: TanStack Query manages API requests and caching

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe ORM for database operations
- **@radix-ui/***: Headless UI component primitives
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tailwindcss**: Utility-first CSS framework
- **eslint**: Code linting and formatting

## Deployment Strategy

### Development
- Uses Vite dev server with hot module replacement
- TypeScript compilation with TSX for server-side execution
- Development-specific error overlays and debugging tools

### Production Build
1. **Frontend**: Vite builds React app to static assets in `dist/public`
2. **Backend**: ESBuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command
4. **Serving**: Express serves both API routes and static frontend assets

### Configuration
- Environment-based configuration using `NODE_ENV`
- Database connection via `DATABASE_URL` environment variable
- Replit-specific optimizations for cloud deployment
- CORS and security middleware for production safety

### Key Architectural Decisions

1. **Monorepo Structure**: Frontend (`client/`), backend (`server/`), and shared (`shared/`) code in single repository
2. **Type Safety**: Full TypeScript coverage with shared types between frontend and backend
3. **Privacy Focus**: Uses YouTube's nocookie domain to minimize tracking
4. **Serverless Ready**: Uses Neon Database for serverless PostgreSQL deployment
5. **Component Architecture**: Modular UI components with consistent design system
6. **Error Boundaries**: Comprehensive error handling at multiple application layers