# Buffalo UP Accounting — Data Model

**Organization:** Buffalo United for Peace Inc (501(c)(3) nonprofit)
**EIN:** 82-5086497
**Salesforce API Version:** 61.0
**Last updated:** 2026-04-28

---

## Overview

The data model supports nonprofit financial management across two parallel ledger lanes — income and expenses — each consisting of a budget layer and a transaction layer. A fifth object, Recurring Donation, bridges the donor relationship model (Contact / Account) to the income budget and transaction layers for multi-payment pledges (called "Himmet" internally).

### Core objects at a glance

| Object | API Name | Purpose |
|--------|----------|---------|
| Income Budget | `Income_Budget__c` | Plans and tracks income goals per category and fiscal year |
| Expense Budget | `Expense_Budget__c` | Plans and tracks spending goals per category and fiscal year |
| Income Transaction | `Income_Transaction__c` | Records each individual income receipt |
| Expense Transaction | `Expense_Transaction__c` | Records each individual expense payment |
| Recurring Donation | `Recurring_Donation__c` | Tracks multi-payment donor pledges |

Standard Salesforce objects used: **Contact**, **Account**.

---

## Fiscal Year Definition

**Global Value Set API name:** `Fiscal_Year` (referenced as `Fiscal_Year__c` picklist field on all five custom objects)

Buffalo UP fiscal year runs **July 1 through June 30**. The label format is `YY/YY FY`.

| API Value | Label | Default |
|-----------|-------|---------|
| `23/24_FY` | 23/24 FY | Yes |
| `24/25_FY` | 24/25 FY | No |
| `25/26_FY` | 25/26 FY | No |
| `26/27_FY` | 26/27 FY | No |

This picklist is restricted (no values may be entered outside the defined set) and is shared across all five custom objects. Adding a new fiscal year requires updating this single global value set.

---

## Object Definitions

### 1. Income_Budget__c

**Label:** Income Budget
**Plural:** Income Budgets
**Description:** Set and track financial goals for income, including grouped recurring donations.
**Name field type:** Text (`Income Budget Name`) — free-form, renamed by the `BUP_Income_Budget_Before_Update` flow to `Fiscal Year + Name` pattern on save.
**Sharing model:** ReadWrite
**Field history tracking:** Enabled

| API Name | Label | Type | Required | Notes |
|----------|-------|------|----------|-------|
| `Name` | Income Budget Name | Text (AutoName) | Yes | Renamed by before-save flow to `Fiscal Year + Name` |
| `Category__c` | Category | Picklist | No | Restricted; object-local value set (see values below) |
| `Description__c` | Description | TextArea | No | Free-text notes |
| `Fiscal_Year__c` | Fiscal Year | Picklist | No | References global value set `Fiscal_Year` |
| `Planned_Amount__c` | Planned Amount | Currency (18,2) | No | Target income for the fiscal year |
| `Total_Amount_Received__c` | Total Amount Received | Currency (18,2) | No | Written by flow automation; sum of linked Income Transactions |
| `Total_Amount_Left_to_Receive__c` | Total Amount Left to Receive | Formula (Currency) | No | `Planned_Amount__c - Total_Amount_Received__c`; blanks treated as zero |

**Category__c picklist values (Income_Budget__c — object-local, restricted):**

| API Value | Label | Active |
|-----------|-------|--------|
| `One-Time Donations` | One-Time Donations | Yes |
| `Recurring Donation` | Recurring Donation | Yes |
| `Fairs` | Fairs | Yes |
| `Sadaka Fitre` | Sadaka Fitre | Yes |
| `Matchings` | Matchings | Yes |
| `Weekend School` | Weekend School | Yes |
| `Youth Program` | Youth Program | Yes |
| `Other` | Other | Yes |
| `HSO` | HSO | No (inactive) |

---

### 2. Expense_Budget__c

**Label:** Expense Budget
**Plural:** Expense Budgets
**Description:** Set and track financial goals for expenses.
**Name field type:** Text (`Expense Budget Name`) — renamed by the `BUP_Expense_Budget_Before_Update` flow on save.
**Sharing model:** ReadWrite
**Field history tracking:** Enabled

