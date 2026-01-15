# Model Portfolio Dashboard

## Overview

A professional model portfolio management and due diligence platform for financial advisors. The application enables users to analyze holdings, track performance, manage tactical allocations, and execute trades across model portfolios. Built as a full-stack TypeScript application with a React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state, with local React state for UI
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming (light/dark mode support)
- **Design System**: Carbon Design System principles optimized for data-heavy enterprise applications
- **Build Tool**: Vite with HMR support

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Style**: RESTful JSON APIs under `/api/*` prefix
- **Static Serving**: Vite dev server in development, static file serving in production

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Validation**: Zod schemas with drizzle-zod integration
- **Current Storage**: In-memory storage implementation with sample data (see `server/storage.ts`)

### Project Structure
```
client/           # React frontend
  src/
    components/   # Reusable UI components
    pages/        # Route-level page components
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Data access layer
shared/           # Shared types and schemas
  schema.ts       # Drizzle schema and TypeScript types
```

### Key Design Patterns
- **Shared Types**: TypeScript types defined once in `shared/schema.ts`, used by both frontend and backend
- **Component Composition**: UI built from composable shadcn/ui primitives
- **Query-based Data Fetching**: React Query handles caching, refetching, and loading states
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle Kit**: Database migrations and schema pushing (`npm run db:push`)

### UI Libraries
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tabs, etc.)
- **Recharts**: Data visualization for performance charts
- **Embla Carousel**: Carousel functionality
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

### Session & Auth (available but not fully implemented)
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store
- **passport / passport-local**: Authentication framework

## Recent Changes

### January 2026
- **Y-Charts API Integration**: Added Y-Charts API service for fetching real financial data
  - API service with proper authentication using `X-YCHARTSAUTHORIZATION` header
  - Endpoints for fund holdings, metrics, and connection testing
  - Caching layer with 1-hour TTL to minimize API calls
  - Graceful fallback to sample data when API is unavailable
  - Settings page (`/settings`) for testing API connection status

- **CSV Import/Export**: Added ability to import model portfolios from CSV files and export models/securities to CSV
  - Export individual model holdings from model detail page
  - Export all models summary and securities list from models page
  - Import models via CSV with automatic security matching
  - Downloadable CSV template for proper import formatting

## Data Source

**Current Status:** The application uses **sample data** stored in-memory (see `server/storage.ts`) with Y-Charts API integration available for real data when configured.

**Sample Data includes:**
- 4 model portfolios with realistic holdings
- 12 securities with performance metrics and underlying holdings for X-ray analysis
- 5 sample trades

**Y-Charts API Integration:**
- Service located at `server/ycharts.ts`
- Requires `YCHARTS_API_KEY` environment variable (REST API key, not Excel Add-in key)
- Test connection status at `/settings` page
- API endpoints available:
  - `GET /api/ycharts/test` - Test API connectivity
  - `GET /api/ycharts/holdings/:symbols` - Get fund holdings
  - `GET /api/ycharts/metrics/:symbols` - Get performance metrics
  - `POST /api/ycharts/cache/clear` - Clear cached data

**Note:** Y-Charts REST API access requires a subscription that includes API functionality. The Excel Add-in API key may not work for REST API calls.