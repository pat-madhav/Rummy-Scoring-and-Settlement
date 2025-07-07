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
- July 04, 2025: Fixed scoring screen textbox functionality - enabled proper cursor interaction, implemented click-outside dropdown closure, and removed DropdownMenuTrigger wrapping that prevented normal input behavior
- July 04, 2025: Standardized button aesthetics across all pages with consistent styling - added minimum height (56px), enhanced gradients, improved shadows and transitions, and proper fade effects for mobile and desktop platforms
- July 04, 2025: Updated welcome page heading to "Rummy Scorer" (removed subtitle "Scorer")
- July 04, 2025: Fixed player count option buttons sizing to match other option buttons in game rules page
- July 04, 2025: Improved Pack Safe points display to show blank instead of "0" until player enters at least one score
- July 04, 2025: Removed "Rummy Scorer" caption from top bar headers across all pages, now showing only logo
- July 04, 2025: Moved app name "Rummy Scorer" from welcome page main content to status bar for consistency with other pages
- July 04, 2025: Converted all status bar headings from blue-purple gradient to solid purple color for unified theme (text-purple-600 dark:text-purple-400)
- July 04, 2025: Updated unselected buttons to use status bar background color (bg-white dark:bg-gray-800) for visual consistency across all option buttons
- July 04, 2025: Fixed home page layout - "Simple, FREE Rummy Scoring & Settlement" now appears on one line with whitespace-nowrap
- July 04, 2025: Added 3 empty lines between caption and creator attribution on home page as requested
- July 04, 2025: Converted all status bar headings to match Main Settings gradient style (bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent) for unified visual theme across entire app
- July 05, 2025: Updated "Advanced Settings" and "Implied Game Rules" headings in Set Game Rules page to match Main Settings blue gradient style for complete visual consistency
- July 05, 2025: Fixed bottom button overlap with tutorial help button by adding pb-20 padding to all pages (welcome, game-options, player-names, scoring, settlement, post-game) to prevent visual conflicts
- July 05, 2025: Completely removed gamified tutorial system including TutorialProvider, TutorialButton, Tutorial components, and all tutorial-related imports from App.tsx and individual pages to eliminate floating question mark button
- July 05, 2025: Standardized all main navigation buttons across app flow to use consistent positioning (fixed bottom-6) and sizing (70% horizontal width) with uniform button dimensions and styling for optimal mobile navigation experience
- July 05, 2025: Fixed scoring page dropdown behavior to close all other dropdown menus when opening a new score input box, preventing multiple dropdowns from staying open simultaneously
- July 05, 2025: Implemented comprehensive dropdown management fix using useCallback hooks and setTimeout to prevent React rendering conflicts that were causing dropdowns to remain open randomly
- July 05, 2025: Applied blue gradient color styling to all scoring page table headers (Round, player names, Total, Points left, Packs, Pack Safe) for consistent visual theme
- July 05, 2025: Added "Remove" button functionality for completed rounds with red styling, appears alongside "Edit" button on hover, includes confirmation dialog and automatic current round adjustment
- July 05, 2025: Updated hover button positioning to vertically stack Edit and Remove buttons to the immediate right of Round number within table row for better visual organization
- July 05, 2025: Fixed button sizing inconsistency between player count buttons and other option buttons in game settings page for unified visual appearance
- July 05, 2025: Updated home page card width from max-w-md to max-w-2xl to match the consistent card sizing used across other pages
- July 05, 2025: Fixed scoring page editing functionality - score inputs for previous rounds are now properly disabled until Edit button is clicked, ensuring clear editing state and preventing input confusion
- July 05, 2025: Fixed dropdown behavior to close all open dropdowns when clicking on a different score input box, preventing multiple dropdowns from staying open simultaneously
- July 06, 2025: Added minimum score validation (scores must be 0 or >= 2) with popup message when user completes entry (onBlur event)
- July 06, 2025: Renamed "Restart Game" button to "Restart" for cleaner UI
- July 06, 2025: Updated button colors - "Settle Game" uses standard blue, "Restart" uses light red
- July 06, 2025: Added dynamic button behavior - when only 1 player remains, "Restart" transforms to "Finish" with pulsating animation to prompt game completion
- July 06, 2025: Implemented Rummy restriction - once a player enters Rummy (0) in a round, that option is disabled for all other players in the same round
- July 06, 2025: Added red border validation for invalid scores (like 1) - shows red border on blur, clears when user starts typing to correct
- July 06, 2025: Enhanced dropdown positioning for score options - dropdowns now appear to the right or left of input boxes instead of below, preventing options from wrapping to multiple lines and improving usability
- July 06, 2025: Updated Set Game Rules page styling - added black background card container to match other pages, made all unselected buttons consistently gray, updated label colors for consistent theme
- July 06, 2025: Fixed scoring page "Round" heading font size to match player names in header row (changed from text-sm to text-lg font-bold)
- July 06, 2025: Fixed scoring page display issue where completed round scores for "Out" players were incorrectly showing "Out" instead of their actual numeric scores
- July 06, 2025: Fixed Set Game Rules page structure - removed currency dropdown from Buy-in Amount, removed duplicate "All Jokers Type" from Advanced Settings, restored proper "Other Settings" section with double points settings and Re-entry Allowed
- July 06, 2025: Restored complete Set Game Rules functionality from previous checkpoint - added back conditional Joker Type sub-options, restored proper Implied Game Rules with correct conditional rules based on selections
- July 06, 2025: Updated Set Game Rules page structure to match screenshots exactly - removed conditional Joker Type sub-options, made "All Jokers Full Money" a direct Main Settings toggle, restructured Advanced Settings with proper section headers and labels ("All Trips w/o Joker", "All Sequences w/o Joker")
- July 06, 2025: Restored conditional Joker Type sub-options - "All Jokers Full Money" appears indented when "Opposite" selected, "All Jokers Type" with Closed/Open buttons appears indented when "All" selected
- July 06, 2025: Added shaded background pane to Advanced Settings section matching screenshot design
- July 06, 2025: Fixed "All Jokers Full Money" to default to toggled on (true) instead of off when "Opposite" joker type is selected
- July 06, 2025: Fixed Full-Count rule text visibility issue in Implied Game Rules - changed from nested list to block spans with proper whitespace handling to ensure complete text display
- July 06, 2025: Improved UI spacing - changed Advanced Settings and Implied Game Rules sections to use consistent py-4 (padding top and bottom) for equal spacing
- July 06, 2025: Enhanced Advanced Settings animation - added smooth glide-down effect with duration-500 and slide animations for seamless expansion/collapse
- July 06, 2025: Implemented proper Radix UI Collapsible animation using CSS variables - added collapsible-down and collapsible-up keyframes to tailwind.config.ts with 0.3s duration to match deployment timing
- July 06, 2025: Made "Implied Game Rules" section collapsible with automatic slide-out animation when landing on Set Game Rules page, matching behavior of other sections
- July 06, 2025: Fixed Advanced Settings heading position to stay in place when expanded instead of moving to top
- July 06, 2025: Updated Pack Safe logic to show empty when player's total score >= Max Points - 1, preventing Pack Safe display for players near the point limit
- July 06, 2025: Fixed scoring display for "Out" players - subsequent rounds now show "-" instead of score input boxes for players who went out in previous rounds
- July 06, 2025: Updated player names page buttons with consistent light grey styling (Clear All Names and Default Names) to match app-wide button design and fixed bottom padding consistency
- July 06, 2025: Implemented responsive button sizing - mobile devices use 70% width, tablets/desktops use fixed 3-inch width buttons for consistent sizing across devices
- July 06, 2025: Added symmetrical gradient fade effect on both top and bottom of navigation buttons for enhanced visual aesthetics
- July 06, 2025: Updated scoring page dropdown position so top corner of options menu aligns with bottom corner of score box - top-left of dropdown at bottom-right of score box (default), top-right of dropdown at bottom-left of score box (rightmost players)
- July 06, 2025: Fixed dropdown behavior to close all other dropdowns when clicking on any scorebox, preventing multiple dropdowns from staying open simultaneously
- July 06, 2025: Enhanced dropdown positioning to avoid blocking same column (for total score visibility) and current round row (for all player scores visibility) - dropdowns now appear above and to the side of score boxes
- July 07, 2025: Added 3rd criteria for dropdown positioning - dropdowns now avoid blocking player names header row by positioning below score boxes instead of above
- July 07, 2025: Fixed dropdown positioning logic to ensure all three criteria apply to every player's score box - first player positions right, last player positions left, middle players position right, all below their score boxes
- July 07, 2025: Standardized player column widths to match "Out" player column width - all player columns now have consistent w-32 width including headers, scoring cells, and footer cells
- July 07, 2025: Removed scoring arrows from input boxes by changing input type from "number" to "text"
- July 07, 2025: Reduced player column width from w-28 (112px) to w-24 (96px), then further to w-20 (80px) for more compact table layout
- July 07, 2025: Made table width dynamic using table-auto and centered table on screen with flex justify-center wrapper
- July 07, 2025: Implemented responsive table width constraints - mobile: 95%, desktop: 80%
- July 07, 2025: Added Excel-like freeze pane functionality for leftmost column - Round, Total, Points left, Packs, Pack Safe headers stay sticky while player columns scroll horizontally
- July 07, 2025: Fixed Excel freeze pane implementation - created custom CSS components with proper isolation and z-index layering to ensure leftmost column completely hides scrolling content
- July 07, 2025: Applied sticky positioning to state row and gave scoring rows (both previous and current rounds) black backgrounds in leftmost column for better visibility
- July 07, 2025: Fixed all previous round numbers to be properly sticky, added "Status" heading to state row with blue gradient color, and implemented prominent 3px inner border on leftmost column using pseudo-element to ensure it stays visible during scrolling
- July 07, 2025: Updated all round numbers (both previous and current rounds) to display with blue gradient color matching other column headings
- July 07, 2025: Changed all scoring page headings from gradient to solid bright blue color (text-blue-400) for better visibility against dark backgrounds
- July 07, 2025: Fixed scoring timing issue where round would advance prematurely while entering last player's score - now waits for user to finish input (blur event) before checking round advancement
- July 07, 2025: Center-aligned all elements in player scoring columns including player names, re-entry buttons, and score input boxes using text-center and flex justify-center
- July 07, 2025: Center-aligned all leftmost column elements (Round, Status, Total, Points left, Packs, Pack Safe) for consistent table alignment