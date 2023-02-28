import { LIVE } from "/library/utils.mjs";
import { MARGIN_STOCKS } from "/library/stocks.mjs";
import { LEVEL, TIME, isTradingHour, hasPositionReachedDesiredProfit, hasPositionReachedStopLoss, isBearMarketBeginning, isBullMarketBeginning } from "/admin/hb-provider/tao.mjs";

/* YANG = MARGIN
- yang => yin => live

TODO
- day trading algo
- abnb and sq and apple?
- short and long ??
- 100 max total

*/

const MARGIN_QUANTITY = { MIN: 10*LEVEL, MAX: 40*LEVEL, STEP: null };
// min = 5 starting max quantity
// max = 20 max quantity
// later: limit quantity step?
function getAllowMarginQuantity(position, quantity) {
    if (position) {
        const availableQuantity = MARGIN_QUANTITY.MAX - position.shortQuantity;
        return quantity <= availableQuantity ? quantity : availableQuantity;
    } else {
        return quantity <= MARGIN_QUANTITY.MIN ? quantity : MARGIN_QUANTITY.MIN;
    }
}

const SUPPLY_DEMAND = 4; // => open short
function hasEnoughSupply(stock, position) {
    const quantity = Math.floor(stock.askSize / stock.bidSize);
    return quantity > SUPPLY_DEMAND ? getAllowMarginQuantity(position, quantity) : 0;
}

const MAX_MARGIN = 0.5; // using only 50% of available margin
function hasEnoughMargin(account, stock, quantity) {
    return stock.mark * quantity < account.securitiesAccount.currentBalances.buyingPower * MAX_MARGIN;
}

const BEAR = [-1, 0];
function isBearBeginning(stock) {
    return BEAR[0] < stock.markPercentChangeInDouble && stock.markPercentChangeInDouble < BEAR[1];
}

// BEAR: short and cover only
function bearMarketMarginTrade(account, stock, position) {
    const quantity = hasEnoughSupply(stock, position);

    if (position) {
        if ((hasPositionReachedDesiredProfit('yang', stock, position) || hasPositionReachedStopLoss('yang', stock, position))) {
            // close short position
            postMessage({ action: "order", data: { account: 'personal', order: 'Cover', stock, quantity: position.shortQuantity }});
            
        } else if (isBearBeginning(stock) && quantity && hasEnoughMargin(account, stock, quantity)) {
            // add to short position
            postMessage({ action: "order", data: { account: 'personal', order: 'Short', stock, quantity }});
        }
    } else {
        if (isBearBeginning(stock) && quantity && hasEnoughMargin(account, stock, quantity)) {
            // begin short position
            postMessage({ action: "order", data: { account: 'personal', order: 'Short', stock, quantity }});
        }
    }
}

// BULL: market reverses: close short positions
function bullMarketMarginTrade(stock, position) {
    if (position && (hasPositionReachedDesiredProfit('yang', stock, position, true) || hasPositionReachedStopLoss('yang', stock, position, true))) {
        postMessage({ action: "order", data: { account: 'personal', order: 'Cover', stock, quantity: position.shortQuantity }});
    }
}

//////

let intervalID;

onmessage = event => {
    switch (event.data.action) {
        case "start":
            intervalID = setInterval(god, LIVE ? TIME.yang.INTERVAL*60*1000 : 1*1000, event.data.data);
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
       if (!LIVE || isEvery30Minutes()) postMessage({ action: "mail", data: { tao: "yang", stocks }});
    }
}

function kiitos(test, account, stocks) {
    if (isTradingHour("yang")) {
        if (isBearMarketBeginning(stocks)) {
            MARGIN_STOCKS.forEach(stock => bearMarketMarginTrade(account, stocks[stock], test ? stock.order : stock.position));
        } else if (isBullMarketBeginning(stocks)) {
            MARGIN_STOCKS.forEach(stock => bullMarketMarginTrade(stocks[stock], test ? stock.order : stock.position));
        } 
    }
}

function isEvery30Minutes() {
    const now = new Date();
    return now.getMinutes() === 30;
}