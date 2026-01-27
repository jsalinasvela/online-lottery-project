# Testing Payment Review Flows

This guide explains how to manually test the admin payment review API (approve and reject flows).

## Prerequisites

1. Development server running: `npm run dev`
2. Database seeded with initial data: `npm run db:seed`
3. Admin credentials from `.env`:
   - Email: `admin@example.com`
   - Password: `admin123`

## Setup: Create Test Transaction

Before testing approve/reject, you need a pending transaction. Here's how:

### Option 1: Use the UI

1. Open http://localhost:3000
2. Click "Buy Tickets" (choose 1-5 tickets)
3. Fill in user identification form
4. Note the transaction ID from the payment modal (last 8 characters shown as reference code)
5. Close the modal - transaction is now PENDING_PAYMENT

### Option 2: Use Prisma Studio

1. Run `npm run db:studio`
2. Navigate to `PurchaseTransaction` table
3. Find transactions with status `PENDING_PAYMENT`
4. Copy the full transaction ID

### Option 3: Create via Database Script

Run this command to create a test transaction:

```bash
npx tsx scripts/create-test-transaction.ts
```

(Script will be created in next step)

## Test Flow 1: APPROVE Payment

### Step 1: Get Admin Session Token

First, login as admin to get a session token:

```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }' \
  -c cookies.txt
```

Or login via browser at http://localhost:3000/admin/login

### Step 2: Approve Transaction

Replace `TRANSACTION_ID` with your actual transaction ID:

```bash
curl -X PATCH http://localhost:3000/api/admin/payments/TRANSACTION_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "action": "approve",
    "notes": "Payment verified via WhatsApp"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment approved and tickets created",
  "ticketCount": 5
}
```

### Step 3: Verify in Database

Check the following in Prisma Studio (`npm run db:studio`):

**PurchaseTransaction table:**
- ✅ Status changed to `COMPLETED`
- ✅ `ticketIds` array populated with ticket IDs
- ✅ `reviewedAt` timestamp set
- ✅ `reviewedBy` contains admin user ID
- ✅ `adminNotes` contains your notes

**Ticket table:**
- ✅ New tickets created (count matches transaction quantity)
- ✅ Tickets have correct `userId` and `raffleId`
- ✅ Ticket numbers are sequential

**Raffle table:**
- ✅ `ticketsSold` incremented by quantity
- ✅ `currentAmount` remains the same (was updated optimistically)

## Test Flow 2: REJECT Payment

### Step 1: Create Another Test Transaction

Create a new pending transaction using any method from Setup section.

### Step 2: Reject Transaction

```bash
curl -X PATCH http://localhost:3000/api/admin/payments/TRANSACTION_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "action": "reject",
    "notes": "Payment proof unclear, requested new screenshot"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment rejected"
}
```

### Step 3: Verify in Database

Check the following in Prisma Studio:

**PurchaseTransaction table:**
- ✅ Status changed to `REJECTED`
- ✅ `ticketIds` array remains empty
- ✅ `reviewedAt` timestamp set
- ✅ `reviewedBy` contains admin user ID
- ✅ `adminNotes` contains your rejection reason

**Ticket table:**
- ✅ NO new tickets created

**Raffle table:**
- ✅ `currentAmount` decremented (reverted optimistic update)
- ✅ `ticketsSold` unchanged (no tickets were created)

## Test Flow 3: Error Cases

### Test: Transaction Already Processed

Try to approve/reject the same transaction twice:

```bash
# First approval
curl -X PATCH http://localhost:3000/api/admin/payments/TRANSACTION_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"action": "approve"}'

# Second approval (should fail)
curl -X PATCH http://localhost:3000/api/admin/payments/TRANSACTION_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"action": "approve"}'
```

**Expected Response (2nd call):**
```json
{
  "error": "Transaction already completed"
}
```

### Test: Invalid Action

```bash
curl -X PATCH http://localhost:3000/api/admin/payments/TRANSACTION_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"action": "invalid"}'
```

**Expected Response:**
```json
{
  "error": "Invalid action. Must be \"approve\" or \"reject\"."
}
```

### Test: Non-existent Transaction

```bash
curl -X PATCH http://localhost:3000/api/admin/payments/invalid-id \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"action": "approve"}'
```

**Expected Response:**
```json
{
  "error": "Transaction not found"
}
```

### Test: Unauthorized Access (No Admin)

```bash
# Without cookies/session
curl -X PATCH http://localhost:3000/api/admin/payments/TRANSACTION_ID \
  -H "Content-Type: application/json" \
  -d '{"action": "approve"}'
```

**Expected Response:**
```json
{
  "error": "Unauthorized. Please log in."
}
```

## Quick Test Checklist

- [ ] Create pending transaction via UI
- [ ] Login as admin
- [ ] Approve transaction - verify tickets created
- [ ] Check database: status=COMPLETED, tickets exist, ticketsSold incremented
- [ ] Create another pending transaction
- [ ] Reject transaction - verify no tickets created
- [ ] Check database: status=REJECTED, currentAmount reverted
- [ ] Try to approve already-completed transaction - verify error
- [ ] Try to access endpoint without admin login - verify 401 error
- [ ] Verify admin notes are saved in both flows

## Database Queries (Optional)

If you prefer SQL queries over Prisma Studio:

```sql
-- View pending transactions
SELECT id, userId, quantity, totalAmount, status, transactionDate
FROM "PurchaseTransaction"
WHERE status = 'PENDING_PAYMENT'
ORDER BY transactionDate DESC;

-- View transaction details after review
SELECT id, status, ticketIds, reviewedAt, reviewedBy, adminNotes
FROM "PurchaseTransaction"
WHERE id = 'YOUR_TRANSACTION_ID';

-- View tickets created for a transaction
SELECT t.*
FROM "Ticket" t
WHERE t.id = ANY(
  SELECT unnest(ticketIds)
  FROM "PurchaseTransaction"
  WHERE id = 'YOUR_TRANSACTION_ID'
);

-- View raffle statistics
SELECT id, title, ticketsSold, currentAmount, goalAmount
FROM "Raffle"
WHERE status = 'ACTIVE';
```

## Troubleshooting

### Issue: "Unauthorized" even after login

**Solution**: Make sure you're including cookies in the request. Use `-b cookies.txt` with curl or include credentials in fetch:

```javascript
fetch('/api/admin/payments/ID', {
  method: 'PATCH',
  credentials: 'include', // Important!
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'approve' })
})
```

### Issue: Tickets have wrong numbers

**Solution**: This might indicate a race condition. Check if multiple admins are approving simultaneously. The ticket count query happens outside the transaction, which could cause issues under high concurrency.

### Issue: CurrentAmount becomes negative after reject

**Solution**: Verify the transaction's totalAmount matches what was optimistically added. Check the transaction log to ensure it wasn't manually modified.

## Next Steps

After successful testing:
1. Create admin UI for payment review (Task 5)
2. Add pagination for large transaction lists
3. Add image upload for payment proofs
4. Implement real-time notifications for pending payments
