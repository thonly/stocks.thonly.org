import { WATCHLIST, NASDAQ, NYSE } from "/library/stocks.mjs";

export default class {
    #socket;
    #loginRequest;

    #userPrincipals;
    //#heartbeat;
    //#render;

    constructor(userPrincipals) {
        this.#userPrincipals = userPrincipals;
        //this.#heartbeat = heartbeat;
        //this.#render = render;
    }

    #handleStreams(stream) {
        if (stream.notify) {
            //this.#heartbeat.textContent = new Date(Number(stream.notify[0].heartbeat)).toLocaleString();
            postMessage({ action: "heartbeat", data: new Date(Number(stream.notify[0].heartbeat)).toLocaleString() });
        } else if (stream.response) {
            this.#handleResponse(stream.response[0]);
        } else if (stream.data) {
            //this.#render(stream.data);
            postMessage({ action: "streams", data: stream.data });
        } else {
            console.log(stream);
        }
        //console.log(stream);
    }

    #handleResponse(response) {
        console.info(response);

        if (response.content.code === 3 || response.content.code === 20) {
            this.openStream();
        } else {
            switch (response.service) {
                case "ADMIN":
                    if (response.command === 'LOGIN') postMessage({ action: "color", data: "green" }); //this.#heartbeat.style.color = 'green';
                    if (response.command === 'LOGOUT') this.#socket.close();
                    break;
            }
        }
    }

    closeStream() {
        const logoutRequest = {
            "requests": [ 
                {
                    "service": "ADMIN", 
                    "requestid": 10, 
                    "command": "LOGOUT", 
                    "account": this.#loginRequest.account,
                    "source": this.#loginRequest.source, 
                    "parameters": {}
                }
            ]
        };

        if (this.#socket.readyState === WebSocket.OPEN) this.#socket.send(JSON.stringify(logoutRequest));
    }

    async openStream() {
        this.#loginRequest = await this.#getLoginRequest();
        const stocks = WATCHLIST.join(",").replace(".", "/");

        const dataRequests = {
            "requests": [ this.#loginRequest,
                {
                    "service": "ADMIN",
                    "requestid": 1,
                    "command": "QOS",
                    "account": this.#loginRequest.account,
                    "source": this.#loginRequest.source,
                    "parameters": {
                        "qoslevel": "0"
                    }
                },
                {
                    "service": "NEWS_HEADLINE",
                    "requestid": 2, 
                    "command": "SUBS", 
                    "account": this.#loginRequest.account,
                    "source": this.#loginRequest.source,
                    "parameters": {
                        "keys": stocks, 
                        "fields": [...Array(10).keys()].join(",")
                    }
                },
                {
                    "service": "QUOTE",
                    "requestid": 3,
                    "command": "SUBS",
                    "account": this.#loginRequest.account,
                    "source": this.#loginRequest.source,
                    "parameters": {
                        "keys": stocks,
                        "fields": [...Array(52).keys()].join(",")
                    }
                },
                {
                    "service": "NASDAQ_BOOK",
                    "requestid": 4,
                    "command": "SUBS",
                    "account": this.#loginRequest.account,
                    "source": this.#loginRequest.source,
                    "parameters": {
                        keys: NASDAQ.join(","),
                        fields: [...Array(3).keys()].join(",")
                    }
                },
                {
                    "service": "LISTED_BOOK", // nyse
                    "requestid": 5,
                    "command": "SUBS",
                    "account": this.#loginRequest.account,
                    "source": this.#loginRequest.source,
                    "parameters": {
                        keys: NYSE.join(",").replace(".", "/"),
                        fields: [...Array(3).keys()].join(",")
                    }
                }
            ]
        };

        this.#socket = new WebSocket("wss://" + this.#loginRequest.streamerSocketUrl + "/ws");
        this.#socket.onopen = event => this.#socket.send(JSON.stringify(dataRequests));
        this.#socket.onmessage = event => this.#handleStreams(JSON.parse(event.data));
        this.#socket.onclose = event => postMessage({ action: "color", data: "red" }); //this.#heartbeat.style.color = 'red';
        this.#socket.onerror = event => console.error(event);
    }

    async #getLoginRequest() {
        const credentials = {
            "userid": this.#userPrincipals.accounts[0].accountId,
            "token": this.#userPrincipals.streamerInfo.token,
            "company": this.#userPrincipals.accounts[0].company,
            "segment": this.#userPrincipals.accounts[0].segment,
            "cddomain": this.#userPrincipals.accounts[0].accountCdDomainId,
            "usergroup": this.#userPrincipals.streamerInfo.userGroup,
            "accesslevel": this.#userPrincipals.streamerInfo.accessLevel,
            "authorized": "Y",
            "timestamp": new Date(this.#userPrincipals.streamerInfo.tokenTimestamp).getTime(),
            "appid": this.#userPrincipals.streamerInfo.appId,
            "acl": this.#userPrincipals.streamerInfo.acl
        };

        const loginRequest = {
            "service": "ADMIN",
            "command": "LOGIN",
            "requestid": 0,
            "account": this.#userPrincipals.accounts[0].accountId,
            "source": this.#userPrincipals.streamerInfo.appId,
            "parameters": {
                "credential": this.#jsonToQueryString(credentials),
                "token": this.#userPrincipals.streamerInfo.token,
                "version": "1.0"
            },
            streamerSocketUrl: this.#userPrincipals.streamerInfo.streamerSocketUrl
        };

        return loginRequest;
    }

    #jsonToQueryString(json) {
        return Object.keys(json).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(json[key])).join('&');
    }
}