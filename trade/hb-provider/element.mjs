import TDA from "/library/TDA.mjs";

class HbProvider extends HTMLBodyElement {
    #tda = new TDA();
    #store = { 
        current: { date: new Date(), location: [36.7484123, -119.7938046] }
    };

    #navbarComponent;
    #horoscopeComponent;
    #marketComponent;
    #portfolioComponent;

    constructor() {
        super();
        this.#navbarComponent = this.querySelector('hb-navbar');
        this.#horoscopeComponent = this.querySelector('hb-horoscope');
        this.#marketComponent = this.querySelector('hb-market');
        this.#portfolioComponent = this.querySelector('hb-portfolio');
    }

    connectedCallback() {
        this.#connect();
        this.#createStore();
    }

    #connect() {
        this.addEventListener('hb-navbar', event => this.#reducers(event));
        this.addEventListener('hb-horoscope', event => this.#reducers(event));
        this.addEventListener('hb-market', event => this.#reducers(event));
        this.addEventListener('hb-portfolio', event => this.#reducers(event));
    }

    async #createStore() {
        if (this.#tda.hasExpired()) {
            window.location.href = '/';
        } else {
            const market = localStorage.getItem('market') || 1;
            localStorage.setItem('market', market);
            // TODO: get brk.a from stocks variable
            const data = await this.#tda.getAccount("corporate");
            this.#store.current.date = new Date(data.stocks['BRK.A'].quoteTimeInLong)
                        
            this.#navbarComponent.render(market);
            this.#horoscopeComponent.render(this.#store);
            this.#marketComponent.render(data);
            this.#portfolioComponent.render(data.stocks, market);
        }
    }

    async #reducers({ type, detail: { action, data }}) {
        switch(type) {
            case "hb-navbar":
                switch (action) {
                    case "logout":
                        this.#tda.logout();
                        break;
                    case "market":
                        localStorage.setItem('market', data);
                        this.#portfolioComponent.renderMarket(data);
                        break;
                }
                break;
            case "hb-horoscope":
                break;
            case "hb-market":
                break;
            case "hb-portfolio":
                switch (action) {
                    case "order":
                        const { order, stock, quantity } = data;
                        await this.#tda.confirmMarketOrder(Number(localStorage.getItem('test')), "corporate", order, stock, quantity);
                        break;
                }
                break;
        }
    }
}

customElements.define("hb-provider", HbProvider, { extends: "body" });