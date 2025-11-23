import { LightningElement, api } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import { loadScript } from 'lightning/platformResourceLoader';
import jsPDF from '@salesforce/resourceUrl/jspdf';
import logoUrl from '@salesforce/resourceUrl/bupLogo';
import getTransactionsByDateRange from '@salesforce/apex/BUP_ContributionStatementController.getTransactionsByDateRange';
import getContactInfo from '@salesforce/apex/BUP_ContributionStatementController.getContactInfo';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BupDownloadReceipt extends LightningElement {
    @api recordId;
    jsPdfInitialized = false;
    isLoading = false;
    logoDataUrl;
    
    // Date range properties
    startDate;
    endDate;

    // Initialize when component loads
    connectedCallback() {
        this.initializeResources();
        this.setDefaultDateRange();
    }

    // Set default date range to current year
    setDefaultDateRange() {
        const now = new Date();
        const currentYear = now.getFullYear();
        
        // January 1st of current year
        this.startDate = `${currentYear}-01-01`;
        
        // December 31st of current year
        this.endDate = `${currentYear}-12-31`;
    }

    async initializeResources() {
        try {
            await loadScript(this, jsPDF);
            await this.loadLogoAsBase64();
            this.jsPdfInitialized = true;
            console.log('✅ Resources loaded successfully');
        } catch (error) {
            console.error('❌ Error loading resources:', error);
            this.showToast('Error', 'Failed to initialize PDF library', 'error');
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

    // Handle start date change
    handleStartDateChange(event) {
        this.startDate = event.target.value;
    }

    // Handle end date change
    handleEndDateChange(event) {
        this.endDate = event.target.value;
    }

    async handleDownloadPdf() {
        if (!this.jsPdfInitialized || !window.jspdf) {
            this.showToast('Error', 'PDF library not loaded yet. Please try again.', 'error');
            return;
        }

        // Validate date range
        if (!this.startDate || !this.endDate) {
            this.showToast('Error', 'Please select both start and end dates.', 'error');
            return;
        }

        if (new Date(this.startDate) > new Date(this.endDate)) {
            this.showToast('Error', 'Start date must be before end date.', 'error');
            return;
        }

        this.isLoading = true;

        try {
            // Get contact info and transactions with date filter
            const [contactInfo, transactions] = await Promise.all([
                getContactInfo({ contactId: this.recordId }),
                getTransactionsByDateRange({ 
                    contactId: this.recordId,
                    startDate: this.startDate,
                    endDate: this.endDate
                })
            ]);

            if (!transactions || transactions.length === 0) {
                this.showToast('Warning', 'No transactions found for the selected date range.', 'warning');
                this.isLoading = false;
                return;
            }

            // Generate PDF
            this.generatePDF(contactInfo, transactions);
            this.showToast('Success', 'Tax receipt downloaded successfully!', 'success');
            
            // Close modal after successful download
            setTimeout(() => {
                this.handleClose();
            }, 1000);

        } catch (error) {
            console.error('❌ Error generating PDF:', error);
            this.showToast('Error', 'Failed to generate PDF: ' + error.message, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    generatePDF(contactInfo, transactions) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let yPosition = 15;

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
        doc.text('Buffalo United for Peace Inc', 200, yPosition, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.text('1901 N. Market Street', 200, yPosition + 5, { align: 'right' });
        doc.text('Wilmington, DE 19802', 200, yPosition + 10, { align: 'right' });
        doc.text('EIN: 82-5086497', 200, yPosition + 15, { align: 'right' });
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text('501(c)(3) Tax-Exempt Organization', 200, yPosition + 20, { align: 'right' });
        
        yPosition += 30;

        // === HEADER ===
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('DONATION RECEIPT', 105, yPosition, { align: 'center' });
        yPosition += 5;
        
        // Show date range in PDF
        const currentYear = new Date().getFullYear();
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const formattedStartDate = new Date(this.startDate).toLocaleDateString();
        const formattedEndDate = new Date(this.endDate).toLocaleDateString();
        doc.text(`Period: ${formattedStartDate} - ${formattedEndDate}`, 105, yPosition, { align: 'center' });
        yPosition += 10;

        // === DONOR INFORMATION ===
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Donor Information:', 15, yPosition);
        yPosition += 5;
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${contactInfo.Name}`, 15, yPosition);
        yPosition += 5;
        
        if (contactInfo.MailingStreet) {
            doc.text(`Address: ${contactInfo.MailingStreet}`, 15, yPosition);
            yPosition += 5;
            
            let cityStateZip = '';
            if (contactInfo.MailingCity) cityStateZip += contactInfo.MailingCity;
            if (contactInfo.MailingState) cityStateZip += (cityStateZip ? ', ' : '') + contactInfo.MailingState;
            if (contactInfo.MailingPostalCode) cityStateZip += ' ' + contactInfo.MailingPostalCode;
            if (contactInfo.MailingCountry) cityStateZip += (cityStateZip ? ', ' : '') + contactInfo.MailingCountry;
            
            if (cityStateZip) {
                doc.text(`         ${cityStateZip}`, 15, yPosition);
                yPosition += 5;
            }
        }
        
        const today = new Date().toLocaleDateString();
        doc.text(`Receipt Date: ${today}`, 15, yPosition);
        yPosition += 10;

        // === TABLE HEADER ===
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Ref #', 15, yPosition);
        doc.text('Date', 50, yPosition);
        doc.text('Type', 90, yPosition);
        doc.text('Amount', 165, yPosition);
        yPosition += 2;

        doc.line(15, yPosition, 195, yPosition);
        yPosition += 5;

        // === TRANSACTIONS ===
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        let pageHeight = doc.internal.pageSize.height;

        transactions.forEach((txn) => {
            if (yPosition > pageHeight - 60) {
                doc.addPage();
                yPosition = 20;
            }

            const refNumber = txn.Name || 'N/A';
            const date = txn.Income_Date__c ? new Date(txn.Income_Date__c).toLocaleDateString() : 'N/A';
            const type = txn.Income_Type__c || 'N/A';
            const amount = txn.Amount__c ? `$${txn.Amount__c.toFixed(2)}` : '$0.00';

            doc.text(refNumber.substring(0, 15), 15, yPosition);
            doc.text(date, 50, yPosition);
            doc.text(type.substring(0, 20), 90, yPosition);
            doc.text(amount, 165, yPosition);

            yPosition += 5;
        });

        // === TOTAL ===
        yPosition += 3;
        doc.line(15, yPosition, 195, yPosition);
        yPosition += 6;

        const totalAmount = transactions.reduce((sum, txn) => sum + (txn.Amount__c || 0), 0).toFixed(2);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`TOTAL DONATION AMOUNT:  $${totalAmount}`, 105, yPosition, { align: 'center' });
        yPosition += 12;

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

        yPosition += 5;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text('This receipt was electronically generated and does not require a signature.', 105, yPosition, { align: 'center' });

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('For questions about this receipt, please contact Buffalo United for Peace Inc.', 105, pageHeight - 15, { align: 'center' });
        doc.text('Thank you for your generous support!', 105, pageHeight - 10, { align: 'center' });

        const fileName = `Tax_Receipt_${contactInfo.Name.replace(/\s/g, '_')}_${formattedStartDate.replace(/\//g, '-')}_to_${formattedEndDate.replace(/\//g, '-')}.pdf`;
        doc.save(fileName);
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