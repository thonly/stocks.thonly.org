import template from "./template.mjs";
import { INDEXES } from "/library/stocks.mjs";
import { formatToDollar, formatToPercent, formatToDollars } from "/library/utils.mjs";

class HbMarket extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    render({ market, stocks }) {
        this.#renderMarket(market);
        this.#renderMarkets(stocks);
    }

    #renderMarket(market) {
        //console.log(market.equity.EQ)
        const condition = this.shadowRoot.getElementById('market');
        const open = this.shadowRoot.getElementById('open');
        const close = this.shadowRoot.getElementById('close');
        if (market.isMarketOpen) {
            condition.textContent = 'Open';
            open.textContent = new Date(market.equity.EQ.sessionHours.regularMarket[0].start).toLocaleTimeString();
            close.textContent = new Date(market.equity.EQ.sessionHours.regularMarket[0].end).toLocaleTimeString();
            condition.style.color = 'green';
            open.style.color = 'green';
            close.style.color = 'green';
        } else {
            condition.textContent = 'Close';
            condition.style.color = 'red';
            open.style.color = 'grey';
            close.style.color = 'grey';
        }    
    }
    
    #renderMarkets(stocks) {
        INDEXES.forEach(index => {
            if (stocks[index]) {
                this.shadowRoot.getElementById(index).textContent = formatToDollars(stocks[index].lastPrice);
                formatToDollar(this.shadowRoot.getElementById(index + '-dollar'), stocks[index].netChange);
                formatToPercent(this.shadowRoot.getElementById(index + '-percent'), stocks[index].netPercentChangeInDouble);
            }
        });
    }

    showMarket(select) {}
}

customElements.define("hb-market", HbMarket);