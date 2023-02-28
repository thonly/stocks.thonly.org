import { WATCHLIST } from "./stocks.mjs";
import { formatToDollars, formatToPercents, formatToQuantity } from "./utils.mjs";

export default class Mail {
    #credentials; //= JSON.parse(localStorage.getItem('credentials'));

    constructor(credentials) {
        this.#credentials = credentials;
    }

    async sendMail(tao, subject, html) {
        const to = tao === 'yin' ? "thonly@protonmail.com" : "heartbank@yandex.com";
        const mail = await fetch('https://api.mailgun.net/v3/sandbox0b19bd1dd4f54354927b99b3771b7061.mailgun.org/messages', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + btoa('api:' + this.#credentials.personal.mailgun_key)},
            body: new URLSearchParams({
                from: 'Kiitos TDA <kiitos@nhiakou.org>',
                to,
                subject,
                html
            })
        });
        
        //console.log(subject);
        return mail.json();
    }

    sendAlert(tao, stocks) {
        WATCHLIST.forEach(stock => {
            
            let position, averagePrice, quantity, change;
            
            if (stocks[stock].position) {
                position = "x";
                averagePrice = stocks[stock].position.averagePrice;
                quantity = -stocks[stock].position.shortQuantity || stocks[stock].position.longQuantity;
                change = quantity > 0 ? stocks[stock].mark - averagePrice : averagePrice - stocks[stock].mark;
            } else if (stocks[stock].order) {
                position = "*";
                averagePrice = stocks[stock].order.averagePrice;
                quantity = -stocks[stock].order.shortQuantity || stocks[stock].order.longQuantity;
                change = quantity > 0 ? stocks[stock].mark - averagePrice : averagePrice - stocks[stock].mark;
            } else {
                position = "@";
                averagePrice = stocks[stock].closePrice;
                quantity = 100;
                change = stocks[stock].mark - averagePrice;
            }
    
            const profit = change >= 0; 
            const formattedAveragePrice = formatToDollars(averagePrice);
            const formattedChange = formatToDollars(change);
            const formattedQuantity = formatToQuantity(quantity);
            const formattedDollarProfit = formatToDollars(change * Math.abs(quantity));
            const formattedPercentProfit = formatToPercents(quantity < 0 ? (averagePrice / stocks[stock].mark * 100 - 100) : (stocks[stock].mark / averagePrice * 100 - 100));
    
            const subject = `${stock}: ${formattedChange} ${position} ${formattedQuantity} = ${formattedDollarProfit} | ${formattedPercentProfit}`;
            const message = `<u>${stock}</u>: <span style="color:${profit ? 'green' : 'red'}">${formattedChange}</span> ${position} ${formattedQuantity} = <b style="color:${profit ? 'green' : 'red'}">${formattedDollarProfit}</b> | <span style="color:${profit ? 'green' : 'red'}">${formattedPercentProfit}</span>
            <br><br>
            Current: <span style="color:${profit ? 'green' : 'red'}">${formatToDollars(stocks[stock].mark)}</span>
            <br>
            Average: ${formattedAveragePrice}
            <br>
            Volume: ${formatToQuantity(stocks[stock].totalVolume)}
            <br><br>
            <u>Supply: <b>${(stocks[stock].askSize / stocks[stock].bidSize).toFixed(2)}</b>x</u>
            <br>
            Ask Price: ${formatToDollars(stocks[stock].askPrice)}
            <br>
            Ask Size: <b>${formatToQuantity(stocks[stock].askSize)}</b>
            <br>
            Highest Price: ${formatToDollars(stocks[stock].highPrice)}
            <br><br>
            <u>Demand: <b>${(stocks[stock].bidSize / stocks[stock].askSize).toFixed(2)}</b>x</u>
            <br>
            Bid Price: ${formatToDollars(stocks[stock].bidPrice)}
            <br>
            Bid Size: <b>${formatToQuantity(stocks[stock].bidSize)}</b>
            <br>
            Lowest Price: ${formatToDollars(stocks[stock].lowPrice)}
            <br><br>
            PE Ratio: ${stocks[stock].peRatio}
            <br>
            Volatility: ${stocks[stock].volatility}
            <br>
            1-Year: <b>${formatToDollars(stocks[stock]['52WkLow'])}</b> to <b>${formatToDollars(stocks[stock]['52WkHigh'])}</b>
            `;
    
            this.sendMail(tao, subject, message);
        
        });
    }
    
