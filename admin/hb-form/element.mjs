import template from "./template.mjs";
import { QUANTITY } from '../hb-provider/BEAR/tao.mjs';

class HbForm extends HTMLElement {
    #account;
    #stocks;
    #positions;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    render(account, stocks, positions) {
        this.#account = account;
        this.#stocks = stocks;
        this.#positions = positions;

        this.shadowRoot.querySelector("h2").textContent = this.#account.toUpperCase();
        const range = this.shadowRoot.getElementById('range-quantity');
        const number = this.shadowRoot.getElementById('number-quantity');

        range.step = QUANTITY.STEP;
        range.min = QUANTITY.STEP;
        range.max = QUANTITY.MAX;
        number.step = QUANTITY.STEP;
        number.min = QUANTITY.STEP;
        number.max = QUANTITY.MAX;
    }

    updateQuantity(input) {
        if (input === range) {
            number.value = input.value;
        } else {
            range.value = input.value;
        }
    }

    async placeOrder(event) {
        event.preventDefault();
        const input = Object.fromEntries(new FormData(event.target));
        this.#stocks[input.symbol].order = this.#positions.find(position => position.stock === input.symbol)
        this.#dispatch("order", { account: this.#account, order: input.order, stock: this.#stocks[input.symbol], quantity: input.quantity });
    }
    
    #dispatch(action, data) {
        this.dispatchEvent(new CustomEvent("hb-form", { bubbles: true, composed: true, detail: { action, data }}));
    }
}

customElements.define("hb-form", HbForm);