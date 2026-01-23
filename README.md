# Online Lottery System

A modern, real-time online lottery platform built with Next.js 16, TypeScript, and Tailwind CSS.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
  - [Component Hierarchy](#component-hierarchy)
  - [File Structure](#file-structure)
  - [Data Models](#data-models)
  - [State Management](#state-management)
  - [Routes](#routes)
- [Getting Started](#getting-started)
- [Development](#development)

## Overview

The Online Lottery System allows users to purchase lottery tickets, track prize pools in real-time, and automatically execute raffles when funding goals are reached. The system provides a transparent and engaging experience with live progress tracking and winner announcements.

## Features

- **Ticket Purchase System**: Users can purchase multiple tickets with quantity selection
- **Real-time Prize Pool**: Live tracking of current prize pool and progress toward goal
- **Automatic Raffle Execution**: Raffle automatically triggers when goal amount is reached
- **Winner Announcement**: Dramatic winner reveal with confetti and celebration effects
- **Raffle History**: View past raffles and winners
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## Architecture

### Component Hierarchy

```
App
├── Layout (app/layout.tsx)
│   ├── Header
│   │   ├── Navigation
│   │   └── UserWallet
│   └── Footer
│
├── Pages (App Router)
│   ├── Home (/)
│   │   ├── ActiveRaffleDisplay
│   │   │   ├── RaffleHeader
│   │   │   ├── PrizePoolDisplay
│   │   │   │   ├── CurrentAmount
│   │   │   │   ├── GoalAmount
│   │   │   │   └── ProgressBar
│   │   │   ├── TicketPurchaseSection
│   │   │   │   ├── TicketQuantitySelector
│   │   │   │   ├── PriceCalculator
│   │   │   │   └── PurchaseButton
│   │   │   ├── ParticipantsList
│   │   │   │   └── ParticipantCard[]
│   │   │   └── MyTicketsDisplay
│   │   │       └── TicketCard[]
│   │   └── WinnerAnnouncementModal
│   │       ├── ConfettiEffect
│   │       ├── WinnerDetails
│   │       └── PrizeAmount
│   │
│   ├── History (/history)
│   │   ├── RaffleFilters
│   │   └── RaffleHistoryList
│   │       └── RaffleHistoryCard[]
│   │
│   ├── Raffle Detail (/raffle/[id])
│   │   ├── RaffleDetails
│   │   ├── TicketsList
│   │   └── WinnerSection (if completed)
│   │
│   └── Admin (/admin)
│       ├── CreateRaffleForm
│       ├── ActiveRaffleManagement
│       └── RaffleStatistics
│
└── Shared Components
    ├── Button
    ├── Card
    ├── Modal
    ├── Input
    ├── Badge
    ├── Spinner
    └── Toast/Notification
```

### File Structure

```
online-lottery-project/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Home page (active raffle)
│   ├── globals.css                # Global styles + Tailwind
│   │
│   ├── history/
│   │   └── page.tsx               # Raffle history page
│   │
│   ├── raffle/
│   │   └── [id]/
│   │       └── page.tsx           # Individual raffle details
│   │
│   ├── admin/
│   │   └── page.tsx               # Admin dashboard
│   │
│   └── api/                       # API routes
│       ├── raffles/
│       │   ├── route.ts           # GET, POST raffles
│       │   └── [id]/
│       │       └── route.ts       # GET, PATCH, DELETE raffle
│       ├── tickets/
│       │   └── route.ts           # POST purchase ticket
│       └── execute-raffle/
│           └── route.ts           # POST execute raffle
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── UserWallet.tsx
│   │
│   ├── raffle/
│   │   ├── ActiveRaffleDisplay.tsx
│   │   ├── RaffleHeader.tsx
│   │   ├── PrizePoolDisplay.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── TicketPurchaseSection.tsx
│   │   ├── TicketQuantitySelector.tsx
│   │   ├── ParticipantsList.tsx
│   │   ├── ParticipantCard.tsx
│   │   ├── MyTicketsDisplay.tsx
│   │   ├── TicketCard.tsx
│   │   ├── RaffleHistoryCard.tsx
│   │   └── WinnerAnnouncementModal.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       ├── Input.tsx
│       ├── Badge.tsx
│       ├── Spinner.tsx
│       └── Toast.tsx
│
├── types/
│   └── lottery.ts                 # All lottery-related type definitions
│
├── lib/
│   ├── utils/
│   │   ├── calculations.ts        # Prize pool, percentage calculations
│   │   ├── formatting.ts          # Currency, date formatting
│   │   └── validation.ts          # Input validation
│   │
│   └── api/
│       ├── raffles.ts             # Raffle API client functions
│       └── tickets.ts             # Ticket API client functions
│
├── public/
│   └── images/
│       ├── lottery-icon.svg
│       └── winner-trophy.svg
│
└── tests/
    ├── components/
    ├── types/
    ├── lib/
    └── integration/
```

### Data Models

#### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  walletBalance: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Raffle
```typescript
interface Raffle {
  id: string;
  title: string;
  description: string;
  ticketPrice: number;          // Price per ticket in currency
  goalAmount: number;            // Target amount to reach
  currentAmount: number;         // Current prize pool
  ticketsSold: number;          // Total tickets sold
  maxTickets?: number;          // Optional max tickets limit
  startDate: Date;
  endDate?: Date;               // Optional end date
  status: RaffleStatus;         // 'active' | 'completed' | 'cancelled'
  winnerId?: string;            // Winner user ID (when completed)
  winningTicketId?: string;     // Winning ticket ID
  executedAt?: Date;            // When raffle was executed
  createdAt: Date;
  updatedAt: Date;
}

type RaffleStatus = 'active' | 'completed' | 'cancelled';
```

#### Ticket
```typescript
interface Ticket {
  id: string;
  raffleId: string;
  userId: string;
  ticketNumber: number;         // Unique sequential number for this raffle
  purchaseAmount: number;       // Amount paid for this ticket
  purchaseDate: Date;
  isWinner: boolean;            // True if this ticket won
}
```

#### PurchaseTransaction
```typescript
interface PurchaseTransaction {
  id: string;
  userId: string;
  raffleId: string;
  ticketIds: string[];          // Array of purchased ticket IDs
  quantity: number;
  totalAmount: number;
  transactionDate: Date;
  status: TransactionStatus;    // 'pending' | 'completed' | 'failed'
}

type TransactionStatus = 'pending' | 'completed' | 'failed';
```

#### Winner
```typescript
interface Winner {
  id: string;
  raffleId: string;
  userId: string;
  ticketId: string;
  prizeAmount: number;
  announcedAt: Date;
  claimedAt?: Date;
}
```

### State Management

The application uses a **simple, straightforward approach** with React's built-in hooks:

#### **useState for Component State**
We'll use `useState` to manage state at the page level and pass data down via props:

```typescript
// Home Page (app/page.tsx)
const [activeRaffle, setActiveRaffle] = useState<Raffle | null>(null);
const [myTickets, setMyTickets] = useState<Ticket[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [showWinnerModal, setShowWinnerModal] = useState(false);
const [winner, setWinner] = useState<Winner | null>(null);

// History Page (app/history/page.tsx)
const [raffleHistory, setRaffleHistory] = useState<Raffle[]>([]);
const [isLoading, setIsLoading] = useState(false);
```

#### **Data Flow**
1. **Fetch data** using `useEffect` + `fetch` API
2. **Store in state** using `useState`
3. **Pass down as props** to child components
4. **Update state** when actions occur (ticket purchase, raffle completion)

#### **When to Refactor**
Consider more complex state management (Context, Zustand) if:
- Props drilling becomes painful (5+ levels deep)
- Multiple pages need shared state (e.g., persistent wallet balance)
- State updates become difficult to track
- Performance issues arise from unnecessary re-renders

For the MVP, **useState is sufficient** and keeps the code simple and maintainable.

### Routes

#### Public Routes

| Route | Description | Key Features |
|-------|-------------|-------------|
| `/` | Home page with active raffle | Main lottery interface, ticket purchase, live progress |
| `/history` | Past raffles and winners | List of completed raffles, winner information, statistics |
| `/raffle/[id]` | Individual raffle details | Detailed view of specific raffle, all tickets, participants |

#### Protected Routes (Admin)

| Route | Description | Key Features |
|-------|-------------|-------------|
| `/admin` | Admin dashboard | Create raffles, manage active raffle, view statistics |

#### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/raffles` | GET | Fetch all raffles or active raffle |
| `/api/raffles` | POST | Create new raffle (admin) |
| `/api/raffles/[id]` | GET | Fetch specific raffle details |
| `/api/raffles/[id]` | PATCH | Update raffle (admin) |
| `/api/raffles/[id]` | DELETE | Cancel raffle (admin) |
| `/api/tickets` | POST | Purchase tickets |
| `/api/tickets` | GET | Fetch user's tickets |
| `/api/execute-raffle` | POST | Execute raffle and select winner |

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd online-lottery-project
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="your-database-url"

# Authentication (if implementing)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# App Configuration
NEXT_PUBLIC_TICKET_PRICE=10
NEXT_PUBLIC_DEFAULT_GOAL=1000
```

4. Run database migrations (if using a database):
```bash
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Development

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
npm test            # Run tests (when implemented)
```

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React useState + useEffect
- **Data Fetching**: Native fetch API
- **Form Handling**: React controlled components
- **Validation**: TypeScript + custom validation
- **Database**: PostgreSQL / MongoDB (to be implemented)
- **ORM**: Prisma / Drizzle (to be implemented)
- **Authentication**: NextAuth.js (optional, to be implemented)

#### Future Enhancements (As Needed)
- React Query / SWR for advanced data fetching
- Zustand / Context for global state management
- React Hook Form for complex forms
- Zod for schema validation

### Code Style

- Use functional components with hooks
- Follow Next.js App Router conventions
- Use TypeScript strict mode
- Implement proper error boundaries
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages

### Project Phases

#### Phase 1: Core UI Components (Week 1)
- [ ] Set up component library structure
- [ ] Create layout components (Header, Footer)
- [ ] Build UI components (Button, Card, Modal, Input)
- [ ] Implement PrizePoolDisplay with ProgressBar
- [ ] Create TicketPurchaseSection

#### Phase 2: State Management & Data Flow (Week 2)
- [ ] Set up state management (Zustand/Context)
- [ ] Implement data models and types
- [ ] Create custom hooks for data operations
- [ ] Add mock data for development

#### Phase 3: Raffle Logic (Week 3)
- [ ] Implement ticket purchase functionality
- [ ] Build raffle execution logic
- [ ] Create winner selection algorithm
- [ ] Add WinnerAnnouncementModal with effects

#### Phase 4: Backend Integration (Week 4)
- [ ] Set up database schema
- [ ] Implement API routes
- [ ] Add real-time updates (WebSockets/Polling)
- [ ] Implement data persistence

#### Phase 5: Polish & Features (Week 5)
- [ ] Add animations and transitions
- [ ] Implement responsive design improvements
- [ ] Create raffle history page
- [ ] Add admin dashboard

#### Phase 6: Testing & Deployment (Week 6)
- [ ] Write unit tests for components
- [ ] Add integration tests
- [ ] Performance optimization
- [ ] Deploy to production

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details
