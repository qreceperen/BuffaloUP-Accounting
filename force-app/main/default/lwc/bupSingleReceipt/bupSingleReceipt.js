import { LightningElement, api } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import { loadScript } from 'lightning/platformResourceLoader';
import jsPDF from '@salesforce/resourceUrl/jspdf';
import logoUrl from '@salesforce/resourceUrl/bupLogo';
import getTransactionDetails from '@salesforce/apex/BUP_ContributionStatementController.getTransactionDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BupSingleReceipt extends LightningElement {
    _recordId;

    jsPdfInitialized = false;
    isLoading = true;
    showSelection = false;
    logoDataUrl;
    transaction;

    @api
    get recordId() {
        return this._recordId;
    }

    set recordId(value) {
        console.log('DEBUG: set recordId called with:', value);
        this._recordId = value;
        if (value) {
            this.fetchTransactionData();
        }
    }

    get hasContact() {
        return this.transaction && this.transaction.Contact__r;
    }

    get hasAccount() {
        return this.transaction && this.transaction.Account__r;
    }

    get contactLabel() {
        return this.hasContact ? `Contact: ${this.transaction.Contact__r.Name}` : 'No Contact';
    }

    get accountLabel() {
        return this.hasAccount ? `Account: ${this.transaction.Account__r.Name}` : 'No Account';
    }

    get isContactDisabled() {
        return !this.hasContact;
    }

    get isAccountDisabled() {
        return !this.hasAccount;
    }

    get noRecipientAvailable() {
        return !this.hasContact && !this.hasAccount;
    }

    connectedCallback() {
        this.loadStaticResources();
    }

    async loadStaticResources() {
        try {
            await Promise.all([
                loadScript(this, jsPDF),
                this.loadLogoAsBase64()
            ]);
            this.jsPdfInitialized = true;
            this.checkLoadingState();
        } catch (error) {
            console.error('❌ Error loading resources:', error);
            this.showToast('Error', 'Failed to initialize PDF library', 'error');
            this.isLoading = false;
        }
    }

    loadLogoAsBase64() {
        return fetch(logoUrl)
            .then(response => response.blob())
            .then(blob => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        this.logoDataUrl = reader.result;
                        resolve();
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            });
    }

    async fetchTransactionData() {
        if (!this._recordId) return;

        try {
            console.log('DEBUG: Fetching data for recordId:', this._recordId);
            const data = await getTransactionDetails({ transactionId: this._recordId });
            console.log('DEBUG: Fetched Transaction:', JSON.stringify(data));

            this.transaction = data;

            if (!this.transaction) {
                // Even if null, we stop loading to show "No Recipient" message
                console.warn('Transaction not found or null returned');
            }

            this.checkLoadingState();

        } catch (txnError) {
            console.error('Error fetching transaction:', txnError);
            this.showToast('Error', 'Failed to fetch record data', 'error');
            this.isLoading = false;
        }
    }

    checkLoadingState() {
        // Only show selection if both scripts are loaded and we attempted a fetch (transaction is either set or null)
        // Note: We check if transaction is undefined (not fetched yet) vs null (fetched but empty)
        if (this.jsPdfInitialized && this.transaction !== undefined) {
            this.isLoading = false;
            this.showSelection = true;
        }
    }

    handleGenerateForContact() {
        this.generatePDF('Contact');
    }

    handleGenerateForAccount() {
        this.generatePDF('Account');
    }

    generatePDF(recipientType) {
        if (!this.jsPdfInitialized) return;

        this.showSelection = false;
        this.isLoading = true;

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            let yPosition = 15;
            const txn = this.transaction;

            // === LOGO AND ORGANIZATION INFO ===
            if (this.logoDataUrl) {
                try {
                    doc.addImage(this.logoDataUrl, 'PNG', 15, yPosition, 40, 22);
                } catch (error) {
                    console.error('Error adding logo to PDF:', error);
                }
            }

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Buffalo United for Peace Inc', 200, yPosition + 10, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            doc.text('EIN: 82-5086497', 200, yPosition + 15, { align: 'right' });
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.text('501(c)(3) Tax-Exempt Organization', 200, yPosition + 20, { align: 'right' });

            yPosition += 25;

            // === HEADER ===
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('DONATION RECEIPT', 105, yPosition, { align: 'center' });
            yPosition += 10;

            // === DONOR INFORMATION ===
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Donor Information:', 15, yPosition);
            yPosition += 5;

            doc.setFont('helvetica', 'normal');

            // Determine Donor Name and Address based on User Selection
            let donorName = '';
            let street = '';
            let city = '';
            let state = '';
            let zip = '';
            let country = '';

            if (recipientType === 'Contact' && txn.Contact__r) {
                donorName = txn.Contact__r.Name;
                street = txn.Contact__r.MailingStreet;
                city = txn.Contact__r.MailingCity;
                state = txn.Contact__r.MailingState;
                zip = txn.Contact__r.MailingPostalCode;
                country = txn.Contact__r.MailingCountry;
            } else if (recipientType === 'Account' && txn.Account__r) {
                donorName = txn.Account__r.Name;
                street = txn.Account__r.BillingStreet;
                city = txn.Account__r.BillingCity;
                state = txn.Account__r.BillingState;
                zip = txn.Account__r.BillingPostalCode;
                country = txn.Account__r.BillingCountry;
            }

            doc.text(`Name: ${donorName || 'N/A'}`, 15, yPosition);
            yPosition += 5;

            if (street) {
                doc.text(`Address: ${street}`, 15, yPosition);
                yPosition += 5;

                let cityStateZip = '';
                if (city) cityStateZip += city;
                if (state) cityStateZip += (cityStateZip ? ', ' : '') + state;
                if (zip) cityStateZip += ' ' + zip;
                if (country) cityStateZip += (cityStateZip ? ', ' : '') + country;

                if (cityStateZip) {
                    doc.text(`         ${cityStateZip}`, 15, yPosition);
                    yPosition += 5;
                }
            }

            const today = new Date().toLocaleDateString();
            doc.text(`Receipt Date: ${today}`, 15, yPosition);
            yPosition += 10;

            // === TRANSACTION DETAILS ===
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Donation Details', 15, yPosition);
            yPosition += 5;
            doc.line(15, yPosition, 195, yPosition);
            yPosition += 5;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');

            const date = txn.Income_Date__c ? new Date(txn.Income_Date__c).toLocaleDateString() : 'N/A';
            const type = txn.Income_Type__c || 'N/A';
            const amount = txn.Amount__c ? `$${txn.Amount__c.toFixed(2)}` : '$0.00';
            const refNumber = txn.Name || 'N/A';

            doc.text(`Date Received: ${date}`, 15, yPosition);
            yPosition += 5;
            doc.text(`Transaction Reference: ${refNumber}`, 15, yPosition);
            yPosition += 5;
            doc.text(`Type: ${type}`, 15, yPosition);
            yPosition += 5;

            doc.setFont('helvetica', 'bold');
            doc.text(`Amount: ${amount}`, 15, yPosition);
            yPosition += 10;

            doc.line(15, yPosition, 195, yPosition);
            yPosition += 10;

            // === THANK YOU MESSAGE ===
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text('Thank you for your generous contribution!', 105, yPosition, { align: 'center' });
            yPosition += 10;

            // === TAX DEDUCTIBILITY STATEMENT ===
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('Tax Deductibility Statement:', 15, yPosition);
            yPosition += 5;

            doc.setFont('helvetica', 'normal');
            const disclaimer = [
                'Buffalo United for Peace Inc is recognized as tax-exempt under Section 501(c)(3) of the',
                'Internal Revenue Code. Contributions are deductible under IRC Section 170. No goods or',
                'services were provided in exchange for these contributions.',
                '',
                'This contribution is tax-deductible to the extent allowed by law.'
            ];

            disclaimer.forEach(line => {
                doc.text(line, 15, yPosition);
                yPosition += 4;
            });

            yPosition += 20;

            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text('This receipt was electronically generated and does not require a signature.', 105, yPosition, { align: 'center' });

            const pageHeight = doc.internal.pageSize.height;
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.text('For questions about this receipt, please contact Buffalo United for Peace Inc.', 105, pageHeight - 15, { align: 'center' });
            doc.text('Thank you for your generous support!', 105, pageHeight - 10, { align: 'center' });

            const safeName = (donorName || 'Donor').replace(/[^a-z0-9]/gi, '_');
            const fileName = `Receipt_${safeName}_${date.replace(/\//g, '-')}.pdf`;
            doc.save(fileName);

            this.showToast('Success', 'Receipt downloaded successfully!', 'success');

            setTimeout(() => {
                this.handleClose();
            }, 1000);

        } catch (error) {
            console.error('❌ Error generating PDF:', error);
            this.showToast('Error', 'Failed to generate PDF: ' + error.message, 'error');
            this.isLoading = false;
        } finally {
            if (!this.transaction) this.isLoading = false;
        }
    }

    handleClose() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}