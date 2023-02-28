import TDA from "/library/TDA.mjs";

class HbProvider extends HTMLBodyElement {
    #tda = new TDA();
    #personalWorker;
    #corporateWorker;
    #personalOrders;
    #corporateOrders;

    #navbarComponent;
    #personalFormComponent;
    #corporateFormComponent;
    #personalOrdersComponent;
    #corporateOrdersComponent;
    #streamsComponent;

    constructor() {
        super();
        this.#navbarComponent = this.querySelector('hb-navbar');
        this.#personalFormComponent = this.querySelector('.personal > hb-form');
        this.#corporateFormComponent = this.querySelector('.corporate > hb-form');
        this.#personalOrdersComponent = this.querySelector('.personal > hb-orders');
        this.#corporateOrdersComponent = this.querySelector('.corporate > hb-orders');
        this.#streamsComponent = this.querySelector('hb-streams');
    }

    connectedCallback() {
        this.#createWebWorkers();
        this.#connect();
        this.#createStore();
    }

    #createWebWorkers() {
        this.#personalWorker = new Worker("./hb-provider/BEAR/yang.js", { type: "module" });
        this.#corporateWorker = new Worker("./hb-provider/BEAR/yin.js", { type: "module" });
        this.#personalWorker.onmessage = event => this.#workerReducer(event.data);
        this.#corporateWorker.onmessage = event => this.#workerReducer(event.data);
    }

    #connect() {
        this.addEventListener('hb-navbar', event => this.#reducers(event));
        this.addEventListener('hb-form', event => this.#reducers(event));
        this.addEventListener('hb-orders', event => this.#reducers(event));
        this.addEventListener('hb-streams', event => this.#reducers(event));
    }

    async #createStore() {
        if (this.#tda.hasExpired()) {
            window.location.href = '/';
        } else {
            localStorage.setItem('test', localStorage.getItem('test') || 1);
            const stocks = await this.#tda.getStocks();
            const { orders: personalOrders, positions: personalPositions } = await this.#tda.orderPositions("personal");
            const { orders: corporateOrders, positions: corporatePositions } = await this.#tda.orderPositions("corporate");
            this.#personalOrders = personalOrders;
            this.#corporateOrders = corporateOrders;

            this.#navbarComponent.render(localStorage.getItem('test'));
            this.#personalOrdersComponent.render("personal", stocks, personalPositions);
            this.#corporateOrdersComponent.render("corporate", stocks, corporatePositions);
            this.#personalFormComponent.render("personal", stocks, personalPositions);
            this.#corporateFormComponent.render("corporate", stocks, corporatePositions);
        }
    }

    async #reducers({ type, detail: { action, data }}) {
        switch(type) {
            case "hb-navbar":
                switch (action) {
                    case "logout":
                        this.#tda.logout();
                        break;
                    case "test":
                        localStorage.setItem('test', data);
                        break;
                }
                break;
            case "hb-form":
                switch (action) {
                    case "order":
                        const { account, order, stock, quantity } = data;
                        await this.#tda.confirmMarketOrder(Number(localStorage.getItem('test')), account, order, stock, quantity);
                        break;
                }
                break;
            case "hb-orders":
                switch (action) {
                    case "delete":
                        const orders = data.account === 'personal' ? this.#personalOrders : this.#corporateOrders;
                        await Promise.allSettled(orders.map(order => this.#tda.deleteOrder(data.account, order.savedOrderId)));
                        window.location.reload();
                        break;
                    default:
                        const test = Number(localStorage.getItem('test'));
                        const { account, market, stocks } = await this.#tda.getAccount(data.account);
                        if (data.account === 'personal') this.#personalWorker.postMessage({ action, data: { test, account, market, stocks }});
                        if (data.account === 'corporate') this.#corporateWorker.postMessage({ action, data: { test, account, market, stocks }});
                        break;
                }
                break;
            case "hb-streams":
                break;
        }
    }

    #workerReducer({ action, data }) {
        switch (action) {
            case "order":
                this.#tda.placeMarketOrder(Number(localStorage.getItem('test')), data.account, data.order, data.stock, data.quantity);
                break;
            case "mail":
                this.#tda.mail.sendAlert(data.tao, data.stocks);
                break;
        }
    }
}

customElements.define("hb-provider", HbProvider, { extends: "body" });