# Rummy Scorer - A Full-Stack Card Game Scoring Application

## Overview

Rummy Scorer is a comprehensive web application designed to manage and track scores for rummy card games. It provides a complete solution for creating games, managing players, recording scores across multiple rounds, and calculating final settlements with monetary distributions.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom theming (light/dark mode support)
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **API**: RESTful API design with structured error handling
- **Development**: Hot reload with Vite middleware integration

## Key Components

### Database Schema
The application uses a relational database structure with the following key tables:
- **games**: Core game configuration and settings
- **gamePlayers**: Player information and status for each game
- **gameRounds**: Round tracking for scoring organization
- **gameScores**: Individual player scores per round
- **gameSettlements**: Final settlement calculations and distributions

### Game Configuration System
- Flexible point system (pack points, mid-pack points, full count points)
- Customizable joker types and sequence requirements
- Monetary buy-in system with multi-currency support
- Advanced rule configurations (double points, re-entry allowance)

### Scoring Engine
- Real-time score calculation and validation
- Player status management (active/inactive/re-entered)
- Pack-based scoring system with residual point tracking
- Settlement algorithm for monetary distribution

### User Interface
- Progressive web app design with mobile-first approach
- Multi-step game creation wizard
- Real-time scoring interface with input validation
- Settlement summary with sharing capabilities
- Dark/light theme toggle

## Data Flow

1. **Game Creation**: User configures game settings → Frontend validates and creates game record → Backend stores in database
2. **Player Management**: Players added to game → Status tracked throughout game lifecycle → Re-entry conditions validated
3. **Score Recording**: Scores entered per round → Real-time calculation of totals and remaining points → Automatic game completion detection
4. **Settlement**: Final scores calculated → Monetary distribution computed → Results available for sharing

## External Dependencies

### Frontend Dependencies
- **UI Components**: @radix-ui/* packages for accessible component primitives
- **State Management**: @tanstack/react-query for server state synchronization
- **Styling**: tailwindcss, class-variance-authority, clsx for styling utilities
- **Form Handling**: @hookform/resolvers, react-hook-form for form validation
- **Date Utilities**: date-fns for date manipulation

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **ORM**: drizzle-orm with drizzle-zod for schema validation
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session store
- **Development**: tsx for TypeScript execution, esbuild for production builds

## Deployment Strategy

### Development Environment
- Vite dev server with HMR (Hot Module Replacement)
- Express server with development middleware
- Automatic database migrations with Drizzle Kit
- Replit-specific development tools integration

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- esbuild bundles server code with external dependencies
- Single-command deployment with `npm run build` and `npm start`
- Environment-based configuration for database connections

### Database Management
- Schema-first approach with Drizzle ORM
- Automatic migration generation and execution
- Type-safe database operations with full TypeScript integration
- Connection pooling for performance optimization

## Changelog

- July 02, 2025. Initial setup and complete rummy scoring application implementation
- July 02, 2025. UI/UX improvements: updated headers, game settings section, full-count options, localStorage persistence for game options

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates

- Updated UI labels: "Points" → "Game Settings", "For Points" → "Max Points", "Set CLUB Game Rules" → "Set Game Rules"
- Enhanced Full-Count selection with 80/Full-Count button options
- Fixed pack calculation to use ROUNDDOWN formula (Math.floor)
- Improved Advanced Settings with proper joker type options and sequence count buttons
- Added localStorage persistence for buy-in amounts and all game options
- Fixed routing issues for game ID parameters
- Added "Other Settings" section organization in Advanced Settings