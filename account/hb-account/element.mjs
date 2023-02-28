import template from "./template.mjs";
import { formatToDollar } from "/library/utils.mjs";

class HbAccount extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    render(account) {
        //console.log(account)
        this.shadowRoot.getElementById('trader').textContent = account.securitiesAccount.isDayTrader ? "Yes": "No";
        this.shadowRoot.getElementById('trips').textContent = account.securitiesAccount.roundTrips;
        formatToDollar(this.shadowRoot.getElementById('available-cash'), account.securitiesAccount.currentBalances.availableFundsNonMarginableTrade);
        formatToDollar(this.shadowRoot.getElementById('available-margin'), account.securitiesAccount.currentBalances.buyingPower);
        formatToDollar(this.shadowRoot.getElementById('margin-balance'), account.securitiesAccount.currentBalances.marginBalance);
        formatToDollar(this.shadowRoot.getElementById('daily-interest'), account.securitiesAccount.currentBalances.marginBalance * this.#interestRate(-account.securitiesAccount.currentBalances.marginBalance) / 360);
        formatToDollar(this.shadowRoot.getElementById('margin-equity'), account.securitiesAccount.currentBalances.equity);
        formatToDollar(this.shadowRoot.getElementById('margin-requirement'), -account.securitiesAccount.currentBalances.maintenanceRequirement);
    }
    
    #interestRate(loan) {
        if (loan >= 1000000) {
            return 0.07;
        } else if (loan >= 250000) {
            return 0.075;
        } else if (loan >= 100000) {
            return 0.0775;
        } else if (loan >= 50000) {
            return 0.08;
        } else if (loan >= 25000) {
            return 0.09;
        } else if (loan >= 10000) {
            return 0.0925;
        } else if (loan >= 0) {
            return 0.095;
        }
    }
    
    #interestRate2(loan) {
        if (0 <= loan && loan < 10000) {
            return 0.095;
        } else if (10000 <= loan && loan < 25000) {
            return 0.0925;
        } else if (25000 <= loan && loan < 50000) {
            return 0.09;
        } else if (50000 <= loan && loan < 100000) {
            return 0.08;
        } else if (100000 <= loan && loan < 250000) {
            return 0.0775;
        } else if (250000 <= loan && loan < 1000000) {
            return 0.075;
        } else {
            return 0.075;
        }
    }
}

customElements.define("hb-account", HbAccount);