    mailPositionReport(test, account, order, stock, quantity) {
        if (test) {
            if (stock.order) {
                stock.order.openingPrice = stock.mark;
                switch (order) {
                    case "Buy":
                        stock.order.averagePrice = this.#getAveragePrice(stock.order.averagePrice, stock.order.longQuantity, stock.order.openingPrice, quantity);
                        stock.order.longQuantity += quantity;
                    case "Short":
                        stock.order.averagePrice = this.#getAveragePrice(stock.order.averagePrice, stock.order.shortQuantity, stock.order.openingPrice, quantity);
                        stock.order.shortQuantity += quantity;
                    case "Sell":
                        stock.order.closingPrice = stock.mark;
                    case "Cover":
                        stock.order.closingPrice = stock.mark;
                }
            } else {
                stock.order = { openingPrice: stock.mark, averagePrice: stock.mark, closingPrice: 0 };
                switch (order) {
                    case "Buy":
                        stock.order.longQuantity = quantity;
                        stock.order.shortQuantity = 0;
                    case "Short":
                        stock.order.shortQuantity = quantity;
                        stock.order.longQuantity = 0;
                }
            }
    
            this.#sendPositionReport('TEST', account, order, stock.symbol, quantity, stock.order);
    
        } else {
            if (stock.position) {
                stock.position.openingPrice = stock.mark;
                switch (order) {
                    case "Buy":
                        stock.position.averagePrice = this.#getAveragePrice(stock.position.averagePrice, stock.position.longQuantity, stock.position.openingPrice, quantity);
                        stock.position.longQuantity += quantity;
                    case "Short":
                        stock.position.averagePrice = this.#getAveragePrice(stock.position.averagePrice, stock.position.shortQuantity, stock.position.openingPrice, quantity);
                        stock.position.shortQuantity += quantity;
                    case "Sell":
                        stock.position.closingPrice = stock.mark;
                    case "Cover":
                        stock.position.closingPrice = stock.mark;
                }
            } else {
                stock.position = { openingPrice: stock.mark, averagePrice: stock.mark, closingPrice: 0 };
                switch (order) {
                    case "Buy":
                        stock.position.longQuantity = quantity;
                        stock.position.shortQuantity = 0;
                    case "Short":
                        stock.position.shortQuantity = quantity;
                        stock.position.longQuantity = 0;
                }
            }
    
            this.#sendPositionReport('LIVE', account, order, stock.symbol, quantity, stock.position); 
        }
    }
    
    #getAveragePrice(p1, q1, p2, q2) {
        return Math.round((p1*q1 + p2*q2) / (q1+q2) * 100) / 100;
    }
    
    #sendPositionReport(test, account, order, symbol, quantity, position) {
        const subject = `${test} ${account.toUpperCase()} ${order}: ${symbol} x ${quantity}`;
    
        const currentPrice = position.closingPrice || position.openingPrice;
        const totalQuantity = -position.shortQuantity || position.longQuantity;
        const dollarProfit = (position.averagePrice - currentPrice) * position.shortQuantity || (currentPrice - position.averagePrice) * position.longQuantity;
        const percentProfit = position.shortQuantity > 0 ? (position.averagePrice / currentPrice * 100 - 100) : (currentPrice / position.averagePrice * 100 - 100);
    
        const change = totalQuantity > 0 ? currentPrice - position.averagePrice : position.averagePrice - currentPrice;
        const profit = change >= 0;
    
        const message = `<b><u>Profit</u>:</b> <span style="color:${profit ? 'green' : 'red'}">${formatToDollars(dollarProfit)}</span> | <span style="color:${profit ? 'green' : 'red'}">${formatToPercents(percentProfit)}</span>
        <br><br>
        <b>Current:</b> <span style="color:${profit ? 'green' : 'red'}">${formatToDollars(currentPrice)}</span>
        <br>
        <b>Average:</b> ${formatToDollars(position.averagePrice)}
        <br>
        <b>Quantity:</b> ${formatToQuantity(totalQuantity)}
        `;
        
        this.sendMail(account === 'corporate' ? 'yin' : 'yang', subject, message);
    }
}