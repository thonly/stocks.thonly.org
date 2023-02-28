import template from "./template.mjs";

class HbNavbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.shadowRoot.getElementById('test-true').onchange = event => this.dispatch("test", this.shadowRoot.querySelector('input[name="test"]:checked').value);
        this.shadowRoot.getElementById('test-false').onchange = event => this.dispatch("test", this.shadowRoot.querySelector('input[name="test"]:checked').value);
    }

    render(test) {
        this.shadowRoot.getElementById(Number(test) ? 'test-true' : 'test-false').checked = true;
    }

    dispatch(action, data) {
        this.dispatchEvent(new CustomEvent("hb-navbar", { bubbles: true, composed: true, detail: { action, data }}));
    }
}

customElements.define("hb-navbar", HbNavbar);