# Salesforce Project Summary

## **Business Requirements**

1. **Tracking Promised Donations and Payments**:
    - Record and track individual donor pledges (recurring donations).
    - Track payments made towards these pledges.
    - Calculate total paid and outstanding amounts for each pledge.

2. **Tracking Different Sources of Income and Expenses**:
    - Record various types of income (e.g., donations, Facebook, other income).
    - Record different types of expenses (e.g., picnic, programs).

## **Solution Overview**

### **Objects and Fields**

1. **Account (Donor)**
    - Standard Salesforce object to store donor information.

2. **Recurring Donations (Custom Object)**
    - Track pledges and recurring donation commitments.
    - **Fields**:
        1. Account (Lookup to Account)
        2. **Amount Promised** (Currency)
        3. **Donation Date** (Date)
        4. **Fiscal Year** (Picklist)
            - Global Picklist Value
        5. **Description** (Text Area)
        6. **Status** (Picklist)
            - Values: Pending, Active, Completed, Cancelled
        7. **Total Paid** (Formula)
        8. **Amount Outstanding** (Formula)

3. **Transaction (Custom Object)**
    - Record all financial transactions, including income and expenses.
    - **Fields**:
        1. **Transaction Type** (Picklist)
            - Values: Income, Expense
        2. **Category** (Picklist)
            - Values: Facebook, Picnic, Rehberlik, etc.
        3. **Amount** (Currency)
        4. **Transaction Date** (Date)
        5. **Description** (Text Area)
        6. **Fiscal Year** (Picklist)
            - Values: FY2024, FY2025, FY2026, etc.
        7. **Transaction Name** (Text)
        8. Account (Optional Lookup to Account)

### **Key Features**

1. **Recurring Donations**:
    - Track individual donor pledges and commitments.
    - Monitor total amounts paid and outstanding.

2. **Transactions**:
    - Record various income sources and expenses.
    - Maintain detailed financial records for accurate reporting and analysis.

---

**Note**: To access the application, users need to be assigned the permission set `BUP_Accountant_Core`