| API Name | Label | Type | Required | Notes |
|----------|-------|------|----------|-------|
| `Name` | Expense Budget Name | Text (AutoName) | Yes | Renamed by after-save flow |
| `Category__c` | Category | Picklist | No | Restricted; object-local value set (see values below) |
| `Description__c` | Description | TextArea | No | Free-text notes |
| `Fiscal_Year__c` | Fiscal Year | Picklist | No | References global value set `Fiscal_Year` |
| `Planned_Amount__c` | Planned Amount | Currency (18,2) | No | Target spending for the fiscal year |
| `Total_Amount_Spent__c` | Total Amount Spent | Currency (18,2) | No | Written by flow automation; sum of linked Expense Transactions |
| `Total_Amount_Left_to_Spend__c` | Total Amount Left to Spend | Formula (Currency) | No | `Planned_Amount__c - Total_Amount_Spent__c`; blanks treated as zero |

**Category__c picklist values (Expense_Budget__c — object-local, restricted):**

| API Value | Label |
|-----------|-------|
| `Community Affairs` | Community Affairs |
| `Dialog` | Dialog |
| `Rehberlik` | Rehberlik |
| `Finans / Operational` | Finans / Operational |
| `Others` | Others |

---

### 3. Income_Transaction__c

**Label:** Income Transaction
**Plural:** Income Transactions
**Description:** Record individual income transactions.
**Name field type:** AutoNumber — format `IN-{000000}` (e.g. `IN-000001`)
**Sharing model:** ReadWrite
**Field history tracking:** Enabled

| API Name | Label | Type | Required | Notes |
|----------|-------|------|----------|-------|
| `Name` | Income Number | AutoNumber | System | Format: `IN-{000000}` |
| `Income_Budget__c` | Income Budget | Lookup → `Income_Budget__c` | No | `deleteConstraint: SetNull`; relationship name `Incomes` |
| `Recurring_Donation__c` | Recurring Donation | Lookup → `Recurring_Donation__c` | No | `deleteConstraint: SetNull`; relationship name `Incomes` |
| `Contact__c` | Contact | Lookup → Contact | No | `deleteConstraint: SetNull`; individual donor person |
| `Account__c` | Account | Lookup → Account | No | `deleteConstraint: Restrict`; donor account/organization |
| `Amount__c` | Amount | Currency (18,2) | No | Payment amount received |
| `Income_Date__c` | Income Date | Date | No | Date payment was received |
| `Income_Type__c` | Income Type | Picklist | No | Restricted; object-local (see values below) |
| `Payment_Type__c` | Payment Type | Picklist | No | Restricted; object-local (see values below) |
| `Fiscal_Year__c` | Fiscal Year | Picklist | No | References global value set `Fiscal_Year` |
| `Description__c` | Description | TextArea | No | Free-text notes |
| `Income_Transaction_Fiscal_Year__c` | Income Transaction Fiscal Year | Formula (Text) | No | Derives FY from `Income_Budget__r.Fiscal_Year__c`; falls back to `Recurring_Donation__r.Income_Budget__r.Fiscal_Year__c` if budget is blank |

**Income_Type__c picklist values (object-local, restricted):**

| API Value | Label |
|-----------|-------|
| `One - Time Donation` | One - Time Donation |
| `Recurring Donation` | Recurring Donation (Himmet) |
| `Grant` | Grant |
| `Youth Program` | Youth Program |
| `Others` | Others |

Note: `bupRecurringDonationPayment` LWC and `BUP_IncomeTransactionEntryController.createIncomeTransaction()` always set `Income_Type__c = 'Recurring Donation'` programmatically.

**Payment_Type__c picklist values (Income_Transaction__c — object-local, restricted):**

| API Value | Label |
|-----------|-------|
| `Cash` | Cash |
| `Check` | Check |
| `Paypal` | Paypal |
| `Zelle` | Zelle |

