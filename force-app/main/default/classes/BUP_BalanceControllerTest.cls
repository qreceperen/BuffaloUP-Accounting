@IsTest
private class BUP_BalanceControllerTest {

    // Utility method to create a minimal Income Budget
    private static Income_Budget__c createIncomeBudget() {
        Income_Budget__c budget = new Income_Budget__c(
            Category__c = 'Other',
            Planned_Amount__c = 1000
        );
        insert budget;
        return budget;
    }

    // Utility method to create a minimal Expense Budget
    private static Expense_Budget__c createExpenseBudget() {
        Expense_Budget__c budget = new Expense_Budget__c(
            Category__c = 'Others',
            Planned_Amount__c = 1000
        );
        insert budget;
        return budget;
    }

    @IsTest
    static void testGetNetBalance_withData() {
        // Create budgets first
        Income_Budget__c incomeBudget = createIncomeBudget();
        Expense_Budget__c expenseBudget = createExpenseBudget();

        // --- SETUP TEST DATA ---
        List<Income_Transaction__c> incomes = new List<Income_Transaction__c>{
            new Income_Transaction__c(Amount__c = 500, Income_Budget__c = incomeBudget.Id),
            new Income_Transaction__c(Amount__c = 400, Income_Budget__c = incomeBudget.Id),
            new Income_Transaction__c(Amount__c = 300, Income_Budget__c = incomeBudget.Id)
        };

        List<Expense_Transaction__c> expenses = new List<Expense_Transaction__c>{
            new Expense_Transaction__c(Amount__c = 200, Expense_Budget__c = expenseBudget.Id),
            new Expense_Transaction__c(Amount__c = 500, Expense_Budget__c = expenseBudget.Id)
        };

        insert incomes;
        insert expenses;

        // --- EXECUTE METHOD ---
        Test.startTest();
        Decimal result = BUP_BalanceController.getNetBalance();
        Test.stopTest();

        // --- VERIFY ---
        Assert.areEqual(500, result, 'Net balance should equal total income minus total expense.');
    }

    @IsTest
    static void testGetNetBalance_withNoRecords() {
        Test.startTest();
        Decimal result = BUP_BalanceController.getNetBalance();
        Test.stopTest();

        Assert.areEqual(0, result, 'If no records exist, balance should return 0.');
    }

    @IsTest
    static void testGetNetBalance_withOnlyIncome() {
        Income_Budget__c incomeBudget = createIncomeBudget();

        insert new Income_Transaction__c(Amount__c = 1000, Income_Budget__c = incomeBudget.Id);

        Test.startTest();
        Decimal result = BUP_BalanceController.getNetBalance();
        Test.stopTest();

        Assert.areEqual(1000, result, 'Should return total income when no expenses exist.');
    }

    @IsTest
    static void testGetNetBalance_withOnlyExpense() {
        Expense_Budget__c expenseBudget = createExpenseBudget();

        insert new Expense_Transaction__c(Amount__c = 300, Expense_Budget__c = expenseBudget.Id);

        Test.startTest();
        Decimal result = BUP_BalanceController.getNetBalance();
        Test.stopTest();

        Assert.areEqual(-300, result, 'Should return negative total when only expenses exist.');
    }
}