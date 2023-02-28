const template = document.createElement("template");

template.innerHTML = `
    <link rel="stylesheet" href="/account/hb-navbar/shadow.css">
    <nav>
        <menu>
            <li><a href="/trade">Trade</a></li>
            <li><a href="/admin">Admin</a></li>
        </menu>
        <aside>
            <a href="#" onclick="this.getRootNode().host.dispatch('logout', null)">Logout</a>
        </aside>        
    </nav>
`;

export default template;