# End-to-End Testing Guide - Production Readiness

This guide walks through complete testing scenarios to ensure the lottery system is production-ready.

## Prerequisites

```bash
# 1. Start development server
npm run dev

# 2. Open Prisma Studio in another terminal (for verification)
npm run db:studio

# 3. Have admin credentials ready
# Email: admin@example.com
# Password: admin123
```

## Test Scenario 1: Complete User Purchase Flow

### Objective
Test the entire flow from user registration through payment approval.

### Steps

#### 1.1 User Registration & Purchase
1. Open http://localhost:3000
2. Click "Buy Tickets" button
3. Select quantity (e.g., 5 tickets)
4. Fill in user identification form:
   - Name: "Test User"
   - Email: "testuser123@example.com"
5. Click "Continue"

**Expected Result:**
- ✅ Payment modal appears
- ✅ Reference code displayed (8 characters)
- ✅ Yape number shown
- ✅ WhatsApp link works
- ✅ Email link works

#### 1.2 Verify Transaction Created
1. Open Prisma Studio
2. Go to `PurchaseTransaction` table
3. Find the most recent transaction

**Expected Result:**
- ✅ Status: `PENDING_PAYMENT`
- ✅ ticketIds: empty array `[]`
- ✅ totalAmount: correct (quantity × ticketPrice)
- ✅ userId matches the test user
- ✅ transactionDate is current

#### 1.3 Verify Optimistic Update
1. In Prisma Studio, go to `Raffle` table
2. Find the active raffle

**Expected Result:**
- ✅ currentAmount increased by totalAmount
- ✅ ticketsSold NOT increased yet (only after approval)

#### 1.4 Admin Review - Approval
1. Open http://localhost:3000/admin/login
2. Login as admin
3. Click "💳 Payment Review"
4. Find the test transaction by reference code
5. Add notes: "Payment verified via WhatsApp"
6. Click "✓ Approve & Create Tickets"
7. Confirm the action

**Expected Result:**
- ✅ Success message appears: "Payment approved! 5 ticket(s) created successfully."
- ✅ Transaction disappears from pending list

#### 1.5 Verify Tickets Created
1. In Prisma Studio, go to `Ticket` table
2. Filter by userId (test user)

**Expected Result:**
- ✅ 5 new tickets created
- ✅ Sequential ticket numbers
- ✅ purchaseAmount matches ticketPrice
- ✅ raffleId correct
- ✅ isWinner = false

#### 1.6 Verify Transaction Updated
1. In Prisma Studio, go to `PurchaseTransaction` table
2. Find the test transaction

**Expected Result:**
- ✅ Status: `COMPLETED`
- ✅ ticketIds: array with 5 ticket IDs
- ✅ reviewedAt: current timestamp
- ✅ reviewedBy: admin user ID
- ✅ adminNotes: "Payment verified via WhatsApp"

#### 1.7 Verify Raffle Updated
1. In Prisma Studio, go to `Raffle` table
2. Check active raffle

**Expected Result:**
- ✅ ticketsSold increased by 5
- ✅ currentAmount remains the same (already updated optimistically)

#### 1.8 Verify Activity Feed
1. Go back to http://localhost:3000
2. Scroll to "Recent Activity" section

**Expected Result:**
- ✅ New activity entry appears
- ✅ Shows user name, quantity, and amount
- ✅ Timestamp is current

---

## Test Scenario 2: Payment Rejection Flow

### Objective
Test the rejection flow and verify optimistic update revert.

### Steps

#### 2.1 Create Another Purchase
1. On home page, click "Buy Tickets"
2. Select 3 tickets
3. Use same user or create new one
4. Complete to payment modal
5. Note the reference code
6. Close the modal

#### 2.2 Verify Pre-Rejection State
1. In Prisma Studio, check `Raffle` table
2. Note the current `currentAmount`

**Expected Result:**
- ✅ currentAmount includes the new transaction amount

