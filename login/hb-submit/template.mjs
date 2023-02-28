const template = document.createElement("template");

template.innerHTML = `
    <link rel="stylesheet" href="/login/hb-submit/shadow.css">
    <button id="renew" onclick="this.getRootNode().host.login(this)">Renew Refresh Token</button>
    <button id="copy" onclick="this.getRootNode().host.copyTokens(this)">Copy All Tokens</button>
`;

export default template;