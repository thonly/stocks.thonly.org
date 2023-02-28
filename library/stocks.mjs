// free = 15 minutes delay (not real-time)
// nasdaq quotes level 1 and 2 = $24/month // level 2 = order books
// nyse quotes = $45/month
// total: $69/month
export const INDEXES = ['$DJI', '$SPX.X', '$COMPX'];
export const MARKET_STOCKS = ['BRK.A', 'BRK.B']; // brk.b = nyse
export const CASH_STOCKS = ['AAPL', 'TSLA']; // aapl = nasdaq
export const MARGIN_STOCKS = ['SQ', 'ABNB']; // abnb = nasdaq; sq = nyse
export const STOCKS = [...CASH_STOCKS, ...MARGIN_STOCKS];
export const WATCHLIST = [...MARKET_STOCKS, ...STOCKS];
export const ALL = [...INDEXES, ...WATCHLIST];
// todo: if want to switch cash/margin stocks, need to manually close first
export const NASDAQ = ['AAPL', 'ABNB'];
export const NYSE = ['BRK.B', 'SQ'];
// later: allow same stocks in both bear and bull? prob not bc too complex...