**Income_Transaction_Fiscal_Year__c formula:**
```
IF(
  NOT(ISBLANK(Income_Budget__c)),
  TEXT(Income_Budget__r.Fiscal_Year__c),
  IF(
    NOT(ISBLANK(Recurring_Donation__c)),
    TEXT(Recurring_Donation__r.Income_Budget__r.Fiscal_Year__c),
    NULL
  )
)
```
This is a derived text field. It is used for display/reporting and is not the same as the editable `Fiscal_Year__c` picklist on the same record.

---

### 4. Expense_Transaction__c

**Label:** Expense Transaction
**Plural:** Expense Transactions
**Name field type:** AutoNumber — format `EX-{00000}` (e.g. `EX-00001`)
**Sharing model:** ReadWrite
**Field history tracking:** Enabled

| API Name | Label | Type | Required | Notes |
|----------|-------|------|----------|-------|
| `Name` | Expense Number | AutoNumber | System | Format: `EX-{00000}` |
| `Expense_Budget__c` | Expense Budget | Lookup → `Expense_Budget__c` | **Yes** | `deleteConstraint: Restrict`; relationship name `Expenses` |
| `Contact__c` | Contact | Lookup → Contact | No | `deleteConstraint: SetNull`; individual person paying expense |
| `Account__c` | Account | Lookup → Account | No | `deleteConstraint: SetNull`; vendor/payee account |
| `Amount__c` | Amount | Currency (18,2) | No | Expense amount |
| `Expense_Date__c` | Expense Date | Date | No | Date expense was incurred |
| `Expense_Type__c` | Expense Type | Picklist | No | Restricted; object-local (see values below) |
| `Payment_Type__c` | Payment Type | Picklist | No | Restricted; object-local (Cash / Check / Paypal / Zelle) |
| `Fiscal_Year__c` | Fiscal Year | Picklist | No | References global value set `Fiscal_Year` |
| `Description__c` | Description | TextArea | No | Free-text notes |
| `Expense_Transaction_Fiscal_Year_c__c` | Expense_Transaction_Fiscal_Year__c | Formula (Text) | No | `TEXT(Expense_Budget__r.Fiscal_Year__c)` — derives FY from parent budget |

Note: The API name `Expense_Transaction_Fiscal_Year_c__c` has an extra `_c` suffix indicating this field was created with an unusual naming pattern (likely a label/API name mismatch at creation time).

**Expense_Type__c picklist values (object-local, restricted):**

| API Value | Label |
|-----------|-------|
| `Dialog Commitee` | Dialog Commitee |
| `Fairs` | Fairs |
| `Educational` | Educational |
| `Mentor Burs` | Mentor Burs |
| `Business Expenses` | Business Expenses |
| `Community Event` | Community Event |
| `Others` | Others |
| `Talebe Rehberlik` | Talebe Rehberlik |
| `Talebe Gezi` | Talebe Gezi |
| `Talebe Mentor Rehberligi` | Talebe Mentor Rehberligi |
| `Mentor Houses` | Mentor Houses |
| `Collage Mentorship` | Collage Mentorship |
| `Mentor Scholarship` | Mentor Scholarship |
| `Weekend School` | Weekend School |
| `Rent` | Rent |

---

### 5. Recurring_Donation__c

**Label:** Recurring Donation
**Plural:** Recurring Donations
**Description:** Track individual recurring donations (Himmet pledges).
**Name field type:** Text (`Recurring Donation Name`) — renamed by the `BUP_Recurring_Donation_Before_Update` flow to `Fiscal Year + Contact Name` pattern on save.
**Sharing model:** ReadWrite
**Field history tracking:** Enabled

