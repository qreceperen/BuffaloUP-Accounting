# Buffalo UP Accounting - Project Summary

## Project Overview
**Buffalo UP Accounting** is a Salesforce-based non-profit accounting system designed for Buffalo United for Peace Inc, a 501(c)(3) tax-exempt organization. The system tracks donations, expenses, recurring pledges, and generates donor contribution statements with tax receipts.

---

## Apex Classes

### 1. BUP_BalanceController.cls
**Purpose**: Provides financial balance calculations for the organization.

**Methods**:
- `getNetBalance()`: Calculates the organization's net balance
  - Aggregates all Income_Transaction__c amounts
  - Aggregates all Expense_Transaction__c amounts
  - Returns: Total Income - Total Expenses
  - Cacheable: Yes (for performance)

**Used By**: `bupNetBalance` LWC component

**Test Class**: `BUP_BalanceControllerTest.cls`

---

### 2. BUP_ContributionStatementController.cls
**Purpose**: Provides donor contribution data for tax receipts and statements.

**Methods**:
- `getAllTransactionsByContact(Id contactId)`: Retrieves all income transactions for a donor
  - Returns: List of Income_Transaction__c with related Income_Budget category
  - Cacheable: Yes
  - Ordered by: Income_Date__c DESC

- `getTransactionsByDateRange(Id contactId, Date startDate, Date endDate)`: Filters transactions by date range
  - Returns: List of Income_Transaction__c within specified dates
  - Cacheable: No (dynamic filtering)
  - Used for: Annual tax receipts

- `getContactInfo(Id contactId)`: Retrieves donor information
  - Returns: Contact with mailing address and email
  - Used for: Generating receipts with donor details

**Used By**: `bupContributionStatement` LWC component

**Test Class**: `BUP_ContributionStatementController_Test.cls`

---

## Lightning Web Components (LWC)

### 1. bupNetBalance
**Location**: `force-app/main/default/lwc/bupNetBalance/`

**Purpose**: Displays the organization's current net balance in real-time.

**Features**:
- Wire service connected to `BUP_BalanceController.getNetBalance()`
- Auto-refresh capability using `refreshApex()`
- Color-coded display:
  - Green for positive balance
  - Red for negative balance
  - Neutral for zero balance
- Real-time error handling

**Usage**: Embedded on home pages and dashboards to show current financial status.

---

### 2. bupContributionStatement
**Location**: `force-app/main/default/lwc/bupContributionStatement/`

**Purpose**: Generates and downloads PDF tax receipts for donors.

