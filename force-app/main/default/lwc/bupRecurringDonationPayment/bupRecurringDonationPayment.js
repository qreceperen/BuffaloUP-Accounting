import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import searchContacts from '@salesforce/apex/BUP_IncomeTransactionEntryController.searchContacts';
import getRecurringDonations from '@salesforce/apex/BUP_IncomeTransactionEntryController.getRecurringDonations';
import createIncomeTransaction from '@salesforce/apex/BUP_IncomeTransactionEntryController.createIncomeTransaction';

export default class BupRecurringDonationPayment extends LightningElement {
    @track searchTerm = '';
    @track contacts;
    @track error;
    @track selectedContact;
    @track recurringDonations;
    @track selectedDonationId;

    // Form fields
    @track amount;
    @track incomeDate;
    @track description;

    handleSearch(event) {
        this.searchTerm = event.target.value;
        this.selectedContact = null;
        this.recurringDonations = null;
        this.selectedDonationId = null;
        this.resetForm();
    }

    @wire(searchContacts, { searchTerm: '$searchTerm' })
    wiredContacts({ error, data }) {
        if (data) {
            this.contacts = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.contacts = undefined;
        }
    }

    handleSelect(event) {
        const contactId = event.currentTarget.dataset.id;
        const selectedContact = this.contacts.find(c => c.Id === contactId);
        this.selectedContact = selectedContact;
        this.contacts = [];
        this.selectedDonationId = null;
        this.resetForm();

        getRecurringDonations({ contactId: contactId })
            .then(result => {
                this.recurringDonations = result;
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.recurringDonations = undefined;
            });
    }

    handleDonationSelect(event) {
        event.preventDefault();
        this.selectedDonationId = event.currentTarget.dataset.id;
        // Optionally set default amount from the donation record
        const selectedDonation = this.recurringDonations.find(rd => rd.Id === this.selectedDonationId);
        if (selectedDonation && selectedDonation.Promised_Donation_Amount__c) {
            this.amount = selectedDonation.Promised_Donation_Amount__c;
        }
    }

    handleInputChange(event) {
        const field = event.target.dataset.id;
        if (field === 'amount') {
            this.amount = event.target.value;
        } else if (field === 'date') {
            this.incomeDate = event.target.value;
        } else if (field === 'description') {
            this.description = event.target.value;
        }
    }

    resetForm() {
        this.amount = null;
        this.incomeDate = null;
        this.description = '';
    }

    handleSave() {
        if (!this.amount || !this.incomeDate || !this.selectedDonationId) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please fill in all required fields.',
                    variant: 'error'
                })
            );
            return;
        }

        createIncomeTransaction({
            recurringDonationId: this.selectedDonationId,
            contactId: this.selectedContact.Id,
            amount: this.amount,
            incomeDate: this.incomeDate,
            description: this.description
        })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Income Transaction created successfully',
                        variant: 'success'
                    })
                );
                this.selectedDonationId = null; // Maybe go back to donation list or clear form?
                this.resetForm();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating transaction',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }

    handleCancel() {
        this.selectedDonationId = null;
        this.resetForm();
    }
}