| API Name | Label | Type | Required | Notes |
|----------|-------|------|----------|-------|
| `Name` | Recurring Donation Name | Text | Yes | Auto-named by flow: `Fiscal Year + Contact Name` |
| `Income_Budget__c` | Income Budget | Lookup → `Income_Budget__c` | **Yes** | `deleteConstraint: Restrict`; relationship name `Recurring_Donations` |
| `Contact__c` | Contact | Lookup → Contact | No | `deleteConstraint: SetNull`; individual donor |
| `Account__c` | Account | Lookup → Account | No | `deleteConstraint: SetNull`; donor organization |
| `Promised_Donation_Amount__c` | Promised Donation Amount | Currency (18,2) | No | Total amount pledged for the fiscal year |
| `Donation_Pledge_Date__c` | Donation Pledge Date | Date | No | Date the pledge was made ("Himmet sozunun alindigi gun") |
| `Status__c` | Status | Picklist | No | Restricted; default `Active` (see values below) |
| `Fiscal_Year__c` | Fiscal Year | Picklist | No | References global value set `Fiscal_Year` |
| `Description__c` | Description | TextArea | No | Free-text notes |
| `Total_Amount_Received__c` | Total Amount Received | Currency (18,2) | No | Written by flow; sum of linked Income Transactions for this pledge |
| `Total_Amount_Left_to_Receive__c` | Total Amount Left to Receive | Formula (Currency) | No | `IF(ISBLANK(Promised_Donation_Amount__c), NULL, Promised_Donation_Amount__c - Total_Amount_Received__c)` |

**Status__c picklist values (object-local, restricted):**

| API Value | Label | Default |
|-----------|-------|---------|
| `Active` | Active | Yes |
| `Completed` | Completed | No |
| `Cancelled` | Cancelled | No |
| `Paused` | Paused | No |

**Validation rule — `Recurring_Donation_FY_Must_Match_Budget`:**
- Active: Yes
- Condition: `AND(NOT(ISBLANK(Income_Budget__c)), TEXT(Fiscal_Year__c) <> TEXT(Income_Budget__r.Fiscal_Year__c))`
- Error field: `Fiscal_Year__c`
- Error message: "Fiscal Year of the Recurring Donation must match the Fiscal Year of the related Income Budget."

---

### Standard Objects (customized)

#### Account

One custom field added:

| API Name | Label | Type | Required |
|----------|-------|------|----------|
| `Email__c` | Email | Email | No |

Standard Account fields used in SOQL: `Name`, `BillingStreet`, `BillingCity`, `BillingState`, `BillingPostalCode`, `BillingCountry`.

A compact layout `Donor_Compact_layout` is defined on Account.

#### Contact

No custom fields defined in this project. Standard fields used in SOQL across controllers: `Id`, `Name`, `Email`, `Phone`, `MailingStreet`, `MailingCity`, `MailingState`, `MailingPostalCode`, `MailingCountry`, `AccountId`.

---

## Entity-Relationship Summary

```
Account ─────────────────────────────────────────────┐
  │                                                   │
  │ (0..1)                                            │ (0..1)
  ▼                                                   ▼
Contact ──────────── Recurring_Donation__c ──────── Income_Budget__c
  │ (0..1)              │ (0..*)  (required)             │ (1..*)
  │                     │                               │
  │ (0..1)              │ (0..1)                        │ (0..*)
  ▼                     ▼                               ▼
Income_Transaction__c ◄──────────────────── Income_Transaction__c
  │ (lookup to Income_Budget__c, optional)
  │ (lookup to Recurring_Donation__c, optional)

Expense_Budget__c ◄── Expense_Transaction__c (required lookup)
  (1..*)                (0..1 Contact, 0..1 Account)
```

### Relationship detail table

| Child Object | Field | Parent Object | Cardinality | Delete Constraint |
|---|---|---|---|---|
| `Income_Transaction__c` | `Income_Budget__c` | `Income_Budget__c` | Many-to-one | SetNull |
| `Income_Transaction__c` | `Recurring_Donation__c` | `Recurring_Donation__c` | Many-to-one | SetNull |
| `Income_Transaction__c` | `Contact__c` | Contact | Many-to-one | SetNull |
| `Income_Transaction__c` | `Account__c` | Account | Many-to-one | **Restrict** |
| `Expense_Transaction__c` | `Expense_Budget__c` | `Expense_Budget__c` | Many-to-one | **Restrict** |
| `Expense_Transaction__c` | `Contact__c` | Contact | Many-to-one | SetNull |
| `Expense_Transaction__c` | `Account__c` | Account | Many-to-one | SetNull |
| `Recurring_Donation__c` | `Income_Budget__c` | `Income_Budget__c` | Many-to-one | **Restrict** |
| `Recurring_Donation__c` | `Contact__c` | Contact | Many-to-one | SetNull |
| `Recurring_Donation__c` | `Account__c` | Account | Many-to-one | SetNull |

