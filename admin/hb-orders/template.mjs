const template = document.createElement("template");

template.innerHTML = `
    <link rel="stylesheet" href="/admin/hb-orders/shadow.css">
    <section>
        <nav>
            <h2>Positions</h2>
            <aside>
                <button class="kiitos start" onclick="this.getRootNode().host.kiitos('start', this)">Start</button>
                <button class="kiitos stop" onclick="this.getRootNode().host.kiitos('stop', this)" disabled>Stop</button>
                <button onclick="this.getRootNode().host.deleteAll(this)">Delete All</button>
            </aside>
        </nav>
        <ol id="orders" reversed></ol>
    </section>
`;

export default template;