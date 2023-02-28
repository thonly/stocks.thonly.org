const template = document.createElement("template");

template.innerHTML = `
    <link rel="stylesheet" href="/trade/hb-portfolio/hb-stock/shadow.css">
    <fieldset>
        <legend id="position"></legend>
        <article>
            <h2>$ Profit: <span id="dollar-profit">$0</span></h2>
            <h2>% Profit: <span id="percent-profit">0%</span></h2>
        </article>
        <article>
            <h3>Current Price: <span id="price">$0</span></h3>
            <h3>Average Cost: <span id="cost">$0</span></h3>
            <h3>Quantity: <span id="quantity">0</span></h3>
        </article>
        <section class="market bull">
            <button id="buy" class="positive">Buy Now</button>
            <button id="sell" class="negative">Sell Now</button>
        </section>
        <section class="market bear">
            <button id="borrow" class="positive">Borrow Now</button>
            <button id="return" class="negative">Return Now</button>
        </section>
        <article class="price">
            <h3>$ Price Change: <span id="dollar-price-change"></span></h3>
            <h3>% Price Change: <span id="percent-price-change"></span></h3>
            <h3>Open Price: <span id="open-price"></span></h3>
            <h3>Close Price: <span id="close-price"></span></h3>
            <!--<h3>Net Change: <span id="net-change"></span></h3>-->
            <h3>Total Volume: <span id="total-volume"></span></h3>
        </article>
        <article class="bid">
            <h3>Bid Price: <span id="bid-price"></span></h3>
            <h3>Bid Size: <span id="bid-size"></span></h3>
            <h3>Ask Price: <span id="ask-price"></span></h3>
            <h3>Ask Size: <span id="ask-size"></span></h3>
            <h3>High Price: <span id="high-price"></span></h3>
            <h3>Low Price: <span id="low-price"></span></h3>
        </article>
        <article class="stats">
            <h3>P/E Ratio: <span id="pe-ratio"></span></h3>
            <h3>Volatility: <span id="volatility"></span></h3>
            <h3>52-Week High: <span id="52wk-high"></span></h3>
            <h3>52-Week Low: <span id="52wk-low"></span></h3>
        </article>
    </fieldset>
`;

export default template;