#### 2.3 Admin Review - Rejection
1. Go to http://localhost:3000/admin/payments
2. Find the new transaction
3. Add notes: "Payment proof unclear, please resubmit"
4. Click "✗ Reject Payment"
5. Confirm the action

**Expected Result:**
- ✅ Success message: "Payment rejected successfully."
- ✅ Transaction disappears from pending list

#### 2.4 Verify Rejection in Database
1. In Prisma Studio, go to `PurchaseTransaction` table
2. Find the rejected transaction

**Expected Result:**
- ✅ Status: `REJECTED`
- ✅ ticketIds: still empty `[]`
- ✅ reviewedAt: current timestamp
- ✅ reviewedBy: admin user ID
- ✅ adminNotes: "Payment proof unclear, please resubmit"

#### 2.5 Verify Amount Reverted
1. In Prisma Studio, go to `Raffle` table
2. Check currentAmount

**Expected Result:**
- ✅ currentAmount decreased by rejected transaction amount (reverted)
- ✅ ticketsSold unchanged (no tickets were created)

#### 2.6 Verify No Tickets Created
1. In Prisma Studio, go to `Ticket` table
2. Search for tickets matching the rejected transaction

**Expected Result:**
- ✅ NO tickets created for rejected transaction

---

## Test Scenario 3: Multiple Concurrent Purchases

### Objective
Test system behavior with multiple simultaneous transactions.

### Steps

#### 3.1 Create Multiple Purchases Quickly
1. Open http://localhost:3000 in 3 different browsers/tabs
2. In each tab, purchase tickets (different quantities):
   - Tab 1: 5 tickets
   - Tab 2: 10 tickets
   - Tab 3: 2 tickets
3. Complete all three purchases within 30 seconds

#### 3.2 Verify All Transactions Created
1. In Prisma Studio, check `PurchaseTransaction` table
2. Filter by status: `PENDING_PAYMENT`

**Expected Result:**
- ✅ All 3 transactions exist
- ✅ Each has unique ID
- ✅ Correct amounts for each

#### 3.3 Approve All Transactions
1. Go to admin payments page
2. Approve all 3 transactions one by one

**Expected Result:**
- ✅ All approvals succeed
- ✅ No race conditions or errors
- ✅ All tickets created correctly

#### 3.4 Verify Ticket Numbering
1. In Prisma Studio, go to `Ticket` table
2. Order by ticketNumber ascending

**Expected Result:**
- ✅ All ticket numbers are sequential
- ✅ No duplicate ticket numbers
- ✅ No gaps in sequence
- ✅ Total count matches sum of approved transactions

---

## Test Scenario 4: Winner Selection Flow

### Objective
Test the raffle execution and winner selection.

### Steps

#### 4.1 Verify Raffle State
1. Ensure active raffle has at least 10 tickets sold
2. In Prisma Studio, verify `Raffle` table

**Expected Result:**
- ✅ ticketsSold >= 10
- ✅ status: `ACTIVE`
- ✅ winnerId: null

#### 4.2 Execute Raffle
1. Go to http://localhost:3000/admin
2. Find the active raffle
3. Click "Execute Raffle"
4. Confirm the action

**Expected Result:**
- ✅ Success message appears
- ✅ Winner information displayed

#### 4.3 Verify Winner in Database
1. In Prisma Studio, go to `Winner` table
2. Find the most recent winner entry

**Expected Result:**
- ✅ Winner record created
- ✅ raffleId matches executed raffle
- ✅ userId matches ticket owner
- ✅ ticketId is valid
- ✅ prizeAmount equals raffle's currentAmount
- ✅ announcedAt is current timestamp

#### 4.4 Verify Raffle Updated
1. In Prisma Studio, go to `Raffle` table
2. Find the executed raffle

**Expected Result:**
- ✅ status: `COMPLETED`
- ✅ winnerId populated
- ✅ winningTicketId populated
- ✅ winningTicketNumber populated
- ✅ winnerName populated
- ✅ executedAt is current timestamp

