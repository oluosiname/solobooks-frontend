# Possible Transaction Match - UI Design Options

When a synced transaction is returned from the backend with a `possible_transaction` (a manually entered transaction that might be a duplicate), we want to highlight this to the user during the approval flow. Here are 3 design options:

---

## Design 1: Alert Banner at Top of Form

Display an info/warning banner at the top of the new-expense/new-income form when there's a possible match.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← New Expense                                                       │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🔗  Possible duplicate found                                    │ │
│ │                                                                 │ │
│ │ A similar transaction was manually entered on Jan 15, 2025:     │ │
│ │ "Office Supplies" - €45.00                                      │ │
│ │                                                                 │ │
│ │  [ Link to existing ]         [ Dismiss suggestion ]            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  Transaction Info                                               │ │
│ │  ┌─────────────┐  ┌─────────────┐                               │ │
│ │  │ Type        │  │ Category    │                               │ │
│ │  │ [Expense ▼] │  │ [Select ▼]  │                               │ │
│ │  └─────────────┘  └─────────────┘                               │ │
│ │  ... rest of form ...                                           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- "Link to existing" → API call to link synced transaction to existing manual transaction, then redirect back to synced list
- "Dismiss suggestion" → API call to dismiss the suggestion, banner disappears, user continues with form

**Pros:**
- Highly visible, user sees it immediately
- Follows existing AlertBanner pattern in codebase
- Non-blocking, user can still proceed with form

**Cons:**
- Takes up vertical space
- May feel intrusive for frequent users

---

## Design 2: Inline Card in Summary Sidebar

