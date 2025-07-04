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
- July 03, 2025: Implemented select-all functionality for all text inputs and textareas
- July 03, 2025: Removed "Min Sequences Count" setting, replaced with detailed implied Rule 1 about sequence requirements
- July 03, 2025: Added comprehensive sequence rules with bulleted sub-points explaining joker allowances and exceptions
- July 04, 2025: Updated home page caption to "Scoring & Settlement made simple"
- July 04, 2025: Enhanced section headings with gradient colors - Main Settings (blue), Advanced Settings (purple), Implied Game Rules (green)
- July 04, 2025: Added animated slidedown rules for Joker Type with conditional display based on selection
- July 04, 2025: Implemented mobile-optimized sticky buttons for all pages with proper sizing and positioning
- July 04, 2025: Added mobile-specific CSS optimizations for button groups, inputs, and content spacing
- July 04, 2025: Updated Default Names functionality to only fill empty player name fields
- July 04, 2025: Enhanced home page with "Simple, FREE Rummy Scoring & Settlement" caption and added creator attribution with gradient styling
- July 04, 2025: Fixed player names page alignment issues by moving Clear/Default buttons outside sticky section
- July 04, 2025: Fixed player count mismatch bug by ensuring only selected number of players are created in game
- July 04, 2025: Updated Joker Type rule with joker emoji and clearer timing description
- July 04, 2025: Added dark background to game options settings sections matching player names page
- July 04, 2025: Fixed spacing issue between player names card and sticky button section with proper gap
- July 04, 2025: Implemented fade effect for sticky bottom buttons instead of border lines for better visual flow
- July 04, 2025: Applied subtle fade effect consistently across all pages (game options, player names, settlement, post-game) for unified aesthetic
- July 04, 2025: Reduced fade intensity and height to create more invisible bottom section as requested
- July 04, 2025: Fixed critical player count bug where scoring page showed players from previous games instead of current selection
- July 04, 2025: Updated startNewGame function to only create players up to the selected playerCount using .slice()
- July 04, 2025: Fixed Pack Safe section to only show "Pack Safe" message when player has entered at least one score
- July 04, 2025: Added sticky bottom positioning to scoring page buttons with fade effect for consistent mobile experience
- July 04, 2025: Enhanced scoring textboxes with dual functionality - dropdown options appear on focus, typing closes dropdown and allows direct input
- July 04, 2025: Implemented intelligent dropdown state management that maintains all validation rules for both option selection and manual typing
- July 04, 2025: Updated "Number of players" label to "Players" in game options page
- July 04, 2025: Implemented comprehensive gamified tutorial system with interactive tooltips, progress tracking, points system, and guided user onboarding across all pages