#### 4.5 Verify Winning Ticket Marked
1. In Prisma Studio, go to `Ticket` table
2. Find the winning ticket

**Expected Result:**
- ✅ isWinner: true
- ✅ Only ONE ticket has isWinner = true for this raffle

#### 4.6 Verify Winner Banner on Homepage
1. Go to http://localhost:3000
2. Check the top of the page

**Expected Result:**
- ✅ Winner banner displays
- ✅ Shows winner name
- ✅ Shows ticket number
- ✅ Shows prize amount

---

## Test Scenario 5: Error Handling & Edge Cases

### Objective
Test system resilience and error handling.

### 5.1 Test: Double Approval Prevention
1. Create a pending transaction
2. Open admin payments page in TWO browser tabs
3. In tab 1, approve the transaction
4. Immediately in tab 2, try to approve the same transaction

**Expected Result:**
- ✅ Tab 1: Approval succeeds
- ✅ Tab 2: Error message: "Transaction already completed"
- ✅ Only ONE set of tickets created

### 5.2 Test: Reject Without Notes
1. Find a pending transaction
2. Do NOT add any notes
3. Click "✗ Reject Payment"

**Expected Result:**
- ✅ Alert: "Please provide a reason for rejection in the notes field."
- ✅ Rejection prevented

### 5.3 Test: Purchase Without User Identification
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Click "Buy Tickets"

**Expected Result:**
- ✅ User identification modal appears
- ✅ Cannot proceed without filling form

### 5.4 Test: Purchase Exceeding Max Tickets
1. Create a raffle with maxTickets = 100
2. Manually approve transactions until ticketsSold = 98
3. Try to purchase 5 tickets

**Expected Result:**
- ✅ Error: "Only 2 tickets remaining"
- ✅ Purchase prevented

### 5.5 Test: Execute Raffle with Zero Tickets
1. Create a new raffle
2. Do NOT approve any tickets
3. Try to execute raffle

**Expected Result:**
- ✅ Button disabled
- ✅ Cannot execute raffle with 0 tickets

### 5.6 Test: Admin Authentication
1. Logout or clear session
2. Try to access http://localhost:3000/admin/payments directly

**Expected Result:**
- ✅ Redirected to /admin/login
- ✅ Cannot access without authentication

### 5.7 Test: Non-Admin User Access
1. Login as regular user (not admin)
2. Try to access admin endpoints via curl

**Expected Result:**
- ✅ 403 Forbidden response
- ✅ Error: "Forbidden. Admin access required."

---

## Test Scenario 6: Data Integrity Verification

### Objective
Verify data consistency across the system.

### 6.1 Run Verification Script
```bash
npm run test:verify-payment-api
```

**Expected Result:**
- ✅ All schema checks pass
- ✅ Active raffle exists
- ✅ Ticket numbering sequential
- ✅ Amounts match transactions
- ✅ ticketsSold matches actual count

### 6.2 Manual Database Queries

#### Check Transaction Consistency
```sql
-- Verify completed transactions have tickets
SELECT
  t.id,
  t.status,
  CARDINALITY(t."ticketIds") as ticket_count,
  t.quantity
FROM "PurchaseTransaction" t
WHERE t.status = 'COMPLETED'
  AND CARDINALITY(t."ticketIds") != t.quantity;
-- Expected: 0 rows (all completed transactions should have correct ticket count)
```

#### Check Amount Integrity
```sql
-- Compare ticket amounts with transaction amounts
SELECT
  r.id,
  r."ticketsSold",
  (SELECT COUNT(*) FROM "Ticket" WHERE "raffleId" = r.id) as actual_tickets,
  r."currentAmount",
  (SELECT COALESCE(SUM("totalAmount"), 0)
   FROM "PurchaseTransaction"
   WHERE "raffleId" = r.id AND status = 'COMPLETED') as completed_amount
FROM "Raffle" r
WHERE r.status = 'ACTIVE';
-- Expected: ticketsSold = actual_tickets, amounts should be close (accounting for rejected)
```

