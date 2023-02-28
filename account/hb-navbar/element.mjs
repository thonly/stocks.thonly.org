import template from "./template.mjs";

class HbNavbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    dispatch(action, data) {
        this.dispatchEvent(new CustomEvent("hb-navbar", { bubbles: true, composed: true, detail: { action, data }}));
    }
}

customElements.define("hb-navbar", HbNavbar);