const template = document.createElement("template");

template.innerHTML = `
    <link rel="stylesheet" href="/login/hb-login/shadow.css">
    <fieldset>
        <legend></legend>
        <br>
        <form>
            <label for="username">Username:</label>
            <input id="username" type="text" autocomplete="off">
            <br><br>
            <label for="password">Password:</label>
            <input id="password" type="password" autocomplete="current-password">
        </form>
    </fieldset>
`;

export default template;