// import { LightningElement, api, wire } from 'lwc';
// import { loadScript } from 'lightning/platformResourceLoader';
// import jsPDF from '@salesforce/resourceUrl/jspdf';
// import logoUrl from '@salesforce/resourceUrl/bupLogo';
// import getAllTransactionsByContact from '@salesforce/apex/BUP_ContributionStatementController.getAllTransactionsByContact';
// import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BupContributionStatement extends LightningElement {
    // @api recordId;
    // transactions;
    // error;
    // jsPdfInitialized = false;
    // isLoading = false;
    // logoDataUrl;

    // // Load jsPDF and logo once the component renders
    // renderedCallback() {
    //     if (this.jsPdfInitialized) {
    //         return;
    //     }
    //     this.jsPdfInitialized = true;

    //     // Load jsPDF
    //     loadScript(this, jsPDF)
    //         .then(() => {
    //             console.log('✅ jsPDF loaded successfully!');
    //             // Load logo as Base64
    //             return this.loadLogoAsBase64();
    //         })
    //         .then(() => {
    //             console.log('✅ Logo loaded successfully!');
    //         })
    //         .catch(error => {
    //             console.error('❌ Error during initialization:', error);
    //             this.showToast('Error', 'Failed to initialize PDF components', 'error');
    //         });
    // }

    // // Convert logo to Base64 for PDF embedding
    // loadLogoAsBase64() {
    //     return fetch(logoUrl)
    //         .then(response => response.blob())
    //         .then(blob => {
    //             return new Promise((resolve, reject) => {
    //                 const reader = new FileReader();
    //                 reader.onloadend = () => {
    //                     this.logoDataUrl = reader.result;
    //                     resolve();
    //                 };
    //                 reader.onerror = reject;
    //                 reader.readAsDataURL(blob);
    //             });
    //         });
    // }

    // // Wire to get transactions
    // @wire(getAllTransactionsByContact, { contactId: '$recordId' })
    // wiredTransactions({ data, error }) {
    //     if (data) {
    //         this.transactions = data;
    //         this.error = undefined;
    //         console.log('✅ Transactions loaded:', data.length);
    //     } else if (error) {
    //         this.error = error.body ? error.body.message : error.message;
    //         this.transactions = undefined;
    //         console.error('❌ Error loading transactions:', this.error);
    //     }
    // }

    // get hasTransactions() {
    //     return this.transactions && this.transactions.length > 0;
    // }

    // get totalAmount() {
    //     if (!this.transactions) return '0.00';
    //     const total = this.transactions.reduce((sum, txn) => sum + (txn.Amount__c || 0), 0);
    //     return total.toFixed(2);
    // }

    // // Format transactions for display in table
    // get formattedTransactions() {
    //     if (!this.transactions) return [];
        
    //     return this.transactions.map(txn => {
    //         return {
    //             ...txn,
    //             formattedDate: txn.Income_Date__c ? new Date(txn.Income_Date__c).toLocaleDateString() : 'N/A',
    //             formattedAmount: txn.Amount__c ? txn.Amount__c.toFixed(2) : '0.00',
    //             category: txn.Income_Budget__r?.Category__c || 'N/A'
    //         };
    //     });
    // }

    // handleDownloadPdf() {
    //     // Check if jsPDF is loaded
    //     if (!this.jsPdfInitialized || !window.jspdf) {
    //         this.showToast('Error', 'PDF library not loaded yet. Please wait and try again.', 'error');
    //         return;
    //     }

    //     // Check if we have data
    //     if (!this.hasTransactions) {
    //         this.showToast('Warning', 'No transactions found for this contact.', 'warning');
    //         return;
    //     }

    //     this.isLoading = true;

    //     try {
    //         this.generatePDF();
    //         this.showToast('Success', 'PDF generated successfully!', 'success');
    //     } catch (error) {
    //         console.error('❌ Error generating PDF:', error);
    //         this.showToast('Error', 'Failed to generate PDF: ' + error.message, 'error');
    //     } finally {
    //         this.isLoading = false;
    //     }
    // }

    // generatePDF() {
    //     const { jsPDF } = window.jspdf;
    //     const doc = new jsPDF();

    //     // Set initial position
    //     let yPosition = 20;

    //     // === LOGO AND ADDRESS SIDE BY SIDE - ALIGNED ===
    //     if (this.logoDataUrl) {
    //         try {
    //             // ⭐ Logo on the left - size 50x28
    //             doc.addImage(this.logoDataUrl, 'PNG', 20, yPosition, 50, 28);
    //         } catch (error) {
    //             console.error('Error adding logo to PDF:', error);
    //         }
    //     }

    //     // ⭐ Address on the right - moved down
    //     doc.setFontSize(10);
    //     doc.setFont('helvetica', 'normal');
    //     doc.text('1901 N. Market Street', 120, yPosition + 12);
    //     //                                            ↑ increased from 5 to 10
    //     doc.text('Wilmington, DE 19802', 120, yPosition + 17);
    //     //                                            ↑ increased from 11 to 16

    //     yPosition += 35; // Move down after header

    //     // === HEADER ===
    //     doc.setFontSize(16);
    //     doc.setFont('helvetica', 'bold');
    //     doc.text('DONATION RECEIPT', 105, yPosition, { align: 'center' });
    //     yPosition += 15;

    //     // === TABLE HEADER ===
    //     doc.setFontSize(10);
    //     doc.setFont('helvetica', 'bold');
    //     doc.text('Date', 20, yPosition);
    //     doc.text('Category', 80, yPosition);
    //     doc.text('Amount', 160, yPosition);
    //     yPosition += 2;

    //     // Draw line under header
    //     doc.line(20, yPosition, 190, yPosition);
    //     yPosition += 5;

    //     // === TRANSACTIONS ===
    //     doc.setFont('helvetica', 'normal');
    //     doc.setFontSize(9);
    //     let pageHeight = doc.internal.pageSize.height;

    //     this.transactions.forEach((txn) => {
    //         // Check if we need a new page
    //         if (yPosition > pageHeight - 40) {
    //             doc.addPage();
    //             yPosition = 20;
    //         }

    //         const date = txn.Income_Date__c ? new Date(txn.Income_Date__c).toLocaleDateString() : 'N/A';
    //         const category = txn.Income_Budget__r?.Category__c || 'N/A';
    //         const amount = txn.Amount__c ? `$${txn.Amount__c.toFixed(2)}` : '$0.00';

    //         doc.text(date, 20, yPosition);
    //         doc.text(category, 80, yPosition);
    //         doc.text(amount, 160, yPosition);

    //         yPosition += 6;
    //     });

    //     // === TOTAL DONATION AMOUNT ===
    //     yPosition += 5;
    //     doc.line(20, yPosition, 190, yPosition);
    //     yPosition += 7;

    //     doc.setFont('helvetica', 'bold');
    //     doc.setFontSize(12);
    //     doc.text(`TOTAL DONATION AMOUNT:  $${this.totalAmount}`, 105, yPosition, { align: 'center' });

    //     // Save the PDF
    //     const fileName = `Donation_Receipt_${new Date().getTime()}.pdf`;
    //     doc.save(fileName);
    // }

    // showToast(title, message, variant) {
    //     const event = new ShowToastEvent({
    //         title: title,
    //         message: message,
    //         variant: variant
    //     });
    //     this.dispatchEvent(event);
    // }
}