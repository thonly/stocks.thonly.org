const template = document.createElement("template");

template.innerHTML = `
    <link rel="stylesheet" href="/admin/hb-navbar/shadow.css">
    <nav>
        <menu>
            <li><a href="/account">Account</a></li>
            <li><a href="/trade">Trade</a></li>
            <!--<li><a href="#" onclick="this.getRootNode().host.dispatch('logout', null)">Logout</a></li>-->
        </menu>
        <aside>
            <input id="test-true" name="test" type="radio" value="1"/>
            <label for="test-true">Test On</label>
            <input id="test-false" name="test" type="radio" value="0"/>
            <label for="test-false">Test Off</label>
        </aside>        
    </nav>
`;

export default template;