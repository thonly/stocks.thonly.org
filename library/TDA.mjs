import Mail from "./Mail.mjs";
import { ALL, STOCKS } from "./stocks.mjs";

export default class TDA {
    mail; //= new Mail();
    #credentials = JSON.parse(sessionStorage.getItem('credentials')) || JSON.parse(localStorage.getItem('credentials')) || { personal: {}, corporate: {} };

    constructor(credentials=null) {
        if (credentials) this.#credentials = credentials;
        this.mail = new Mail(this.#credentials);
    }

    logout() {
        const login = localStorage.getItem('login');
        const remember = localStorage.getItem('remember');
        localStorage.clear();
        if (login) localStorage.setItem('login', login);
        if (remember) localStorage.setItem('remember', remember);
        window.location.href = "/";
    }

    async getUserPrincipals() {
        const user = await this.#getData('personal', 'https://api.tdameritrade.com/v1/userprincipals', { fields: 'streamerSubscriptionKeys,streamerConnectionInfo' });
        return user;
    }

    async getStocks() {
        return await this.#getData('personal', 'https://api.tdameritrade.com/v1/marketdata/quotes', { symbol: STOCKS.join(",") });
    }

    async deleteOrder(account, orderID) {
        const response = await fetch(`https://api.tdameritrade.com/v1/accounts/${this.#credentials[account].account_id}/savedorders/${orderID}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + await this.#getAccessToken(account)
            }
        });
        
        return response.text();
    }

    // sometimes cannot get account because of access denied... why?
    async #getData(account, url='', data={}) {
        return fetch(url + '?' + new URLSearchParams(data), {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + await this.#getAccessToken(account)
            }
        }).then(response => response.json()).catch(error => console.error(error));    
    }

    async #postData(account, url='', data={}) {
        const response = await fetch(url, {
            method: 'POST', 
            headers: {
            'Authorization': 'Bearer ' + await this.#getAccessToken(account), 
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        return response.text();
    }

    // access token expires after 1800 seconds = 30 mins
    async #getAccessToken(account) {
        if (this.#hasExpired(this.#credentials[account].access_last_update, this.#credentials[account].expires_in)) {
            return await this.#resetAccessToken(account);
        } else {
            return this.#credentials[account].access_token;
        }
    }

    async #resetAccessToken(account) {
        const response = await fetch('https://api.tdameritrade.com/v1/oauth2/token', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: this.#credentials[account].refresh_token,
                client_id: this.#credentials[account].client_id
            })
        });

        const token = await response.json();
        this.#credentials[account].access_token = token.access_token;
        this.#credentials[account].access_last_update = new Date().toString();
        localStorage.setItem('credentials', JSON.stringify(this.#credentials));
        return token.access_token;
    }

    /////////////

    hasExpired() {
        return this.#hasExpired(this.#credentials.personal.refresh_last_update, this.#credentials.personal.refresh_token_expires_in) || this.#hasExpired(this.#credentials.corporate.refresh_last_update, this.#credentials.corporate.refresh_token_expires_in);
    }

    // refresh token expires after 7776000 seconds = 90 days or 3 months
    #hasExpired(date, expiration) {
        if (date && expiration) {
            return (new Date() - new Date(date)) / 1000 >= Number(expiration);
        } else 
            return true;
    }

    async getCorporateAccount() {
        const account = await this.#getData('corporate', 'https://api.tdameritrade.com/v1/accounts/' + this.#credentials.corporate.account_id, { fields: '' });
        const history = await this.#getData('corporate', `https://api.tdameritrade.com/v1/accounts/${this.#credentials.corporate.account_id}/transactions`, { type: 'trade', startDate: this.#getDate(false), endDate: this.#getDate(true) });
        return { account, history: history.filter(trade => trade.type === 'TRADE') };
    }
    
    #getDate(now) {
        const dt = now ? new Date() : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
        const date = dt.toLocaleString().split(', ')[0].split('/');
        return `${date[2]}-${String(date[0]).padStart(2, '0')}-${String(date[1]).padStart(2, '0')}`;
    }

    async getAccount(type) {
        const { account, history } = await this.getCorporateAccount();
        const market = await this.#getData('personal', 'https://api.tdameritrade.com/v1/marketdata/EQUITY/hours', { date: new Date().toISOString() });
        const stocks = await this.#getData('personal', 'https://api.tdameritrade.com/v1/marketdata/quotes', { symbol: ALL.join(",") });
        const positions = await this.#getData(type, 'https://api.tdameritrade.com/v1/accounts/' + this.#credentials[type].account_id, { fields: 'positions' });
        const { positions: orders } = await this.orderPositions(type);
        //console.log(positions)
        for (const stock in stocks) {
            stocks[stock].order = orders.find(order => order.stock === stock);
            stocks[stock].position = positions.securitiesAccount.positions ? positions.securitiesAccount.positions.find(position => position.instrument.symbol === stock) : null;
            stocks[stock].lastTrade = history.find(trade => trade.transactionItem.instrument.symbol === stock);
        }
    
        market.isMarketOpen = this.#isMarketOpen(market);
        //console.log(account)
        //console.log(stocks)
        return { account, market, stocks };
    }

    async getAccount2(type) {
        const watchlist = {
            corporate: ['AAPL', 'TSLA', 'META'],
            mom: ['NIO'],
            dad: ['FNGU', 'TSLA']
        };

        //temp
        const type2 = 'corporate';

        const account = await this.#getData(type2, 'https://api.tdameritrade.com/v1/accounts/' + this.#credentials[type2].account_id, { fields: '' });
        const stocks = await this.#getData('personal', 'https://api.tdameritrade.com/v1/marketdata/quotes', { symbol: watchlist[type].join(",") });
        const positions = await this.#getData(type2, 'https://api.tdameritrade.com/v1/accounts/' + this.#credentials[type2].account_id, { fields: 'positions' });
        
        for (const stock in stocks) {
            stocks[stock].position = positions.securitiesAccount.positions ? positions.securitiesAccount.positions.find(position => position.instrument.symbol === stock) : null;
        }
    
        return { account, stocks };
    }

    #isMarketOpen(market) {
        const equityMarket = market.equity.EQ || market.equity.equity;
        if (equityMarket.isOpen && equityMarket.sessionHours) {
            const now = new Date();
            const start = new Date(equityMarket.sessionHours.regularMarket[0].start);
            const end = new Date(equityMarket.sessionHours.regularMarket[0].end);
            return start <= now && now <= end;
        } else {
            return false;
        }
     }

