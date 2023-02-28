const template = document.createElement("template");

template.innerHTML = `
    <link rel="stylesheet" href="/trade/hb-navbar/shadow.css">
    <nav>
        <menu>
            <li><a href="/account">Account</a></li>
            <li><a href="/admin">Admin</a></li>
            <!--<li><a href="#" onclick="this.getRootNode().host.dispatch('logout', null)">Logout</a></li>-->
        </menu>
        <aside>
            <input id="market-bull" name="market" type="radio" value="1"/>
            <label for="market-bull">Bull Market</label>
            <input id="market-bear" name="market" type="radio" value="0"/>
            <label for="market-bear">Bear Market</label>
        </aside>
    </nav>
`;

export default template;