#### Check for Orphaned Records
```sql
-- Find tickets without valid transactions
SELECT t.*
FROM "Ticket" t
LEFT JOIN "PurchaseTransaction" pt ON t.id = ANY(pt."ticketIds")
WHERE pt.id IS NULL;
-- Expected: 0 rows (all tickets should belong to a transaction)
```

---

## Test Scenario 7: UI/UX Testing

### Objective
Ensure user interface works correctly across scenarios.

### 7.1 Responsive Design
1. Test on different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

**Check:**
- ✅ Payment modal fits screen
- ✅ Admin tables are scrollable
- ✅ Buttons are tappable
- ✅ Text is readable

### 7.2 Dark Mode
1. Toggle system dark mode
2. Visit all pages

**Check:**
- ✅ All colors visible in dark mode
- ✅ Text contrast sufficient
- ✅ No white flashes

### 7.3 Loading States
1. Clear cache and reload pages
2. Observe loading indicators

**Check:**
- ✅ Loading spinners appear
- ✅ Content doesn't flash
- ✅ Error states handle gracefully

### 7.4 Toast Notifications
1. Trigger various actions
2. Observe toast messages

**Check:**
- ✅ Success toasts are green
- ✅ Error toasts are red
- ✅ Info toasts are blue
- ✅ Toasts auto-dismiss
- ✅ Multiple toasts don't overlap

---

## Test Scenario 8: WhatsApp Integration

### Objective
Verify WhatsApp links work correctly.

### 8.1 Test WhatsApp Link
1. Complete a purchase to payment modal
2. Click "Enviar por WhatsApp"

**Expected Result:**
- ✅ Opens WhatsApp (web or app)
- ✅ Number pre-filled: 51999999999
- ✅ Message includes:
  - Reference code
  - Amount
  - "Hola, acabo de realizar un pago por Yape..."

### 8.2 Test Email Link
1. In payment modal, click "Enviar por Email"

**Expected Result:**
- ✅ Opens email client
- ✅ To: pagos@example.com
- ✅ Subject: Comprobante de pago

---

## Production Readiness Checklist

### Code Quality
- [ ] No console.errors in production code
- [ ] No TODO comments left unresolved
- [ ] No hardcoded test data in production paths
- [ ] All TypeScript errors resolved
- [ ] Build succeeds: `npm run build`

### Security
- [ ] Admin endpoints require authentication
- [ ] Rate limiting configured (if using Upstash)
- [ ] CSRF protection enabled
- [ ] Environment variables not committed
- [ ] Strong admin password in production

### Database
- [ ] Migration scripts reviewed
- [ ] Backup strategy in place
- [ ] Database indexes added for performance
- [ ] Connection pooling configured
- [ ] No data loss in test scenarios

### Performance
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Images optimized
- [ ] No memory leaks in long sessions

### Monitoring
- [ ] Error logging configured
- [ ] Health check endpoint added
- [ ] Audit logs working
- [ ] Admin actions logged

### Documentation
- [ ] README updated with setup instructions
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Deployment guide created

---

## Critical Issues to Fix Before Production

Document any issues found during testing:

### High Priority
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

### Medium Priority
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

### Low Priority / Nice to Have
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

---

## Final Sign-Off

Once all tests pass and issues are resolved:

- [ ] All test scenarios completed successfully
- [ ] No critical bugs found
- [ ] Data integrity verified
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Team review completed
- [ ] Ready for production deployment

**Tested By:** ___________________
**Date:** ___________________
**Approved By:** ___________________
**Date:** ___________________

---

## Next Steps After Testing

1. **Production Deployment**
   - Set up production database
   - Configure environment variables
   - Deploy to hosting platform
   - Set up domain and SSL

2. **Post-Deployment Testing**
   - Smoke test all critical flows
   - Verify payment webhooks
   - Test with real Yape payments (small amounts)
   - Monitor error logs

3. **Launch Checklist**
   - Announce to users
   - Monitor first transactions closely
   - Be ready for support requests
   - Have rollback plan ready