    /////////////

    async orderPositions(account) {
        const orders = await this.#getOrdersWithPrices(account);
        const positions = [];
    
        orders.forEach(order => {
            const position = positions.find(position => position.stock === order.orderLegCollection[0].instrument.symbol);
            if (position && !position.closingPrice) {
                switch (order.orderLegCollection[0].instruction) {
                    case "BUY":
                        position.longQuantity += order.orderLegCollection[0].quantity;
                        position.averagePrice = this.#getAveragePrice(position, order);
                        break;
                    case "SELL":
                        position.closingPrice = order.price;
                        break;
                    case "SELL_SHORT":
                        position.shortQuantity += order.orderLegCollection[0].quantity;
                        position.averagePrice = this.#getAveragePrice(position, order);
                        break;
                    case "BUY_TO_COVER":
                        position.closingPrice = order.price;
                        break;
                }
            } else {
                const position = {};
                position.stock = order.orderLegCollection[0].instrument.symbol;
                position.shortQuantity = order.orderLegCollection[0].instruction === 'SELL_SHORT' ? order.orderLegCollection[0].quantity : 0;
                position.longQuantity = order.orderLegCollection[0].instruction === 'BUY' ? order.orderLegCollection[0].quantity : 0;
                position.averagePrice = order.price;
                position.closingPrice = 0;
                positions.unshift(position);
            }
        });
    
        return { orders, positions };
    }
    