Show a compact card in the sidebar (next to the summary section) that highlights the potential match.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← New Expense                                                       │
├───────────────────────────────────────────┬─────────────────────────┤
│ ┌───────────────────────────────────────┐ │ ┌─────────────────────┐ │
│ │  Transaction Info                     │ │ │  Summary            │ │
│ │                                       │ │ │                     │ │
│ │  Type:     [Expense ▼]                │ │ │  Type: Expense      │ │
│ │  Category: [Select ▼]                 │ │ │  Date: 2025-01-15   │ │
│ │  Date:     [2025-01-15]               │ │ │  Receipt: None      │ │
│ │  Amount:   [45.00]                    │ │ │                     │ │
│ │  ...                                  │ │ │  [Create Expense]   │ │
│ │                                       │ │ │  [Cancel]           │ │
│ └───────────────────────────────────────┘ │ └─────────────────────┘ │
│                                           │                         │
│                                           │ ┌─────────────────────┐ │
│                                           │ │ 🔗 Possible Match   │ │
│                                           │ │─────────────────────│ │
│                                           │ │ Office Supplies     │ │
│                                           │ │ Jan 15 · €45.00     │ │
│                                           │ │                     │ │
│                                           │ │ Is this the same    │ │
│                                           │ │ transaction?        │ │
│                                           │ │                     │ │
│                                           │ │ [Yes, link it]      │ │
│                                           │ │ [No, dismiss]       │ │
│                                           │ └─────────────────────┘ │
└───────────────────────────────────────────┴─────────────────────────┘
```

**Behavior:**
- "Yes, link it" → API call to link, redirect to synced list
- "No, dismiss" → API call to dismiss, card disappears

**Pros:**
- Doesn't disrupt the main form flow
- Grouped with summary/action area (logical placement)
- Compact and unobtrusive

**Cons:**
- May be overlooked on smaller screens (sidebar stacks below)
- Less prominent than top banner

---

## Design 3: Modal/Dialog on Page Load

Show a quick decision modal when the user first lands on the form (if there's a possible match).

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← New Expense                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│        ┌───────────────────────────────────────────────┐            │
│        │                                               │            │
│        │   🔗  Possible Duplicate Found                │            │
│        │                                               │            │
│        │   We found a similar transaction that was     │            │
│        │   manually entered:                           │            │
│        │                                               │            │
│        │   ┌─────────────────────────────────────────┐ │            │
│        │   │  Office Supplies                        │ │            │
│        │   │  January 15, 2025                       │ │            │
│        │   │  €45.00 · Expense                       │ │            │
│        │   │  Category: Office & Supplies            │ │            │
│        │   └─────────────────────────────────────────┘ │            │
│        │                                               │            │
│        │   Is this bank transaction the same as the   │            │
│        │   one above?                                  │            │
│        │                                               │            │
│        │   ┌─────────────────┐  ┌──────────────────┐  │            │
│        │   │  Yes, link them │  │  No, continue    │  │            │
│        │   │  (recommended)  │  │  with new entry  │  │            │
│        │   └─────────────────┘  └──────────────────┘  │            │
│        │                                               │            │
│        └───────────────────────────────────────────────┘            │
│                                                                      │
│   (form visible but dimmed behind modal)                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- "Yes, link them" → API call to link, redirect back to synced transactions list
- "No, continue with new entry" → API call to dismiss suggestion, modal closes, user proceeds with form

**Pros:**
- Forces user to make a decision upfront
- Clear and prominent
- Prevents accidental duplicates

**Cons:**
- Interrupts the flow
- May be annoying if suggestions are frequently wrong
- Additional click required to proceed

---

## Recommendation

**Design 1 (Alert Banner)** is recommended as the best balance:
- It's visible but not blocking
- Follows existing patterns in the codebase (AlertBanner component)
- Users can ignore it and continue if they prefer
- Easy to implement using existing components

However, if you want to ensure users don't miss the suggestion, **Design 3 (Modal)** provides the most certainty that users will see and address it.

---

## API Considerations

For all designs, we'll need two API endpoints:

1. **Link transaction**: `POST /api/v1/synced_transactions/{id}/link`
   - Body: `{ transaction_id: number }`
   - Links the synced transaction to the existing manual transaction

2. **Dismiss suggestion**: `POST /api/v1/synced_transactions/{id}/dismiss_suggestion`
   - Marks that the user has reviewed and dismissed this match suggestion

---

## Data Structure (from API)

The `possible_transaction` is nested in the synced transaction response:

```typescript
interface SyncedTransaction {
  id: string;
  amount: number;
  booked_at: string;
  description: string;
  status: "pending" | "approved" | "discarded";
  bank_connection: BankConnectionSummary;
  financial_category: FinancialCategory | null;
  possible_transaction: {
    id: string;
    transaction_type: "Income" | "Expense";
    amount: number;
    date: string;
    description: string;
    vat_rate: number;
    vat_amount: number;
    customer_location: "germany" | "in_eu" | "outside_eu";
    customer_vat_number: string;
    source: "manual" | "bank_sync";
    receipt_url: string;
    category: FinancialCategory;
    created_at: string;
    updated_at: string;
  } | null;
  created_at: string;
  updated_at: string;
}
```

## Data Flow Options

### Option A: Pass via URL params (current pattern)
Extend the existing URL param approach used in `grouped-transactions-table.tsx`:

```typescript
// In grouped-transactions-table.tsx handleEdit()
if (transaction.possibleTransaction) {
  params.set("possibleTransactionId", transaction.possibleTransaction.id);
  params.set("possibleTransactionDesc", transaction.possibleTransaction.description);
  params.set("possibleTransactionAmount", transaction.possibleTransaction.amount.toString());
  params.set("possibleTransactionDate", transaction.possibleTransaction.date);
}
```

### Option B: Fetch on form load (cleaner)
Store only the synced transaction ID in URL, fetch full details including possible match:

```typescript
// In new-expense/page.tsx
const syncedTransactionId = searchParams.get("syncedTransactionId");

const { data: syncedTransaction } = useQuery({
  queryKey: ["synced-transaction", syncedTransactionId],
  queryFn: () => fetchSyncedTransaction(syncedTransactionId),
  enabled: !!syncedTransactionId,
});

const possibleMatch = syncedTransaction?.possible_transaction;
```

**Recommendation**: Option B is cleaner - avoids URL bloat and ensures fresh data.
