public with sharing class BUP_ContributionStatementController {
    /**
     * Get all Income Transactions for a given Contact (no date filter)
     */
    @AuraEnabled(cacheable=true)
    public static List<Income_Transaction__c> getAllTransactionsByContact(Id contactId) {
        return [
            SELECT Id,
                   Name,
                   Amount__c,
                   Income_Date__c,
                   Income_Type__c,
                   Description__c,
                   Income_Budget__r.Category__c
            FROM Income_Transaction__c
            WHERE Contact__c = :contactId
            ORDER BY Income_Date__c DESC
        ];
    }
    
    /**
     * Get Income Transactions with date range filter
     */
    @AuraEnabled(cacheable=false)
    public static List<Income_Transaction__c> getTransactionsByDateRange(
        Id contactId, 
        Date startDate, 
        Date endDate
    ) {
        return [
            SELECT Id,
                   Name,
                   Amount__c,
                   Income_Date__c,
                   Income_Type__c,
                   Description__c,
                   Income_Budget__r.Category__c
            FROM Income_Transaction__c
            WHERE Contact__c = :contactId
              AND Income_Date__c >= :startDate
              AND Income_Date__c <= :endDate
            ORDER BY Income_Date__c DESC
        ];
    }
    
    /**
     * Get Contact (Donor) information for the receipt
     */
    @AuraEnabled(cacheable=true)
    public static Contact getContactInfo(Id contactId) {
        return [
            SELECT Id, 
                   Name, 
                   Email,
                   MailingStreet,
                   MailingCity,
                   MailingState,
                   MailingPostalCode,
                   MailingCountry
            FROM Contact
            WHERE Id = :contactId
            LIMIT 1
        ];
    }
}