Key constraint observations:
- You **cannot delete** an `Income_Budget__c` record if it has any linked `Recurring_Donation__c` records (Restrict).
- You **cannot delete** an `Expense_Budget__c` record if it has any linked `Expense_Transaction__c` records (Restrict).
- You **cannot delete** an `Account` record if it has any linked `Income_Transaction__c` records (Restrict on `Account__c` in Income_Transaction__c).
- Deleting a Contact or a parent Budget (where constraint is SetNull) nulls out the child lookup rather than blocking or cascading.

---

## Flow Automation

All record automation is implemented as declarative Flows — no Apex triggers exist.

### Record-Triggered Flows (after-save, income totals)

**`BUP_Calculate_Total_Amount_Income`**
- Trigger: `Income_Transaction__c` — RecordAfterSave
- Purpose: Recalculates `Income_Budget__c.Total_Amount_Received__c` and `Recurring_Donation__c.Total_Amount_Received__c` whenever an income transaction is created or updated.
- Logic:
  1. Determines whether the transaction is a recurring donation type or a standard income type.
  2. For standard incomes: queries all `Income_Transaction__c` records linked to the same `Income_Budget__c` (excluding recurring types), sums amounts, writes to `Income_Budget__c.Total_Amount_Received__c`.
  3. For recurring incomes: loops all `Recurring_Donation__c` records under the budget, then for each queries linked income transactions, sums amounts, writes to both `Recurring_Donation__c.Total_Amount_Received__c` and the parent `Income_Budget__c.Total_Amount_Received__c`.

**`BUP_Calculate_Total_Amount_Income_When_Deleted`**
- Trigger: `Income_Transaction__c` — RecordAfterSave (delete context)
- Purpose: Same recalculation as above but fires on delete; excludes the deleted record from sums by filtering on Id.

**`Calculate_Total_Amount_Spent`**
- Trigger: `Expense_Transaction__c` — RecordAfterSave
- Purpose: Recalculates `Expense_Budget__c.Total_Amount_Spent__c` on create/update/delete.
- Logic: Queries all `Expense_Transaction__c` records with the same `Expense_Budget__c`, sums `Amount__c`, writes result to `Expense_Budget__c.Total_Amount_Spent__c`.

### Record-Triggered Flows (before-save, naming)

**`BUP_Income_Budget_Before_Update`**
- Trigger: `Income_Budget__c` — RecordBeforeSave
- Purpose: Sets the `Name` field to a computed value of `Fiscal Year + Name` on every save.

**`BUP_Expense_Budget_Before_Update`**
- Trigger: `Expense_Budget__c` — RecordAfterSave (note: labeled "before update" but metadata shows `RecordAfterSave`)
- Purpose: Renames the Expense Budget record.

**`BUP_Recurring_Donation_Before_Update`**
- Trigger: `Recurring_Donation__c` — RecordBeforeSave
- Purpose: Sets the `Name` field to `Fiscal Year + Contact Name` by querying the related Contact and concatenating.

### Screen Flows (user-facing)

**`BUP_Income_Transaction_Entry`**
- Type: Screen Flow
- Purpose: Guided entry form for income transactions. Captures `Income_Type__c`, `Recurring_Donation__c`, `Income_Budget__c`, `Account__c`, `Income_Date__c`, `Payment_Type__c`, `Description__c`. Supports file upload attachments linked to the created transaction via ContentDocumentLink.

**`BUP_Expense_Transaction_Entry`**
- Type: Screen Flow
- Purpose: Guided entry form for expense transactions. Supports file upload and creates a follow-up Task. Renames uploaded documents.

