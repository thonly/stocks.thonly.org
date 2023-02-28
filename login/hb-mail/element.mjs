import template from "./template.mjs";

class HbMail extends HTMLElement {
    #mail;
    #remember;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.#mail = this.shadowRoot.getElementById('mail');
        this.#remember = this.shadowRoot.getElementById('remember');
    }

    connectedCallback() {
        this.#mail.oninput = event => this.#dispatch("mail", event.target.value);
        this.#remember.onchange = event => this.#dispatch("remember", event.target.checked ? 1 : 0);
    }

    render(login, remember) {
        this.#mail.value = login.personal.mail || "";
        this.#remember.checked = Boolean(Number(remember));
    }

    #dispatch(action, data) {
        this.dispatchEvent(new CustomEvent("hb-mail", { bubbles: true, composed: true, detail: { action, data }}));
    }
}

customElements.define("hb-mail", HbMail);