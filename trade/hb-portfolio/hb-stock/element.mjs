import template from "./template.mjs";
import { formatToDollar, formatToPercent, formatToDollars, formatToPercents, formatToQuantity } from "/library/utils.mjs";

class HbStock extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    render(type, stock, market) {
        this.#renderPosition(type, stock);
        this.#renderStock(stock);
        this.#renderButton(stock);
        this.renderMarket(market);
    }
        
    #renderPosition(type, stock) {
        const legend = this.shadowRoot.getElementById('position');
        legend.textContent = `${type.toUpperCase()} ${ type === 'market' ? "Stock" : "Position" }: ${stock.symbol}`;

        if (stock.position) {
            this.shadowRoot.getElementById('cost').textContent = formatToDollars(stock.position.averagePrice);
            this.shadowRoot.getElementById('quantity').textContent = formatToQuantity(-stock.position.shortQuantity || stock.position.longQuantity); // stock.position.settledShortQuantity || stock.position.settledLongQuantity
            // this.shadowRoot.getElementById('dollar-profit').textContent = stock.position.currentDayProfitLoss;
            // this.shadowRoot.getElementById('percent-profit').textContent = stock.position.currentDayProfitLossPercentage;
    
            const currentPrice = parseFloat(this.shadowRoot.getElementById('price').textContent.replace('$', ''));
            formatToDollar(this.shadowRoot.getElementById('dollar-profit'), (stock.position.averagePrice - currentPrice) * stock.position.shortQuantity || (currentPrice - stock.position.averagePrice) * stock.position.longQuantity);
            formatToPercent(this.shadowRoot.getElementById('percent-profit'), stock.position.shortQuantity > 0 ? (stock.position.averagePrice / currentPrice * 100 - 100) : (currentPrice / stock.position.averagePrice * 100 - 100));
        } else {
            // TODO: show stock data?
        }
    }

    #renderStock(stock) {
        this.shadowRoot.getElementById('bid-price').textContent = formatToDollars(stock.bidPrice);
        this.shadowRoot.getElementById('bid-size').textContent = formatToQuantity(stock.bidSize);
        this.shadowRoot.getElementById('ask-price').textContent = formatToDollars(stock.askPrice);
        this.shadowRoot.getElementById('ask-size').textContent = formatToQuantity(stock.askSize);
        this.shadowRoot.getElementById('high-price').textContent = formatToDollars(stock.highPrice);
        this.shadowRoot.getElementById('low-price').textContent = formatToDollars(stock.lowPrice);

        this.shadowRoot.getElementById('price').textContent = formatToDollars(stock.mark);
        //this.shadowRoot.getElementById('dollar-price-change').textContent = formatToDollars(stock.markChangeInDouble);
        //this.shadowRoot.getElementById('percent-price-change').textContent = formatToPercents(stock.markPercentChangeInDouble);
        formatToDollar(this.shadowRoot.getElementById('dollar-price-change'), stock.mark - stock.closePrice);
        formatToPercent(this.shadowRoot.getElementById('percent-price-change'), stock.mark / stock.closePrice * 100 - 100);
        this.shadowRoot.getElementById('open-price').textContent = formatToDollars(stock.openPrice);
        this.shadowRoot.getElementById('close-price').textContent = formatToDollars(stock.closePrice);
        //this.shadowRoot.getElementById('net-change').textContent = formatToDollars(stock.netChange);
        this.shadowRoot.getElementById('total-volume').textContent = formatToQuantity(stock.totalVolume);

        this.shadowRoot.getElementById('pe-ratio').textContent = stock.peRatio;
        this.shadowRoot.getElementById('volatility').textContent = stock.volatility;
        this.shadowRoot.getElementById('52wk-high').textContent = formatToDollars(stock['52WkHigh']);
        this.shadowRoot.getElementById('52wk-low').textContent = formatToDollars(stock['52WkLow']);
    }

    renderMarket(market) {
        this.shadowRoot.querySelectorAll('button').forEach(button => button.style.display = 'none');
        this.shadowRoot.querySelectorAll(Number(market) ? '.bull > button' : '.bear > button').forEach(button => button.style.display = 'block');
    }

    #renderButton(stock) {
        this.#placeOrder('Buy', stock, this.shadowRoot.getElementById('buy'));
        this.#placeOrder('Sell', stock, this.shadowRoot.getElementById('sell'));
        this.#placeOrder('Short', stock, this.shadowRoot.getElementById('borrow'));
        this.#placeOrder('Cover', stock, this.shadowRoot.getElementById('return'));
    }

    #placeOrder(order, stock, button) {
        const recommendedShortQuantity = Math.floor(stock.askSize / stock.bidSize);
        const recommendedLongQuantity = Math.floor(stock.bidSize / stock.askSize);
    
        if (stock.position) {
            if (stock.position.shortQuantity) {
                if (order === 'Cover') {
                    button.onclick = () => this.#dispatch({ order, stock, quantity: stock.position.shortQuantity });
                } else if (order === 'Short' && recommendedShortQuantity) {
                    button.onclick = () => this.#dispatch({ order, stock, quantity: recommendedShortQuantity });
                } else {
                    button.disabled = true;
                }
            } else {
                if (order === 'Sell') {
                    button.onclick = () => this.#dispatch({ order, stock, quantity: stock.position.longQuantity });
                } else if (order === 'Buy' && recommendedLongQuantity) {
                    button.onclick = () => this.#dispatch({ order, stock, quantity: recommendedLongQuantity });
                } else {
                    button.disabled = true;
                }
            }
        } else {
            if (order === 'Short' && recommendedShortQuantity) {
                button.onclick = () => this.#dispatch({ order, stock, quantity: recommendedShortQuantity });
            } else if (order === 'Buy' && recommendedLongQuantity) {
                button.onclick = () => this.#dispatch({ order, stock, quantity: recommendedLongQuantity });
            } else {
                button.disabled = true;
            }
        }
    } 

    #dispatch(data) {
        this.dispatchEvent(new CustomEvent("hb-portfolio", { bubbles: true, composed: true, detail: { action: 'order', data }}));
    }
}

customElements.define("hb-stock", HbStock);