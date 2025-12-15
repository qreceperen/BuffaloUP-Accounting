public without sharing class BUP_IncomeTransactionEntryController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> searchContacts(String searchTerm) {
        if (String.isBlank(searchTerm)) {
            return new List<Contact>();
        }
        String key = '%' + searchTerm + '%';
        return [
            SELECT Id, Name, Email, Phone, Account.Name 
            FROM Contact 
            WHERE Name LIKE :key 
            LIMIT 10
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Recurring_Donation__c> getRecurringDonations(Id contactId) {
        return [
            SELECT Id, Name, Promised_Donation_Amount__c, Status__c, Description__c,
                   Total_Amount_Received__c, Total_Amount_Left_to_Receive__c 
            FROM Recurring_Donation__c 
            WHERE Contact__c = :contactId
            AND Status__c = 'Active'
        ];
    }

    @AuraEnabled
    public static void createIncomeTransaction(Id recurringDonationId, Id contactId, Decimal amount, Date incomeDate, String description) {
        Id accountId;
        if (contactId != null) {
            Contact c = [SELECT AccountId FROM Contact WHERE Id = :contactId LIMIT 1];
            accountId = c.AccountId;
        }

        Income_Transaction__c newTransaction = new Income_Transaction__c(
            Recurring_Donation__c = recurringDonationId,
            Contact__c = contactId,
            Account__c = accountId,
            Amount__c = amount,
            Income_Type__c = 'Recurring Donation',
            Income_Date__c = incomeDate,
            Description__c = description
        );
        insert newTransaction;
    }
}