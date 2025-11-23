import { LightningElement, wire } from 'lwc';
import getNetBalance from '@salesforce/apex/BUP_BalanceController.getNetBalance';
import { refreshApex } from '@salesforce/apex';

export default class BupNetBalance extends LightningElement {
    netBalance;
    error;
    wiredResult;

    @wire(getNetBalance)
    wiredBalance(result) {
        this.wiredResult = result;
        const { data, error } = result;
        if (data !== undefined) {
            this.netBalance = data;
            this.error = undefined;
        } else if (error) {
            this.error = 'Error fetching balance';
            console.error(error);
        }
    }

    get balanceClass() {
        if (this.netBalance > 0) return 'balance-positive';
        if (this.netBalance < 0) return 'balance-negative';
        return 'balance-zero';
    }

    async handleRefresh() {
        this.error = undefined;
        try {
            await refreshApex(this.wiredResult);
        } catch (err) {
            this.error = 'Failed to refresh balance';
            console.error(err);
        }
    }
}