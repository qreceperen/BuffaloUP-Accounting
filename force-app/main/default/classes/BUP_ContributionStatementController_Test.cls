@isTest
private class BUP_ContributionStatementController_Test {
    
    /**
     * Setup basic test data
     */
    @TestSetup
    static void setupTestData() {
        // Create test Contact
        Contact donor = new Contact(
            FirstName = 'John',
            LastName = 'Donor',
            Email = 'john@example.com',
            MailingStreet = '123 Main St',
            MailingCity = 'Buffalo',
            MailingState = 'NY',
            MailingPostalCode = '14068'
        );
        insert donor;
        
        // Create Budget
        Income_Budget__c budget = new Income_Budget__c(
            Name = 'General',
            Category__c = 'One-Time Donations'
        );
        insert budget;
        
        // Create transactions
        List<Income_Transaction__c> transactions = new List<Income_Transaction__c>();
        transactions.add(new Income_Transaction__c(
            Contact__c = donor.Id,
            Amount__c = 100,
            Income_Date__c = Date.today(),
            Income_Type__c = 'Recurring Donation',
            Income_Budget__c = budget.Id
        ));
        transactions.add(new Income_Transaction__c(
            Contact__c = donor.Id,
            Amount__c = 200,
            Income_Date__c = Date.today().addDays(-30),
            Income_Type__c = 'One - Time Donation',
            Income_Budget__c = budget.Id
        ));
        transactions.add(new Income_Transaction__c(
            Contact__c = donor.Id,
            Amount__c = 150,
            Income_Date__c = Date.today().addDays(-90),
            Income_Type__c = 'Grant',
            Income_Budget__c = budget.Id
        ));
        insert transactions;
    }
    
    /**
     * Test: Get all transactions
     */
    @isTest
    static void testGetAllTransactions() {
        Contact donor = [SELECT Id FROM Contact LIMIT 1];
        
        Test.startTest();
        List<Income_Transaction__c> result = 
            BUP_ContributionStatementController.getAllTransactionsByContact(donor.Id);
        Test.stopTest();
        
        Assert.areEqual(3, result.size());
    }
    
    /**
     * Test: Get transactions by date range
     */
    @isTest
    static void testGetTransactionsByDateRange() {
        Contact donor = [SELECT Id FROM Contact LIMIT 1];
        Date startDate = Date.today().addDays(-60);
        Date endDate = Date.today();
        
        Test.startTest();
        List<Income_Transaction__c> result = 
            BUP_ContributionStatementController.getTransactionsByDateRange(
                donor.Id, startDate, endDate
            );
        Test.stopTest();
        
        Assert.areEqual(2, result.size());
    }
    
    /**
     * Test: Get transactions - narrow date range
     */
    @isTest
    static void testGetTransactionsByDateRange_Narrow() {
        Contact donor = [SELECT Id FROM Contact LIMIT 1];
        Date startDate = Date.today().addDays(-40);
        Date endDate = Date.today().addDays(-20);
        
        Test.startTest();
        List<Income_Transaction__c> result = 
            BUP_ContributionStatementController.getTransactionsByDateRange(
                donor.Id, startDate, endDate
            );
        Test.stopTest();
        
        Assert.areEqual(1, result.size());
    }
    
    /**
     * Test: Get transactions - wide date range
     */
    @isTest
    static void testGetTransactionsByDateRange_Wide() {
        Contact donor = [SELECT Id FROM Contact LIMIT 1];
        Date startDate = Date.today().addDays(-100);
        Date endDate = Date.today();
        
        Test.startTest();
        List<Income_Transaction__c> result = 
            BUP_ContributionStatementController.getTransactionsByDateRange(
                donor.Id, startDate, endDate
            );
        Test.stopTest();
        
        Assert.areEqual(3, result.size());
    }
    
    /**
     * Test: Get transactions - no results
     */
    @isTest
    static void testGetTransactionsByDateRange_NoResults() {
        Contact donor = [SELECT Id FROM Contact LIMIT 1];
        Date startDate = Date.today().addYears(-2);
        Date endDate = Date.today().addYears(-1);
        
        Test.startTest();
        List<Income_Transaction__c> result = 
            BUP_ContributionStatementController.getTransactionsByDateRange(
                donor.Id, startDate, endDate
            );
        Test.stopTest();
        
        Assert.areEqual(0, result.size());
    }
    
    /**
     * Test: Get contact info
     */
    @isTest
    static void testGetContactInfo() {
        Contact donor = [SELECT Id FROM Contact LIMIT 1];
        
        Test.startTest();
        Contact result = BUP_ContributionStatementController.getContactInfo(donor.Id);
        Test.stopTest();
        
        Assert.areEqual('John Donor', result.Name);
        Assert.areEqual('john@example.com', result.Email);
    }
    
    /**
     * Test: Contact with no transactions
     */
    @isTest
    static void testContactNoTransactions() {
        Contact newDonor = new Contact(
            FirstName = 'Jane',
            LastName = 'Smith',
            Email = 'jane@example.com'
        );
        insert newDonor;
        
        Test.startTest();
        List<Income_Transaction__c> result = 
            BUP_ContributionStatementController.getAllTransactionsByContact(newDonor.Id);
        Test.stopTest();
        
        Assert.areEqual(0, result.size());
    }
    
    /**
     * Test: Verify transaction fields
     */
    @isTest
    static void testTransactionFields() {
        Contact donor = [SELECT Id FROM Contact LIMIT 1];
        
        Test.startTest();
        List<Income_Transaction__c> result = 
            BUP_ContributionStatementController.getAllTransactionsByContact(donor.Id);
        Test.stopTest();
        
        Assert.isNotNull(result[0].Name);
        Assert.isNotNull(result[0].Amount__c);
        Assert.isNotNull(result[0].Income_Date__c);
    }
}