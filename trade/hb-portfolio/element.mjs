import "./hb-stock/element.mjs";
import template from "./template.mjs";
import { MARKET_STOCKS, CASH_STOCKS, MARGIN_STOCKS } from '/library/stocks.mjs';

class HbPortfolio extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    render(stocks, market) {
        this.#render("market", MARKET_STOCKS, stocks, market);
        this.#render("cash", CASH_STOCKS, stocks, market);
        this.#render("margin", MARGIN_STOCKS, stocks, market);
        this.renderMarket(market);
    }

    #render(type, stocks, positions, market) {
        const optgroup = this.shadowRoot.getElementById(type);
        const section = this.shadowRoot.querySelector("." + type);

        stocks.forEach(stock => {
            const option = document.createElement('option');
            option.textContent = stock;
            optgroup.append(option);

            const component = document.createElement('hb-stock');
            component.id = stock;
            component.render(type, positions[stock], market);
            section.append(component);
        });

        this.shadowRoot.querySelectorAll("section hb-stock:first-child").forEach(stock => stock.style.display = 'block');
    }

    renderMarket(market) {
        this.shadowRoot.querySelectorAll("hb-stock").forEach(component => component.renderMarket(market));
    }
        
    showPosition = (type, select) => {
        this.shadowRoot.querySelectorAll(`.${type} > hb-stock`).forEach(stock => stock.style.display = 'none');
        this.shadowRoot.getElementById(select.value).style.display = 'block';
    }
}

customElements.define("hb-portfolio", HbPortfolio);