import { LIVE } from "/library/utils.mjs";
import { CASH_STOCKS } from "/library/stocks.mjs";
import { LEVEL, TIME, isTradingHour, hasPositionReachedDesiredProfit, hasPositionReachedStopLoss, isBearMarketBeginning, isBullMarketBeginning } from "/admin/hb-provider/tao.mjs";

/* YIN = CASH: inter day trading algo

TODO
- apple only? crude oil? sp500?
- 300 max; 100 => 200 => 300
- short and long ??

*/

const DAY_RULE = 12*60*60*1000; // day trader rule = at least 12 hours have passed
function isNotRoundTrip(stock) {
    if (stock.lastTrade) {
        return new Date() - new Date(stock.lastTrade.transactionDate) > DAY_RULE;
    } else {
        return true;
    }
}

const CASH_QUANTITY = { MIN: 20*LEVEL, MAX: 60*LEVEL, STEP: null };
// min = 10 starting max quantity
// max = 30 max quantity
// later: limit quantity step?
function getAllowCashQuantity(position, quantity) {
    if (position) {
        const availableQuantity = CASH_QUANTITY.MAX - position.longQuantity;
        return quantity <= availableQuantity ? quantity : availableQuantity;
    } else {
        return quantity <= CASH_QUANTITY.MIN ? quantity : CASH_QUANTITY.MIN;
    }
}

const DEMAND_SUPPLY = 4; // => open long
function hasEnoughDemand(stock, position) {
    const quantity = Math.floor(stock.bidSize / stock.askSize);
    return quantity > DEMAND_SUPPLY ? getAllowCashQuantity(position, quantity) : 0;
}

const MAX_CASH = 0.7; // using only 70% of available cash
function hasEnoughCash(account, stock, quantity) {
    return stock.mark * quantity < account.securitiesAccount.currentBalances.availableFundsNonMarginableTrade * MAX_CASH;
}

const BULL = [0, 1];
function isBullBeginning(stock) {
    return BULL[0] < stock.markPercentChangeInDouble && stock.markPercentChangeInDouble < BULL[1];
}

// BULL: buy and sell only
function bullMarketCashTrade(account, stock, position) {
    const quantity = hasEnoughDemand(stock, position);

    if (position) {
        if (isNotRoundTrip(stock) && (hasPositionReachedDesiredProfit('yin', stock, position) || hasPositionReachedStopLoss('yin', stock, position))) {
            // close long position
            postMessage({ action: "order", data: { account: 'corporate', order: 'Sell', stock, quantity: position.longQuantity }});
        } else if (isBullBeginning(stock) && quantity && hasEnoughCash(account, stock, quantity)) {
            // add to long position
            postMessage({ action: "order", data: { account: 'corporate', order: 'Buy', stock, quantity }});
        }
    } else {
        if (isBullBeginning(stock) && quantity && hasEnoughCash(account, stock, quantity)) {
            // begin long position
            postMessage({ action: "order", data: { account: 'corporate', order: 'Buy', stock, quantity }});
        }
    }
}

// BEAR: market reverses: close long positions
function bearMarketCashTrade(stock, position) {
    if (position && isNotRoundTrip(stock) && (hasPositionReachedDesiredProfit('yin', stock, position, true) || hasPositionReachedStopLoss('yin', stock, position, true))) {
        postMessage({ action: "order", data: { account: 'corporate', order: 'Sell', stock, quantity: position.longQuantity }});
    }
}

////////

let intervalID;

onmessage = event => {
    switch (event.data.action) {
        case "start":
            intervalID = setInterval(god, LIVE ? TIME.yin.INTERVAL*60*1000 : 1*1000, event.data.data);
            break;
        case "stop":
            clearInterval(intervalID);
            break;
    }
};

async function god({ test, account, market, stocks }) {
    console.info(new Date().toLocaleString())
 
    if (!LIVE || isMarketOpen(market)) {
       kiitos(test, account, stocks);
       if (!LIVE || isEvery30Minutes()) postMessage({ action: "mail", data: { tao: "yin", stocks }});
    }
}

function kiitos(test, account, stocks) {
    if (isTradingHour("yin")) {
        if (isBearMarketBeginning(stocks)) {
            CASH_STOCKS.forEach(stock => bearMarketCashTrade(stocks[stock], test ? stock.order : stock.position));
        } else if (isBullMarketBeginning(stocks)) {
            CASH_STOCKS.forEach(stock => bullMarketCashTrade(account, stocks[stock], test ? stock.order : stock.position));
        } 
    }
}

function isEvery30Minutes() {
    const now = new Date();
    return now.getMinutes() === 30;
}