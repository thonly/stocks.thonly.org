import template from "./template.mjs";

class HbLogin extends HTMLElement {
    #username;
    #password;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.#username = this.shadowRoot.getElementById('username');
        this.#password = this.shadowRoot.getElementById('password');
    }

    connectedCallback() {
        const legend = this.shadowRoot.querySelector('legend');
        legend.textContent = this.dataset.account;

        this.#username.oninput = event => this.#dispatch('username', event.target.value);
        this.#password.oninput = event => this.#dispatch('password', event.target.value);
    }

    render(login) {
        const credentials = login[this.dataset.account.toLowerCase()];
        this.#username.value = credentials.username || "";
        this.#password.value = credentials.password || "";
    }

    #dispatch(action, data) {
        this.dispatchEvent(new CustomEvent("hb-" + this.dataset.account.toLowerCase(), { bubbles: true, composed: true, detail: { action, data }}));
    }
}

customElements.define("hb-login", HbLogin);