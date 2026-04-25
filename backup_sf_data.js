
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// The objects we want to back up
const OBJECTS_TO_BACKUP = [
    'Account',
    'Contact',
    'Income_Budget__c',
    'Income_Transaction__c',
    'Expense_Budget__c',
    'Expense_Transaction__c',
    'Recurring_Donation__c'
];

// Create a timestamped backup folder
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + new Date().getHours() + new Date().getMinutes();
const backupDir = path.join(__dirname, `backups_${timestamp}`);

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

console.log(`\n=== Starting Salesforce Data Backup ===`);
console.log(`Saving to folder: ${backupDir}\n`);

OBJECTS_TO_BACKUP.forEach(objName => {
    try {
        console.log(`Processing: ${objName}...`);

        // 1. Get all fields for the object
        const describeOutput = execSync(`sf sobject describe -o ${objName} --json`, { encoding: 'utf-8' });
        const describeJson = JSON.parse(describeOutput);

        if (describeJson.status !== 0) {
            console.error(`Error describing ${objName}: ${describeJson.message}`);
            return;
        }

        const fields = describeJson.result.fields;

        // 2. Build our field list for the query
        let queryFields = [];
        let relationFields = [];

        fields.forEach(field => {
            queryFields.push(field.name);

            // 3. ✨ MAGIC: Automatically pull the "Name" of any related record!
            // If this field is a Lookup/Master-Detail (e.g., Contact__c or AccountId)
            if (field.type === 'reference' && field.relationshipName) {
                // E.g., Contact__c -> Contact__r.Name
                // AccountId -> Account.Name
                const relName = field.relationshipName;

                // Exclude some internal tracking/system relations that don't always have "Name"
                const excludedRelations = ['Owner', 'CreatedBy', 'LastModifiedBy', 'RecordType'];

                if (!excludedRelations.includes(relName)) {
                    relationFields.push(`${relName}.Name`);
                }
            }
        });

        // Combine standard fields and our readable relation fields
        const allQueryFields = [...queryFields, ...relationFields].join(',');

        // 4. Construct the query
        // Note: For huge data volumes, you might need to handle pagination, 
        // but sf data query handles standard batches nicely out of the box.
        const query = `SELECT ${allQueryFields} FROM ${objName}`;

        // 5. Run the query and export to CSV
        const csvFilePath = path.join(backupDir, `${objName}.csv`);
        console.log(`  -> Downloading data to ${objName}.csv...`);

        execSync(`sf data query -q "${query}" -r csv > "${csvFilePath}"`, { encoding: 'utf-8', stdio: 'pipe' });

        console.log(`  -> Success! Saved ${objName}.csv`);

    } catch (err) {
        console.error(`Failed to process ${objName}`);
        // Log brief error message (usually if there's no data or a query error)
        console.error(err.message || err);
    }
});

console.log(`\n=== Backup Complete! ===`);
console.log(`Your readable Excel/CSV files are located in: ${backupDir}\n`);