**`BUP_Display_Actual_Money_By_Fiscal_Year`**
- Type: Screen Flow
- Purpose: Dashboard-style flow to display income/expense totals filtered by fiscal year.

**`BUP_Short_Message_Producer`**
- Type: Screen Flow
- Purpose: Utility flow (exact purpose not inspected; likely sends a notification or produces a summary message).

---

## Apex Controllers

### BUP_BalanceController (`with sharing`)

Single cacheable method for the dashboard widget.

```soql
SELECT SUM(Amount__c) totalIncome FROM Income_Transaction__c
SELECT SUM(Amount__c) totalExpense FROM Expense_Transaction__c
```

Returns `totalIncome - totalExpenses` as a `Decimal`. Nulls are coerced to zero.

### BUP_ContributionStatementController (`with sharing`)

Four methods used by the `bupContributionStatement` and `bupSingleReceipt` LWC components.

**getAllTransactionsByContact(contactId)** — cacheable
```soql
SELECT Id, Name, Amount__c, Income_Date__c, Income_Type__c,
       Description__c, Income_Budget__r.Category__c
FROM Income_Transaction__c
WHERE Contact__c = :contactId
ORDER BY Income_Date__c DESC
```

**getTransactionsByDateRange(contactId, startDate, endDate)** — non-cacheable (dynamic filter)
```soql
SELECT Id, Name, Amount__c, Income_Date__c, Income_Type__c,
       Description__c, Income_Budget__r.Category__c
FROM Income_Transaction__c
WHERE Contact__c = :contactId
  AND Income_Date__c >= :startDate
  AND Income_Date__c <= :endDate
ORDER BY Income_Date__c DESC
```

**getContactInfo(contactId)** — cacheable
```soql
SELECT Id, Name, Email, MailingStreet, MailingCity, MailingState,
       MailingPostalCode, MailingCountry
FROM Contact WHERE Id = :contactId LIMIT 1
```

**getTransactionDetails(transactionId)** — non-cacheable
```soql
SELECT Id, Name, Amount__c, Income_Date__c, Income_Type__c, Description__c,
       Contact__r.Name, Contact__r.MailingStreet, Contact__r.MailingCity,
       Contact__r.MailingState, Contact__r.MailingPostalCode, Contact__r.MailingCountry,
       Account__r.Name, Account__r.BillingStreet, Account__r.BillingCity,
       Account__r.BillingState, Account__r.BillingPostalCode, Account__r.BillingCountry
FROM Income_Transaction__c WHERE Id = :transactionId LIMIT 1
```

### BUP_IncomeTransactionEntryController (`without sharing`)

Three methods used by the `bupRecurringDonationPayment` LWC component.

**searchContacts(searchTerm)** — cacheable
```soql
SELECT Id, Name, Email, Phone, Account.Name
FROM Contact WHERE Name LIKE :'%' + searchTerm + '%' LIMIT 10
```

**getRecurringDonations(contactId)** — cacheable
```soql
SELECT Id, Name, Promised_Donation_Amount__c, Status__c, Description__c,
       Total_Amount_Received__c, Total_Amount_Left_to_Receive__c
FROM Recurring_Donation__c
WHERE Contact__c = :contactId AND Status__c = 'Active'
```

**createIncomeTransaction(recurringDonationId, contactId, amount, incomeDate, description)** — DML
- Looks up `Contact.AccountId` to auto-populate `Account__c`.
- Creates `Income_Transaction__c` with `Income_Type__c = 'Recurring Donation'` (hardcoded).
- Note: `Income_Budget__c` is NOT set by this method — the budget link is established at the `Recurring_Donation__c` level and derived via the formula field `Income_Transaction_Fiscal_Year__c`.

---

## Data Integrity Rules and Constraints

### Field-level constraints (metadata-enforced)

