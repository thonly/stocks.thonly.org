import template from "./template.mjs";
import { LIVE } from "/library/utils.mjs";

class HbSubmit extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.shadowRoot.getElementById('renew').disabled = LIVE;
    }

    login(button) {
        button.disabled = true;
        button.textContent = "Please approve on your mobile device";
        this.#dispatch("renew");
    }

    copyTokens(button=null) {
        let pin;
        if (button) {
            button.disabled = true;
            pin = window.prompt("Please enter your PIN:");
        } else {
            button = this.shadowRoot.getElementById('copy');
            button.disabled = true;
            pin = window.prompt("Incorrect PIN. Please try again:");
        }
        if (pin) this.#dispatch("copy", pin)
        else button.disabled = false;
    }
    
    #dispatch(action, data=null) {
        this.dispatchEvent(new CustomEvent("hb-submit", { bubbles: true, composed: true, detail: { action, data }}));
    }
}

customElements.define("hb-submit", HbSubmit);