import template from "./template.mjs";
//import Streams from "/library/Streams.mjs";
import TDA from "/library/TDA.mjs";

class HbStreams extends HTMLElement {
    //#streams; 
    #tda = new TDA();
    #worker;
    #heartbeat;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    async connectedCallback() {
        //this.#streams = new Streams(this.shadowRoot.getElementById('heartbeat'), this.#render.bind(this));
        this.#heartbeat = this.shadowRoot.getElementById('heartbeat');
        this.#worker = new Worker("./hb-streams/worker.js", { type: "module" });
        this.#worker.onmessage = event => this.#reducer(event.data);
        this.#worker.postMessage({ action: await this.#tda.getUserPrincipals() });
    }

    #reducer({ action, data }) {
        switch (action) {
            case "heartbeat":
                this.#heartbeat.textContent = data;
                break;
            case "color":
                this.#heartbeat.style.color = data;
                break;
            case "streams":
                this.#render(data);
                break;
        }
    }

    #render(stocks) {
        stocks.forEach(stock => {
            const li = document.createElement('li');
            const ul = document.createElement('ul');
            this.shadowRoot.getElementById('streams').prepend(li);
            li.append(ul);
            
            for (const prop in stock) {
                const li = document.createElement('li');
                const b = document.createElement('b');
                const span = document.createElement('span');
                b.textContent = prop + ": ";
    
                if (prop === 'timestamp') {
                    span.textContent = new Date(stock.timestamp).toLocaleString();
                } else if (prop === 'content') {
                    //console.log(stock.content);
                    span.textContent = JSON.stringify(stock.content);
                } else {
                    span.textContent = stock[prop];
                }
    
                li.append(b, span);
                ul.append(li);
            }
        });
    }

    openStream(button) {
        this.shadowRoot.getElementById('close').disabled = false;
        button.disabled = true;
        //this.#streams.openStream();
        this.#worker.postMessage({ action: "open" });
    }

    closeStream(button) {
        this.shadowRoot.getElementById('open').disabled = false;
        button.disabled = true;
        //this.#streams.closeStream();
        this.#worker.postMessage({ action: "close" });
    }
}

customElements.define("hb-streams", HbStreams);