    #getAveragePrice(position, order) {
        const previousQuantity = position.shortQuantity || position.longQuantity;
        return (position.averagePrice*previousQuantity + order.price*order.orderLegCollection[0].quantity) / (previousQuantity + order.orderLegCollection[0].quantity);
    }
    
    async #getOrdersWithPrices(account) {
        const orders = await this.#getData(account, `https://api.tdameritrade.com/v1/accounts/${this.#credentials[account].account_id}/savedorders`);
        const promises = await Promise.allSettled(orders.map(async order => await this.#getOrderWithPrice(order)));
        return promises.map(promise => promise.value);
    }
    
    async #getOrderWithPrice(order) {
        try {
            const orderDate = new Date(order.savedTime);
            const openDate = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate(), 6, 30);
            const minutes = Math.floor((orderDate - openDate) / (1000*60));
            const history = await this.#getData('personal', `https://api.tdameritrade.com/v1/marketdata/${order.orderLegCollection[0].instrument.symbol}/pricehistory`, { startDate: orderDate.getTime(), endDate: orderDate.getTime(), periodType: "day", frequencyType: "minute", frequency: 1, needExtendedHoursData: true });
            order.price = history.candles[minutes].close; //Math.round(history.candles.reduce((sum, candle) => sum + candle.close, 0) / history.candles.length * 100) / 100;
        } catch {
            order.price = 33.33;
        } finally {
            return order;
        }
    }

    ///////////////

    async confirmMarketOrder(test, account, order, stock, quantity) {
        if (confirm(`${test ? 'TEST' : 'LIVE'} ${account.toUpperCase()}: Are you sure you want to ${order} ${quantity} shares of ${stock.symbol}?`)) {
            await this.placeMarketOrder(test, account, order, stock, quantity);
            window.location.reload();
        }
    }

    async placeMarketOrder(test, account, order, stock, quantity) {
        this.mail.mailPositionReport(test, account, order, stock, quantity);
        
        switch (order) {
            case 'Buy':
                return {status: await this.#openLongPosition(test, account, stock.symbol, quantity)};
            case 'Sell':
                return {status: await this.#closeLongPosition(test, account, stock.symbol, quantity)};
            case 'Short':
                return {status: await this.#openShortPosition(test, account, stock.symbol, quantity)};
            case 'Cover':
                return {status: await this.#closeShortPosition(test, account, stock.symbol, quantity)};
        }
    }
    
    // buy long
    async #openLongPosition(test, account, symbol, quantity) {
        const data = await this.#postData(account, `https://api.tdameritrade.com/v1/accounts/${this.#credentials[account].account_id}/${ test ? 'savedorders': 'orders' }`, {
            "orderType": "MARKET",
            "session": "NORMAL",
            "duration": "DAY",
            "orderStrategyType": "SINGLE",
            "orderLegCollection": [
                {
                    "instruction": "BUY",
                    "quantity": quantity,
                    "instrument": {
                            "symbol": symbol,
                            "assetType": "EQUITY"
                        }
                }
            ]
        });
        
        return "Success";
    }
    
    // sell long
    async #closeLongPosition(test, account, symbol, quantity) {
        const data = await this.#postData(account, `https://api.tdameritrade.com/v1/accounts/${this.#credentials[account].account_id}/${ test ? 'savedorders': 'orders' }`, {
            "orderType": "MARKET",
            "session": "NORMAL",
            "duration": "DAY",
            "orderStrategyType": "SINGLE",
            "orderLegCollection": [
                {
                    "instruction": "SELL",
                    "quantity": quantity,
                    "instrument": {
                            "symbol": symbol,
                            "assetType": "EQUITY"
                        }
                }
            ]
        });
        
        return "Success";
    }
    
    // sell short (borrow)
    async #openShortPosition(test, account, symbol, quantity) {
        const data = await this.#postData(account, `https://api.tdameritrade.com/v1/accounts/${this.#credentials[account].account_id}/${ test ? 'savedorders': 'orders' }`, {
            "orderType": "MARKET",
            "session": "NORMAL",
            "duration": "DAY",
            "orderStrategyType": "SINGLE",
            "orderLegCollection": [
                {
                    "instruction": "SELL_SHORT",
                    "quantity": quantity,
                    "instrument": {
                            "symbol": symbol,
                            "assetType": "EQUITY"
                        }
                }
            ]
        });
        
        return "Success";
    }
    
    // buy to cover (return)
    async #closeShortPosition(test, account, symbol, quantity) {
        const data = await this.#postData(account, `https://api.tdameritrade.com/v1/accounts/${this.#credentials[account].account_id}/${ test ? 'savedorders': 'orders' }`, {
            "orderType": "MARKET",
            "session": "NORMAL",
            "duration": "DAY",
            "orderStrategyType": "SINGLE",
            "orderLegCollection": [
                {
                    "instruction": "BUY_TO_COVER",
                    "quantity": quantity,
                    "instrument": {
                            "symbol": symbol,
                            "assetType": "EQUITY"
                        }
                }
            ]
        });
        
        return "Success";
    }
}