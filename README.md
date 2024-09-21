### Project Summary

#### Objects and Fields

**Income Budget**
- **Purpose**: To set and track financial goals for income.
- **Fields**:
  1. **Category** (Picklist): The category or source of the income (e.g., Facebook Donations, Direct Donations, Youth Program, Himmet).
  2. **Fiscal Year** (Picklist): The fiscal year for which the budget is planned (e.g., 2023-2024, 2024-2025).
  3. **Planned Amount** (Currency): The total amount of income planned for the fiscal year.
  4. **Total Amount Received** (Currency, Roll-Up Summary): The total amount of income received for the fiscal year.
  5. **Total Amount Left to Receive** (Formula): The remaining amount of income to be received, calculated as Planned Amount - Total Amount Received.
  6. **Description** (Text Area): Additional details or notes about the income budget.
  7. **Donor (Donors)** (Lookup to Account): The donor or organization associated with this income budget.
  8. **Uses Recurring Donations** (Checkbox): Indicates if this income budget involves recurring donations.

**Expense Budget**
- **Purpose**: To set and track financial goals for expenses.
- **Fields**:
  1. **Category** (Picklist): The category or purpose of the expense (e.g., Student Improvements, Operational Costs, Marketing Expenses).
  2. **Fiscal Year** (Picklist): The fiscal year for which the budget is planned (e.g., 2023-2024, 2024-2025).
  3. **Planned Amount** (Currency): The total amount of expenses planned for the fiscal year.
  4. **Total Amount Spent** (Currency, Roll-Up Summary): The total amount of expenses spent for the fiscal year.
  5. **Total Amount Left to Spend** (Formula): The remaining amount of expenses to be spent, calculated as Planned Amount - Total Amount Spent.
  6. **Description** (Text Area): Additional details or notes about the expense budget.
  7. **Donor (Donors)** (Lookup to Account): The vendor or payee associated with this expense budget.

**Recurring Donation**
- **Purpose**: To track individual recurring donations.
- **Fields**:
  1. **Donor Name** (Lookup to Donor (Donors)): The donor making the recurring donation.
  2. **Promised Amount** (Currency): The total amount promised by the donor for the fiscal year.
  3. **Donation Pledge Date** (Date): The date when the donor pledged the donation.
  4. **Fiscal Year** (Picklist): The fiscal year for which the donation is planned.
  5. **Description** (Text Area): Additional details or notes about the recurring donation.
  6. **Income Budget** (Lookup to Income Budget): The income budget category under which this recurring donation falls.
  7. **Total Amount Paid** (Currency): The total amount paid by the donor.
  8. **Total Amount Left** (Formula): The remaining amount left to be paid by the donor, calculated as Promised Amount - Total Amount Paid.

**Income Transactions**
- **Purpose**: To record individual income transactions.
- **Fields**:
  1. **Amount** (Currency): The amount of income received.
  2. **Income Date** (Date): The date when the income was received.
  3. **Fiscal Year** (Picklist): The fiscal year for which the income is recorded.
  4. **Description** (Text Area): Additional details or notes about the income transaction.
  5. **Recurring Donation** (Lookup to Recurring Donation): The recurring donation record associated with this income, if applicable.
  6. **Income Budget** (Lookup to Income Budget): The income budget under which this income transaction falls.
  7. **Donor (Donors)** (Lookup to Donor (Donors)): The donor from whom the income was received.
  8. **Income Type** (Picklist): The type of income transaction (e.g., Recurring Donation, One-time Donation, Grant, Sponsorship).

**Expense Transactions**
- **Purpose**: To record individual expense transactions.
- **Fields**:
  1. **Amount** (Currency): The amount of expense incurred.
  2. **Expense Date** (Date): The date when the expense was incurred.
  3. **Fiscal Year** (Picklist): The fiscal year for which the expense is recorded.
  4. **Description** (Text Area): Additional details or notes about the expense transaction.
  5. **Expense Budget** (Lookup to Expense Budget): The expense budget under which this expense transaction falls.
  6. **Donor (Donors)** (Lookup to Donor (Donors)): The vendor or payee to whom the expense was paid.
  7. **Expense Type** (Picklist): The type of expense transaction (e.g., Travel, Office Supplies, Advertising, Education Programs).

### Logic and Flows

#### Flow: BUP_Calculate Total Amount Spent
- **Purpose**: Automatically calculates and updates the `Total Amount Spent` in the `Expense Budget` object based on related `Expense` records. When a new Income record created or updated.

#### Flow: BUP_Calculate_Total_Amount_Income_When_Deleted
- **Purpose**: Automatically calculates and updates the `Total Amount Spent` in the `Expense Budget` object based on related `Expense` records. When an Income record is deleted.

#### Flow: BUP_Calculate Total Amount Income
- **Purpose**: Automatically calculates and updates the `Total Amount Received` in the `Income Budget` object by considering both normal income and recurring donations.
- **Logic**:
  - Checks the `Income Type` to decide whether to process as a normal income or a recurring donation.
  - For normal income, sums up the amounts of related income records and updates the `Total Amount Received` in the `Income Budget`.
  - For recurring donations, sums up the amounts of related income records, updates the `Total Amount Paid` and `Total Amount Left` in the `Recurring Donation` object, and then updates the `Total Amount Received` in the `Income Budget`.

#### Flow: Display_Actual_Money_By_Fiscal_Year
- **Purpose**: Calculates and displays the actual money available for a selected fiscal year by subtracting total expenses from total income.
- **Logic**:
  1. Screen to select Fiscal Year using a global picklist.
  2. Get Income Budget records filtered by the selected Fiscal Year.
  3. Get Expense Budget records filtered by the selected Fiscal Year.
  4. Loop through records to calculate total amounts.
  5. Display the calculated actual money on the home screen.





NOTLAR:
1. Recurring Donation lar kisinin verdigi himmet sozudur. (Mostly)
2. Her Income ve Expensin bir budget i olmalidir
3. 





PROBLEMS
1. When an Income made there is a flow updated total amount received. Lets say person A made 100, 50, 25 recurring amount. Total amount received = 175. But when we delete one of the record
Total amount received stays as 175. Because flow triggers when create or update happens. When we update any income trigger works and total amount received = 150. But we need to find a way when any income is deleted make auto calculation.
2. 


STORIES
1. Carry over kismi eklemeliyiz (simdilik manuel olabilir). Kisinin kalan miktarini carry over olarak yeni yila yazariz. Ama Balance sifirlanmali carry over dan sonra (yada oyle birakilip sorarsa
gosterilmeli bir not ile beraber)
2. Income Budgettegi Planned Amount verilen himmet sozlerine gore otomatik hesaplanabilir. Amam bu diger income budget degerlerini nasil etkiler detayli test yapilmali.
3. Recurring Donation girdilerini yapmak zor. Salesforce bilmeyen icin zor olabilir. Bunun icin Screen Flow yapip Home yada App Page de tutmak lazim. 
   - Himmet icin ayri
   - Donation icin ayri
   - Normal gelirler icin ayri  
   - Yada hep beraber deneyip gormek lazim

4. Expense ler hangi comminite tarafindan yapildi bunu belirleyecek bir picklist lazim
Income Budget Category addition 
  - Recurring Donation (Himmet)
  - One time Donation
  Income Budget record page visibility kurallarida ona gore sekillenmeli. Yani Type recurring is related tab da recurring donation gozukmeli, 
  type one-time Donations is Donationlar gozukmeli

5. Expense Transaction Object Edits
  - Payment Type i kaldir (NOTE)
  
