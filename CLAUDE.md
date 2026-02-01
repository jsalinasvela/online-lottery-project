# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev          # Start Next.js development server
npm run build        # Generate Prisma client and build for production
npm run lint         # Run ESLint
npm run start        # Start production server
```

### Database Commands

```bash
npm run db:migrate   # Run Prisma migrations (development)
npm run db:push      # Push schema changes without migrations
npm run db:seed      # Seed database with initial data
npm run db:studio    # Open Prisma Studio GUI
npm run db:generate  # Generate Prisma client
```

### Test Scripts

```bash
npm run test:create-transaction   # Create a test transaction
npm run test:list-payments        # List pending payments
npm run test:verify-payment-api   # Verify payment API
```

## Architecture Overview

This is a **Next.js 16 lottery/raffle platform** with a Yape payment integration (Peru). The application allows users to purchase tickets for raffles, with admin-verified payments.

### Tech Stack
- **Next.js 16** with App Router
- **TypeScript** with strict mode
- **Tailwind CSS v4** for styling
- **Prisma** with PostgreSQL (Supabase)
- **NextAuth.js v5** for authentication (credentials provider)

### Core Data Flow

1. **User purchases tickets** → Creates `PurchaseTransaction` with `PENDING_PAYMENT` status
2. **User pays via Yape** → Submits payment proof screenshot → Status changes to `PENDING_REVIEW`
3. **Admin reviews payment** → Approves/rejects → On approval, `Ticket` records are created
4. **Raffle execution** → When goal is reached, admin executes raffle to select winner

### Key Directories

- `app/` - Next.js App Router pages and API routes
- `app/api/` - REST API endpoints (raffles, tickets, execute-raffle, admin, users)
- `app/admin/` - Admin dashboard for payment review and raffle management
- `components/raffle/` - Raffle UI components (GlassVisualization is the main display)
- `components/payment/` - Yape payment modal and related components
- `lib/context/` - React contexts (RaffleContext manages global raffle state)
- `lib/hooks/` - Custom hooks (useRaffle, useTickets, useRecentActivity)
- `lib/api/` - Client-side API functions
- `lib/translations/` - Spanish translations
- `prisma/` - Database schema and seed file

### State Management

The app uses `RaffleContext` (`lib/context/RaffleContext.tsx`) as the central state manager for:
- Active raffle data
- User's tickets
- Recent activity feed
- Purchase flow (including user identification modal and payment modal)

User identification is stored in localStorage (`lottery_user`).

### Authentication

- Admin authentication via NextAuth.js credentials provider
- Admin credentials come from environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- Regular users are identified by email (stored in localStorage, not authenticated)
- Admin routes protected at `/admin/*`

### Database Models (Prisma)

- `User` - With roles (USER, ADMIN) and wallet balance
- `Raffle` - Status enum: ACTIVE, COMPLETED, CANCELLED
- `Ticket` - Belongs to user and raffle, has sequential ticket number
- `PurchaseTransaction` - Status enum: PENDING_PAYMENT, PENDING_REVIEW, COMPLETED, REJECTED, FAILED
- `Winner` - Links raffle to winning user/ticket

### Payment Flow

The app uses Yape (Peru mobile payment). Transactions start as `PENDING_PAYMENT`, user submits payment proof, admin reviews in `/admin` dashboard. Tickets are only created when payment is approved.

### Environment Variables

Required in `.env`:
- `DATABASE_URL` and `DIRECT_URL` (Supabase PostgreSQL)
- `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- `NEXT_PUBLIC_YAPE_NUMBER` and `NEXT_PUBLIC_WHATSAPP_NUMBER`
