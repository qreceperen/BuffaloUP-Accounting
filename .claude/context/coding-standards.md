# Coding Standards

## Apex Class Rules
- `with sharing` on all classes, no exceptions without comment
- One trigger per object, always
- Handler class pattern, always
- No hardcoded IDs or Strings
- JSDoc comments on all public methods
- @description header on all classes

## Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| Class | PascalCase | AccountHandler |
| Trigger | PascalCase + Trigger | AccountTrigger |
| Handler | PascalCase + TriggerHandler | AccountTriggerHandler |
| Test Class | PascalCase + Test | AccountHandlerTest |
| Method | camelCase | getActiveAccounts |
| Variable | camelCase | accountList |
| Constant | UPPER_SNAKE_CASE | MAX_RECORDS |
| Custom Object | PascalCase + __c | Customer_Installation__c |
| Custom Field | PascalCase + __c | Install_Date__c |
| Lookup Field | ObjectName + __c | Account__c |

## SOQL Rules
- Never inside loops
- Always specify fields, no SELECT *
- Always add LIMIT on exploratory queries
- Use Maps for collections
- Always selective → indexed field in WHERE clause

## DML Rules  
- Never inside loops
- Always try/catch
- Use Database.insert/update with allOrNone=false for batch
- Collect all records first, one DML at end

## Test Rules
- @TestSetup always
- Never SeeAllData=true
- TestDataFactory for all test data
- Test bulk (200), single, negative always
- Assert.areEqual not System.assertEquals (modern API)
- Meaningful assert messages always

## Comments
- Class level: @description what this class does
- Method level: @description, @param, @return
- Inline: explain WHY not WHAT