| Rule | Object | Mechanism |
|------|--------|-----------|
| `Expense_Budget__c` is required on every expense transaction | `Expense_Transaction__c` | `required: true` on lookup field |
| `Income_Budget__c` is required on every recurring donation | `Recurring_Donation__c` | `required: true` on lookup field |
| `Fiscal_Year__c` on Recurring Donation must match `Fiscal_Year__c` of its Income Budget | `Recurring_Donation__c` | Validation rule `Recurring_Donation_FY_Must_Match_Budget` |
| Cannot delete an Expense Budget that has transactions | `Expense_Transaction__c.Expense_Budget__c` | `deleteConstraint: Restrict` |
| Cannot delete an Income Budget that has recurring donations | `Recurring_Donation__c.Income_Budget__c` | `deleteConstraint: Restrict` |
| Cannot delete an Account with income transactions | `Income_Transaction__c.Account__c` | `deleteConstraint: Restrict` |

### Implied business rules (enforced by automation and UI patterns)

- `Income_Transaction__c.Income_Budget__c` is technically optional in the schema but is treated as required in the `BUP_Income_Transaction_Entry` screen flow — the flow presents it as a required screen field.
- The `Status__c` field on `Recurring_Donation__c` defaults to `Active`. The controller filters only `Active` records when presenting pledges for payment.
- All picklists on custom objects are restricted — no free-text values are permitted.
- Fiscal year values are global and restricted; adding a new year requires a metadata deployment.

---

## Known Limitations

1. **Recurring donation totals are not recalculated on Income Transaction reassignment.** If an `Income_Transaction__c` linked to a `Recurring_Donation__c` is deleted or its `Recurring_Donation__c` lookup is changed, the `Total_Amount_Left__c` on the parent `Recurring_Donation__c` is not reliably updated. Workaround: manually trigger a field edit (touch-and-save) on the `Recurring_Donation__c` record to fire the after-save flow.

2. **`Income_Budget__c` is not set when creating transactions via `bupRecurringDonationPayment`.** The `BUP_IncomeTransactionEntryController.createIncomeTransaction()` method does not populate `Income_Budget__c` on the new `Income_Transaction__c`. Budget aggregation for recurring donation payments relies on the flow traversing the `Recurring_Donation__c → Income_Budget__c` path rather than a direct budget lookup on the transaction.

3. **`BUP_Expense_Budget_Before_Update` uses `RecordAfterSave`.** Despite being named "Before Update," the flow metadata declares `triggerType: RecordAfterSave`. This means the name is set in a separate DML operation after the record saves, not in-memory before commit. This is inconsistent with the Income Budget and Recurring Donation name flows (which correctly use `RecordBeforeSave`).

4. **`Expense_Transaction_Fiscal_Year_c__c` field naming anomaly.** The API name ends in `_c__c` (double suffix), indicating the field was created with an accidental extra `c` in the label or API name at the time of creation. The formula is correct and functional; the name is cosmetically wrong.

5. **`Total_Amount_Spent__c` and `Total_Amount_Received__c` on budget objects are plain Currency fields written by flows, not Roll-Up Summary fields.** This means they are susceptible to drift if the flow fails, is deactivated, or if records are bulk-loaded without triggering flows. A Roll-Up Summary field (master-detail) or a scheduled recalculation job would be more resilient but would require converting the lookup relationships to master-detail relationships, which is a significant schema change.

---

## LWC Components and Their Data Contracts

| Component | Quick Action Target | Primary Apex Method | Key Fields Read |
|-----------|--------------------|--------------------|----------------|
| `bupNetBalance` | App Page | `BUP_BalanceController.getNetBalance` | `Income_Transaction__c.Amount__c`, `Expense_Transaction__c.Amount__c` |
| `bupContributionStatement` | Contact | `BUP_ContributionStatementController.getTransactionsByDateRange` | `Income_Transaction__c`: Name, Amount__c, Income_Date__c, Income_Type__c, Description__c, Income_Budget__r.Category__c |
| `bupSingleReceipt` | Income_Transaction__c | `BUP_ContributionStatementController.getTransactionDetails` | Income_Transaction__c with Contact and Account address fields |
| `bupRecurringDonationPayment` | (standalone) | `BUP_IncomeTransactionEntryController.*` | Contact search, Recurring_Donation__c active pledges, creates Income_Transaction__c |
