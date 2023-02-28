import TDA from "/library/TDA.mjs";

class HbProvider extends HTMLBodyElement {
    #tda = new TDA();
    #store = { 
        birth: { date: new Date(1985, 0, 7, 15, 0), location: [10.6058073, 104.1767753] }, 
        current: { date: new Date(), location: [36.7484123, -119.7938046] }
    };

    #navbarComponent;
    #horoscopeComponent;
    #accountComponent;
    #historyComponent;

    constructor() {
        super();
        this.#navbarComponent = this.querySelector('hb-navbar');
        this.#horoscopeComponent = this.querySelector('hb-horoscope');
        this.#accountComponent = this.querySelector('hb-account');
        this.#historyComponent = this.querySelector('hb-history');
    }

    connectedCallback() {
        this.#connect();
        this.#createStore();
    }

    #connect() {
        this.addEventListener('hb-navbar', event => this.#reducers(event));
        this.addEventListener('hb-horoscope', event => this.#reducers(event));
        this.addEventListener('hb-account', event => this.#reducers(event));
        this.addEventListener('hb-history', event => this.#reducers(event));
    }

    async #createStore() {
        if (this.#tda.hasExpired()) {
            window.location.href = '/';
        } else {
            const { account, history } = await this.#tda.getCorporateAccount();
            this.#horoscopeComponent.render(this.#store);
            this.#accountComponent.render(account);
            this.#historyComponent.render(history, this.#store.current.location);
        }
    }

    #reducers({ type, detail: { action, data }}) {
        switch(type) {
            case "hb-navbar":
                switch (action) {
                    case "logout":
                        this.#tda.logout();
                        break;
                }
                break;
            case "hb-horoscope":
                break;
            case "hb-account":
                break;
            case "hb-history":
                switch (action) {
                    case "trade":
                        //window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                        this.scrollIntoView({ behavior: "smooth", block: "start", inline: "center" });
                        this.#horoscopeComponent.animateTransit(this.#store.current.location, data);
                        break;
                }
                break;
        }
    }
}

customElements.define("hb-provider", HbProvider, { extends: "body" });