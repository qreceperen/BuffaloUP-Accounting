# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Buffalo UP Accounting is a Salesforce (SFDX) project for Buffalo United for Peace Inc, a 501(c)(3) nonprofit. It manages donor contributions, budgets, recurring donations, and generates tax receipts. API version: 61.0.

## Common Commands

### LWC Development
```bash
npm run lint                   # ESLint on LWC files
npm run prettier               # Format all files
npm run prettier:verify        # Check formatting without writing
npm run test:unit              # Run Jest unit tests for LWCs
npm run test:unit:watch        # Watch mode
npm run test:unit:coverage     # Coverage report
```

### Salesforce CLI (SF CLI v2)
```bash
sf project deploy start        # Deploy source to org
sf project retrieve start      # Pull metadata from org
sf apex run test               # Run all Apex tests
sf apex run test -n BUP_BalanceControllerTest   # Run single test class
sf apex run --file scripts/apex/hello.apex      # Run anonymous Apex
```

### Pre-commit
Husky runs `lint-staged` automatically on commit (prettier + eslint on staged LWC files).

## Architecture

### Data Model
Five custom objects form the core:
- **Income_Budget__c** / **Expense_Budget__c** — Budget plans by category and fiscal year; use Roll-Up Summary fields to aggregate transaction totals
- **Income_Transaction__c** — Individual income records; **required** lookup to `Income_Budget__c`, optional lookup to `Recurring_Donation__c`
- **Expense_Transaction__c** — Individual expense records; **required** lookup to `Expense_Budget__c`
- **Recurring_Donation__c** — Multi-payment pledges; **required** lookup to `Income_Budget__c`; links to Contact or Account

Fiscal Year is a Global Value Set (`Fiscal_Year__c` picklist) shared across all objects.

### Automation — Flows Only (No Triggers)
All record automation is declarative. Key flows:
- `BUP_Calculate_Total_Amount_Income` / `..._When_Deleted` — Keeps Income_Budget totals in sync when income transactions change
- `Calculate_Total_Amount_Spent` — Same pattern for Expense_Budget
- Before-save flows for Income_Budget, Expense_Budget, and Recurring_Donation handle validation

**Known limitation:** Deleting or reassigning an `Income_Transaction__c` linked to a `Recurring_Donation__c` does not auto-recalculate `Total_Amount_Left__c` on the donation. Workaround: manually trigger a field edit on the `Recurring_Donation__c`.

### Apex Controllers (AuraEnabled)
All controllers are in `force-app/main/default/classes/`:
- **BUP_BalanceController** (`with sharing`) — Single cacheable method returns `totalIncome - totalExpenses` for the dashboard
- **BUP_ContributionStatementController** (`with sharing`) — Retrieves donor transactions and contact info for PDF receipt generation; `getTransactionsByDateRange` is non-cacheable due to dynamic filtering
- **BUP_IncomeTransactionEntryController** (`without sharing`) — Contact search and recurring donation lookup for entry forms; `createIncomeTransaction` auto-fetches Account from Contact

### LWC Components
All in `force-app/main/default/lwc/`:
- **bupNetBalance** — Dashboard widget; color-coded net balance (green/red/gray) wired to `BUP_BalanceController.getNetBalance`
- **bupContributionStatement** — Annual tax receipt PDF generator; Quick Action on Contact; uses jsPDF static resource and `bupLogo`; defaults date range to current calendar year
- **bupSingleReceipt** — Single transaction receipt PDF generator; Quick Action on `Income_Transaction__c`; lets user select donor as Contact or Account
- **bupRecurringDonationPayment** — Three-step form (search contact → pick recurring donation → log payment); creates `Income_Transaction__c` with `Income_Type = 'Recurring Donation'`

### PDF Generation
Both receipt components load `jspdf` from Static Resources at runtime using `loadScript`. The org logo is stored in the `bupLogo` static resource and embedded as Base64. EIN: 82-5086497.

### Testing
- Apex test classes follow the naming convention `*_Test.cls` or `*Test.cls`
- Test data is created inline in `@TestSetup` methods — no `@SeeAllData=true`
- LWC Jest tests can be added under `__tests__/` directories (currently excluded from deployments via `.forceignore`)
