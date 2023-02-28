const template = document.createElement("template");

template.innerHTML = `
    <link rel="stylesheet" href="/admin/hb-streams/shadow.css">
    <h1 id="heartbeat"></h1>
    <section>
        <nav>
            <h2>Streams</h2>
            <aside>
                <button id="open" onclick="this.getRootNode().host.openStream(this)">Open Stream</button>
                <button id="close" onclick="this.getRootNode().host.closeStream(this)" disabled>Close Stream</button>
            </aside>
        </nav>
        <ol id="streams" reversed></ol>
    </section>
`;

export default template;