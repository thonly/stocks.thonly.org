import template from "./template.mjs";
import { LIVE, KIITOS } from "/library/utils.mjs";

class HbOrders extends HTMLElement {
    #account; 

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        if (LIVE) this.shadowRoot.querySelector('.start').disabled = !KIITOS;
    }

    async render(account, stocks, positions) {
        this.#account = account;
        const ol = this.shadowRoot.getElementById('orders');

        positions.forEach(position => {        
            const li = document.createElement('li');
            const ul = document.createElement('ul');
            ul.style.opacity = position.closingPrice ? "0.5" : "1";
            ol.append(li);
            li.append(ul);

            const currentPrice = position.closingPrice || stocks[position.stock].mark;
            const quantity = -position.shortQuantity || position.longQuantity;
            const dollarProfit = (position.averagePrice - currentPrice) * position.shortQuantity || (currentPrice - position.averagePrice) * position.longQuantity;
            const percentProfit = position.shortQuantity > 0 ? (position.averagePrice / currentPrice * 100 - 100) : (currentPrice / position.averagePrice * 100 - 100);

            ul.append(this.#createLiElement("Stock", position.stock));
            ul.append(this.#createLiElement("$ Profit", dollarProfit.toFixed(2)));
            ul.append(this.#createLiElement("% Profit", percentProfit.toFixed(2)));
            ul.append(this.#createLiElement("Current Price", currentPrice.toFixed(2)));
            ul.append(this.#createLiElement("Average Cost", position.averagePrice.toFixed(2)));
            ul.append(this.#createLiElement("Quantity", quantity));
        });
    }

    #createLiElement(name, value) {
        const li = document.createElement('li');
        const b = document.createElement('b');
        const span = document.createElement('span');

        b.textContent = name + ": ";
        span.textContent = value;
        span.style.color = isNaN(value) ? "purple" : (value < 0 ? "red" : "green");

        li.append(b, span);
        return li;
    }

    kiitos(action, button) {
        this.shadowRoot.querySelectorAll(".kiitos").forEach(button => button.disabled = false);
        button.disabled = true;
        this.#dispatch(action, { account: this.#account });
    }

    async deleteAll(button) {
        button.disabled = true;
        this.#dispatch("delete", { account: this.#account });
    }

    #dispatch(action, data) {
        this.dispatchEvent(new CustomEvent("hb-orders", { bubbles: true, composed: true, detail: { action, data }}));
    }

    // deprecated
    async #render(account) {
        const orders = await getData(account, `https://api.tdameritrade.com/v1/accounts/${localStorage.getItem(account + '-account_id')}/savedorders`);
        const ol = this.shadowRoot.getElementById('orders');

        orders.reverse().forEach(order => {
            const li = document.createElement('li');
            const ul = document.createElement('ul');
            ol.append(li);
            li.append(ul);
            
            for (const prop in order) {
                const li = document.createElement('li');
                const b = document.createElement('b');
                const span = document.createElement('span');
                b.textContent = prop + ": ";

                if (prop === 'savedTime') {
                    span.textContent = new Date(order.savedTime).toLocaleString();
                } else if (prop === 'orderLegCollection') {
                    span.textContent = JSON.stringify(order.orderLegCollection);
                } else {
                    span.textContent = order[prop];
                }

                li.append(b, span);
                ul.append(li);
            }
        });

        return orders;
    }
}

customElements.define("hb-orders", HbOrders);