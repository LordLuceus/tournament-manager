# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Architecture

This is a Next.js 15 tournament management application that manages single-elimination tournaments with the following core architecture:

### State Management & Flow
- Main application state managed in `src/app/page.tsx` with React hooks
- Tournament phases: `menu` → `setup` → `bracket-generation` → `tournament` → `complete`
- Auto-save functionality persists tournament state to localStorage during active tournaments

### Core Tournament Logic
- **Tournament generation**: `src/lib/tournament.ts` handles bracket creation and winner advancement
- **Persistence**: `src/lib/persistence.ts` manages localStorage operations and tournament serialization
- **Type definitions**: `src/types/tournament.ts` defines `Tournament`, `Match`, `Contestant` interfaces

### Component Structure
- **Phase-based rendering**: Each tournament phase has dedicated components
- **BracketDisplay**: Main tournament visualization component
- **MatchCard**: Individual match interface with winner selection and match reporting
- Components follow Next.js App Router patterns with client-side state management

### Tournament Sharing System
- API routes in `src/app/api/tournament/` handle tournament sharing
- Completed tournaments can be shared publicly via generated URLs
- Shared tournaments stored in filesystem at `/shared-tournaments/` directory
- Docker volume mounts `./data/shared-tournaments:/app/shared-tournaments`

### Docker Configuration
- Multi-stage build using Node.js 22 and pnpm
- Production container exposes port 3000
- Uses pnpm for package management instead of npm

### Key Technical Details
- TypeScript throughout with strict mode enabled
- Tailwind CSS for styling with dark mode support
- Client-side only application (no SSR for tournament logic)
- localStorage used for tournament persistence with 10-save limit
- Tournament bracket algorithm supports any number of contestants with bye handling