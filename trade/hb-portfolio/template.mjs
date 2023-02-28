const template = document.createElement("template");

template.innerHTML = `
    <link rel="stylesheet" href="/trade/hb-portfolio/shadow.css">
    <select onchange="this.getRootNode().host.showPosition('market', this)">
        <optgroup id="market" label="Market Stocks"></optgroup>
    </select>
    <section class="market"></section>
    <select onchange="this.getRootNode().host.showPosition('cash', this)">
        <optgroup id="cash" label="Cash Positions"></optgroup>
    </select>
    <section class="cash"></section>
    <select onchange="this.getRootNode().host.showPosition('margin', this)">
        <optgroup id="margin" label="Margin Positions"></optgroup>
    </select>
    <section class="margin"></section>
`;

export default template;