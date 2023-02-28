const template = document.createElement("template");

template.innerHTML = `
    <link rel="stylesheet" href="/account/hb-account/shadow.css">
    <fieldset>
        <legend>HeartBank®: Silicon Wat LLC</legend>
        <p>Day Trader: <span id="trader"></span> (<span id="trips"></span> Round Trips)</p>
        <article>
            <h2 class="power">Buying Power</h2>
            <h3>Cash: <span id="available-cash"></span></h3>
            <h3>Margin: <span id="available-margin"></span></h3>
        </article>
        <article>
            <h2 class="margin">Margin</h2>
            <h3>Balance: <span id="margin-balance"></span></h3>
            <h3>Daily Interest: <span id="daily-interest"></span></h3>
        </article>
        <article>
            <h2 class="requirement">Requirement</h2>
            <h3>Equity: <span id="margin-equity"></span></h3>
            <h3>Collateral: <span id="margin-requirement"></span></h3>
        </article>
    </fieldset>
`;

export default template;