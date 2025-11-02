public with sharing class BUP_BalanceController {
    @AuraEnabled(cacheable=true)
    public static Decimal getNetBalance() {
        // Aggregate Income
        AggregateResult[] incomeAgg = [
            SELECT SUM(Amount__c) totalIncome
            FROM Income_Transaction__c
        ];

        // Aggregate Expense
        AggregateResult[] expenseAgg = [
            SELECT SUM(Amount__c) totalExpense
            FROM Expense_Transaction__c
        ];

        Decimal totalIncome = (Decimal)incomeAgg[0].get('totalIncome');
        Decimal totalExpense = (Decimal)expenseAgg[0].get('totalExpense');

        // Handle nulls gracefully
        if (totalIncome == null) totalIncome = 0;
        if (totalExpense == null) totalExpense = 0;

        // Return net balance
        return totalIncome - totalExpense;
    }
}