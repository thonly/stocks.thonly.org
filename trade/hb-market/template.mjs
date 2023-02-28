const template = document.createElement("template");

template.innerHTML = `
    <link rel="stylesheet" href="/trade/hb-market/shadow.css">
    <h4>Market: <span id="market"></span></h4>
    <h4><span id="open">6:30 AM</span> to <span id="close">1:00 PM</span></h4>
    <select onchange="this.getRootNode().host.showMarket(this)">
        <optgroup label="Market Data">
            <option value="twitter" disabled>Trending</option>
            <option value="news" disabled>News</option>
            <option value="econ" disabled>Econ</option>
            <option value="coinbase" disabled>Crypto</option>
            <option value="tda" selected>Stocks</option>
        </optgroup>
    </select>
    <fieldset>
        <legend>Market: Stocks</legend>
        <article>
            <h2>NASDAQ: <span id="$COMPX" style="display:none"></span> <span id="$COMPX-dollar"></span> | <span id="$COMPX-percent"></span></h2>
            <h2>S&P 500: <span id="$SPX.X" style="display:none"></span> <span id="$SPX.X-dollar"></span> | <span id="$SPX.X-percent"></span></h2>
            <h2>DJIA: <span id="$DJI" style="display:none"></span> <span id="$DJI-dollar"></span> | <span id="$DJI-percent"></span></h2>
        </article>
    </fieldset>
`;

export default template;