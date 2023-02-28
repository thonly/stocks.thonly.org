import template from "./template.mjs";

class HbNavbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.shadowRoot.getElementById('market-bull').onchange = event => this.dispatch("market", this.shadowRoot.querySelector('input[name="market"]:checked').value);
        this.shadowRoot.getElementById('market-bear').onchange = event => this.dispatch("market", this.shadowRoot.querySelector('input[name="market"]:checked').value);
    }

    render(market) {
        this.shadowRoot.getElementById(Number(market) ? 'market-bull' : 'market-bear').checked = true;
    }

    dispatch(action, data) {
        this.dispatchEvent(new CustomEvent("hb-navbar", { bubbles: true, composed: true, detail: { action, data }}));
    }
}

customElements.define("hb-navbar", HbNavbar);