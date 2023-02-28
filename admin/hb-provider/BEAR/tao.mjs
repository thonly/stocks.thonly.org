export const LEVEL = 0.5; 
/* MECHANICAL RULES
1. brk DOWN => Bear // Supply/demand
2. brk UP => Bull // Demand/supply
3. BEAR => short // Supply/demand
4. BULL => long // Demand/supply

// BOTTOM 25%
- $100 per day
- $500 per week
- $2K per month
- $26K per year (260*100)
// TOP 10%
- $20K cash => $1k/day => $200K/year

LEVELS
- level: 1 - 10
- quantity: 10 - 100
- profit/day: $100 - $1000
*/

const DESIRED_PROFIT = {};
DESIRED_PROFIT.yin = { MIN: 20*LEVEL, MAX: 100*LEVEL };
DESIRED_PROFIT.yang = { MIN: 20*LEVEL, MAX: 100*LEVEL };
// min => $10 close position when market reverses
// max => $50 close position
export function hasPositionReachedDesiredProfit(tao, stock, position, reverse=false) {
    const desiredProfit = reverse ? DESIRED_PROFIT[tao].MIN : DESIRED_PROFIT[tao].MAX;
    if (position.shortQuantity) {
        return (position.averagePrice - stock.mark) * position.shortQuantity >= desiredProfit;
    } else {
        return (stock.mark - position.averagePrice) * position.longQuantity >= desiredProfit;
    }
}

const STOP_LOSS = {};
STOP_LOSS.yin = { MIN: 100*LEVEL, MAX: 200*LEVEL };
STOP_LOSS.yang = { MIN: 100*LEVEL, MAX: 200*LEVEL };
// min $50 => close position when market reverses
// max $100 => close position
export function hasPositionReachedStopLoss(tao, stock, position, reverse=false) {
    const stopLoss = reverse ? STOP_LOSS[tao].MIN : STOP_LOSS[tao].MAX;
    if (position.shortQuantity) {
        return (stock.mark - position.averagePrice) * position.shortQuantity > stopLoss;
    } else {
        return (position.averagePrice - stock.mark) * position.longQuantity > stopLoss;
    }
}

/////

export const TIME = {};
TIME.yin = { START: 7, END: 13, INTERVAL: 1 };
TIME.yang = { START: 7, END: 13, INTERVAL: 1 };
// interval: 15 minutes => 2hrs x 4 = 8 checks per day // max > 30 secs
// most active trading time => more accurate supply/demand
// same day trading => 7-9 & 11-13 => most active
// inter day trading => 9 - 11 => least active
export function isTradingHour(tao) {
    const now = new Date();
    return TIME[tao].START <= now.getHours() && now.getHours() <= TIME[tao].END;
}

export const QUANTITY = { MIN: null, MAX: 40*LEVEL, STEP: 10*LEVEL };
// max: 20, step: 5
// total = 3x // < 100
// open slowly // close ALL right away

// tao = KIITOS

const BEAR_CONDITIONS = { SP: [-1, 0], NQ: [-1, 0], BRK: [-1, 0], BRK2: 2 }; 
export function isBearMarketBeginning(stocks) {
    const SP = BEAR_CONDITIONS.SP[0] < stocks['$SPX.X'].netPercentChangeInDouble && stocks['$SPX.X'].netPercentChangeInDouble < BEAR_CONDITIONS.SP[1]; // percent change from yesterday
    const NQ = BEAR_CONDITIONS.NQ[0] < stocks['$COMPX'].netPercentChangeInDouble && stocks['$COMPX'].netPercentChangeInDouble < BEAR_CONDITIONS.NQ[1]; // percent change from yesterday
    const BRK = BEAR_CONDITIONS.BRK[0] < stocks['BRK.B'].markPercentChangeInDouble && stocks['BRK.B'].markPercentChangeInDouble < BEAR_CONDITIONS.BRK[1]; // percent change from yesterday
    //const BRK = stocks['BRK.B'].askSize / stocks['BRK.B'].bidSize > BEAR_CONDITIONS.BRK; // supply / demand
    return SP && NQ && BRK;
}

const BULL_CONDITIONS = { SP: [0, 1], NQ: [0, 1], BRK: [0, 1], BRK2: 2 }; 
export function isBullMarketBeginning(stocks) {
    const SP = BULL_CONDITIONS.SP[0] < stocks['$SPX.X'].netPercentChangeInDouble && stocks['$SPX.X'].netPercentChangeInDouble < BULL_CONDITIONS.SP[1]; // percent change from yesterday
    const NQ = BULL_CONDITIONS.NQ[0] < stocks['$COMPX'].netPercentChangeInDouble && stocks['$COMPX'].netPercentChangeInDouble < BULL_CONDITIONS.NQ[1]; // percent change from yesterday
    const BRK = BULL_CONDITIONS.BRK[0] < stocks['BRK.B'].markPercentChangeInDouble && stocks['BRK.B'].markPercentChangeInDouble < BULL_CONDITIONS.BRK[1]; // percent change from yesterday
    //const BRK = stocks['BRK.B'].bidSize / stocks['BRK.B'].askSize > BULL_CONDITIONS.BRK; // demand / supply
    return SP && NQ && BRK;
}