import TDA from "/library/TDA.mjs";

const ORIGIN = "https://railway.thonly.org/", LOCAL = "http://localhost:333/";
const STOCKS = window.location.hostname === '127.0.0.1' ? LOCAL : ORIGIN;

class HbProvider extends HTMLBodyElement {
    #tda = new TDA();
    #login = { personal: {}, corporate: {}, mom: {}, dad: {} };
    #personalLoginComponent;
    #corporateLoginComponent;
    #momLoginComponent;
    #dadLoginComponent;
    #mailComponent;
    #submitComponent;

    constructor() {
        super();
        this.#personalLoginComponent = this.querySelector('hb-login[data-account=Personal]');
        this.#corporateLoginComponent = this.querySelector('hb-login[data-account=Corporate]');
        this.#momLoginComponent = this.querySelector('hb-login[data-account=Mom]');
        this.#dadLoginComponent = this.querySelector('hb-login[data-account=Dad]');
        this.#mailComponent = this.querySelector('hb-mail');
        this.#submitComponent = this.querySelector('hb-submit');
    }

    connectedCallback() {
        this.#connect();
        this.#createStore();
    }

    #connect() {
        this.addEventListener('hb-personal', event => this.#reducers(event));
        this.addEventListener('hb-corporate', event => this.#reducers(event));
        this.addEventListener('hb-mom', event => this.#reducers(event));
        this.addEventListener('hb-dad', event => this.#reducers(event));
        this.addEventListener('hb-mail', event => this.#reducers(event));
        this.addEventListener('hb-submit', event => this.#reducers(event));
    }

    #createStore() {
        if (this.#tda.hasExpired()) {
            this.#login = JSON.parse(localStorage.getItem('login')) || this.#login;
            this.#personalLoginComponent.render(this.#login);
            this.#corporateLoginComponent.render(this.#login);
            this.#dadLoginComponent.render(this.#login);
            this.#momLoginComponent.render(this.#login);
            this.#mailComponent.render(this.#login, localStorage.getItem('remember'));
        } else {
            window.location.href = '/account';
        }
    }

    async #reducers({ type, detail: { action, data }}) {
        switch(type) {
            case "hb-personal":
                this.#login.personal[action] = data;
                break;
            case "hb-corporate":
                this.#login.corporate[action] = data;
                break;
            case "hb-mom":
                this.#login.mom[action] = data;
                break;
            case "hb-dad":
                this.#login.dad[action] = data;
                break;
            case "hb-mail":
                switch (action) {
                    case "mail": // repeat 2x
                        this.#login.personal[action] = data;
                        this.#login.corporate[action] = data;
                        break;
                    case "remember":
                        localStorage.setItem(action, data);
                        break;
                }
                break;
            case "hb-submit":
                switch (action) {
                    case "renew":
                        if (Number(localStorage.getItem('remember'))) localStorage.setItem("login", JSON.stringify(this.#login))
                        else localStorage.removeItem('login');
                        const personal = await this.#getTokens('personal');
                        await new Promise(resolve => setTimeout(resolve, 10*1000));
                        const corporate = await this.#getTokens('corporate');
                        //await new Promise(resolve => setTimeout(resolve, 10*1000));
                        //const dad = corporate; await this.#getTokens('dad');
                        const mom = corporate;
                        const dad = corporate;
                        // FIXME: don't know why second promise always fails... maybe api limits concurrent calls... or express can't handle concurrent?
                        //const [ personal, corporate, dad ] = await Promise.allSettled([this.#getTokens('personal'), this.#getTokens('corporate')]);
                        //localStorage.setItem('credentials', JSON.stringify({ personal: personal.value, corporate: corporate.value }));
                        localStorage.setItem('credentials', JSON.stringify({ personal, corporate, mom, dad }));
                        window.location.href = '/account';
                        break;
                    case "copy":
                        const response = await this.#copyTokens(data);
                        console.log(response)
                        if (response.personal) {
                            localStorage.setItem('credentials', JSON.stringify(response));
                            if (data === 'save') await this.#saveTokens(response);
                            window.location.href = '/account';
                        } else this.#submitComponent.copyTokens();
                        break;
                }
                break;
        }
    }
    
    async #getTokens(account) {
        const response = await fetch(ORIGIN + 'login', {
            method: 'POST',
            mode: 'cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                account,
                username: this.#login[account].username, 
                password: this.#login[account].password,
                mail: this.#login[account].mail
            })
        });
    
        return response.json();
    }

    async #copyTokens(pin) {
        const response = await fetch(STOCKS, {
            method: 'POST',
            mode: 'cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ pin })
        });
    
        return response.json();
    }

    async #saveTokens(credentials) {
        const response = await fetch(LOCAL + 'auth', {
            method: 'POST',
            mode: 'cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ credentials })
        });
    
        return response.json();
    }
}

customElements.define("hb-provider", HbProvider, { extends: "body" });