**Features**:
- **Date Range Selection**: Allows users to select custom date ranges (defaults to current year)
- **PDF Generation**: Uses jsPDF library loaded from Static Resources
- **Professional Layout**: Includes organization logo, EIN, and 501(c)(3) statement
- **Dynamic Content**:
  - Donor name and mailing address
  - Transaction table (Ref #, Date, Type, Amount)
  - Total donation amount
  - Tax deductibility disclaimer
- **Data Sources**:
  - Contact information from `getContactInfo()`
  - Transactions from `getTransactionsByDateRange()`
- **Static Resources Used**:
  - `jspdf`: PDF generation library
  - `bupLogo`: Organization logo for receipts

**Usage**: Quick Action on Contact records to download donor tax receipts.

---

## Custom Objects

### 1. Income_Budget__c
**Purpose**: Tracks planned income by category for each fiscal year.

**Key Fields**:
- `Category__c` (Picklist): Facebook Donations, Direct Donations, Youth Program, Himmet
- `Fiscal_Year__c` (Picklist): 2023-2024, 2024-2025, etc.
- `Planned_Amount__c` (Currency): Target income for the fiscal year
- `Total_Amount_Received__c` (Roll-Up Summary): Actual income received
- `Total_Amount_Left_to_Receive__c` (Formula): Planned - Received
- `Description__c` (Text Area): Notes
- `Uses_Recurring_Donations__c` (Checkbox): Indicates if category includes recurring pledges

**Relationships**:
- Lookup to: Account (Donor)
- Parent to: Income_Transaction__c (child records via "Incomes" relationship)
- Parent to: Recurring_Donation__c (child records via "Recurring_Donations" relationship)

---

### 2. Expense_Budget__c
**Purpose**: Tracks planned expenses by category for each fiscal year.

**Key Fields**:
- `Category__c` (Picklist): Student Improvements, Operational Costs, Marketing Expenses
- `Fiscal_Year__c` (Picklist): 2023-2024, 2024-2025, etc.
- `Planned_Amount__c` (Currency): Target expenses for the fiscal year
- `Total_Amount_Spent__c` (Roll-Up Summary): Actual expenses incurred
- `Total_Amount_Left_to_Spend__c` (Formula): Planned - Spent
- `Description__c` (Text Area): Notes

**Relationships**:
- Lookup to: Account (Vendor/Payee)
- Parent to: Expense_Transaction__c (child records)

---

### 3. Recurring_Donation__c
**Purpose**: Tracks multi-payment donor pledges (known as "Himmet" in Turkish).

**Key Fields**:
- `Donor_Name__c` (Lookup): Links to Account/Contact
- `Promised_Amount__c` (Currency): Total pledge amount for the fiscal year
- `Donation_Pledge_Date__c` (Date): Date of pledge
- `Fiscal_Year__c` (Picklist): Fiscal year
- `Total_Amount_Paid__c` (Currency): Sum of payments received
- `Total_Amount_Left__c` (Formula): Promised - Paid
- `Description__c` (Text Area): Notes

**Relationships**:
- **Required Lookup** to: Income_Budget__c (every recurring donation must have a budget category)
- Lookup to: Account (Donor)
- Parent to: Income_Transaction__c (payments made against the pledge)

---

### 4. Income_Transaction__c
**Purpose**: Records individual income/donation transactions.

**Key Fields**:
- `Amount__c` (Currency): Transaction amount
- `Income_Date__c` (Date): Date received
- `Income_Type__c` (Picklist): Recurring Donation, One-time Donation, Grant, Sponsorship
- `Fiscal_Year__c` (Picklist): Fiscal year
- `Description__c` (Text Area): Notes

**Relationships**:
- Lookup to: **Income_Budget__c** (required - every income must have a budget)
- Lookup to: **Recurring_Donation__c** (optional - if this is a pledge payment)
- Lookup to: Account (Donor)
- Lookup to: Contact (Donor contact person)

---

### 5. Expense_Transaction__c
**Purpose**: Records individual expense transactions.

**Key Fields**:
- `Amount__c` (Currency): Transaction amount
- `Expense_Date__c` (Date): Date incurred
- `Expense_Type__c` (Picklist): Travel, Office Supplies, Advertising, Education Programs
- `Fiscal_Year__c` (Picklist): Fiscal year
- `Description__c` (Text Area): Notes
- `Payment_Type__c` (Picklist): To be deprecated

**Relationships**:
- Lookup to: **Expense_Budget__c** (required - every expense must have a budget)
- Lookup to: Account (Vendor/Payee)
- Lookup to: Contact (Vendor contact)

---

### 6. Account (Extended Standard Object)
**Purpose**: Represents Donors and Vendors.

**Custom Fields**:
- `Email__c` (Text): Email address for the account

**Relationships**:
- Referenced by: Income_Budget__c, Expense_Budget__c, Recurring_Donation__c, Income_Transaction__c, Expense_Transaction__c

---

## Object Relationship Diagram

```
┌─────────────────────┐
│      Account        │
│   (Donor/Vendor)    │
└──────────┬──────────┘
           │
           │ Lookup
           │
    ┌──────┴──────┬──────────────────────────┬─────────────────┐
    │             │                          │                 │
    ▼             ▼                          ▼                 ▼
┌─────────────────────┐              ┌─────────────────────┐  │
│  Income_Budget__c   │              │ Expense_Budget__c   │  │
│  (Budget Planning)  │              │  (Budget Planning)  │  │
└──────┬──────────────┘              └──────┬──────────────┘  │
       │                                    │                 │
       │ Parent                             │ Parent          │
       │                                    │                 │
       ├─────────────┬──────────────────────┤                 │
       │             │                      │                 │
       ▼             ▼                      ▼                 │
┌─────────────────────┐              ┌─────────────────────┐ │
│Recurring_Donation__c│              │Expense_Transaction__c│ │
│  (Pledge Tracking)  │              │   (Actual Expense)   │ │
└──────┬──────────────┘              └─────────────────────┘ │
       │                                                      │
       │ Parent                                               │
       │                                                      │
       ▼                                                      │
┌─────────────────────┐◄─────────────────────────────────────┘
│Income_Transaction__c│
│   (Actual Income)   │
└─────────────────────┘
```

### Relationship Details:

**Income Flow**:
1. **Income_Budget__c** → Income_Transaction__c (one-to-many)
2. **Income_Budget__c** → Recurring_Donation__c (one-to-many, required lookup)
3. **Recurring_Donation__c** → Income_Transaction__c (one-to-many, optional lookup)
4. **Account** → Income_Transaction__c (donor lookup)
5. **Contact** → Income_Transaction__c (donor contact lookup)

**Expense Flow**:
1. **Expense_Budget__c** → Expense_Transaction__c (one-to-many)
2. **Account** → Expense_Transaction__c (vendor lookup)
3. **Contact** → Expense_Transaction__c (vendor contact lookup)

---

## Data Flow & Business Logic

### Income Processing Flow:
```
1. Donor pledges $1,000 for fiscal year
   ↓
2. Create Recurring_Donation__c record
   - Promised_Amount__c = $1,000
   - Links to Income_Budget__c (e.g., "Himmet" category)
   ↓
3. Donor makes first payment of $250
   ↓
4. Create Income_Transaction__c record
   - Amount__c = $250
   - Income_Type__c = "Recurring Donation"
   - Links to Income_Budget__c
   - Links to Recurring_Donation__c
   ↓
5. Flow: BUP_Calculate_Total_Amount_Income triggers
   - Updates Recurring_Donation__c.Total_Amount_Paid = $250
   - Updates Recurring_Donation__c.Total_Amount_Left = $750
   - Updates Income_Budget__c.Total_Amount_Received
   ↓
6. Donor makes second payment of $250
   ↓
7. Repeat steps 4-5 until pledge is fulfilled
```

### Expense Processing Flow:
```
1. Create Expense_Budget__c for "Operational Costs"
   - Planned_Amount__c = $5,000 for fiscal year
   ↓
2. Expense incurred: $500 for office supplies
   ↓
3. Create Expense_Transaction__c record
   - Amount__c = $500
   - Expense_Type__c = "Office Supplies"
   - Links to Expense_Budget__c
   ↓
4. Flow: Calculate_Total_Amount_Spent triggers
   - Updates Expense_Budget__c.Total_Amount_Spent = $500
   - Formula calculates Total_Amount_Left_to_Spend = $4,500
```

### Balance Calculation:
```
Net Balance = SUM(All Income_Transaction__c.Amount__c)
            - SUM(All Expense_Transaction__c.Amount__c)

Displayed in real-time via bupNetBalance LWC
```

---

## Automation (Flows)

### Record-Triggered Flows:
1. **BUP_Calculate_Total_Amount_Income**: Updates Income_Budget totals when Income_Transaction is created/updated
2. **BUP_Calculate_Total_Amount_Income_When_Deleted**: Recalculates Income_Budget totals when Income_Transaction is deleted
3. **Calculate_Total_Amount_Spent**: Updates Expense_Budget totals when Expense_Transaction is created/updated
4. **Before-Update Flows**: Data validation and field auto-population for budgets and recurring donations

### Screen Flows:
1. **BUP_Display_Actual_Money_By_Fiscal_Year**: Dashboard flow showing net balance by fiscal year
2. **BUP_Income_Transaction_Entry**: Guided transaction creation
3. **BUP_Expense_Transaction_Entry**: Guided expense creation

---

## Key Integration Points

### Apex ↔ LWC:
- **BUP_BalanceController** ↔ **bupNetBalance**: Real-time balance display
- **BUP_ContributionStatementController** ↔ **bupContributionStatement**: PDF receipt generation

### Flow ↔ Objects:
- Flows automatically maintain roll-up calculations
- No Apex triggers used (fully declarative automation)

### Static Resources:
- **jspdf**: JavaScript library for PDF generation (used by bupContributionStatement)
- **bupLogo**: Organization logo embedded in tax receipts

---

## Known Issues

### Critical:
1. **Recurring Donation Recalculation Bug**: When an Income_Transaction__c linked to a Recurring_Donation__c is deleted or reassigned to a different donor, the Recurring_Donation__c.Total_Amount_Left does not automatically recalculate.
   - **Workaround**: Manual update of any field on the Recurring_Donation__c record triggers recalculation.
   - **Root Cause**: Flow triggers on create/update only, not on child record deletion.

### Feature Requests:
1. Carry-over system for unused budget amounts to next fiscal year
2. Auto-calculate Income_Budget__c.Planned_Amount from Recurring_Donation pledges
3. Add Community picklist to Expense_Transaction__c
4. Income_Budget__c needs Type field (Recurring vs One-time) with dynamic page layouts
5. Active/Inactive status flags needed on all budget and recurring donation objects

---

## Development Notes

- **API Version**: 61.0
- **Package Name**: BuffaloUpAccounting
- **No Triggers**: All automation via Flows (declarative)
- **Test Coverage**: All Apex classes have corresponding test classes
- **Pre-commit Hooks**: Prettier and ESLint enforced via Husky
