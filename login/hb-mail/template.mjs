const template = document.createElement("template");

template.innerHTML = `
    <link rel="stylesheet" href="/login/hb-mail/shadow.css">
    <fieldset>
        <br>
        <form>
            <label for="mail">MailGun:</label>
            <input id="mail" type="password" autocomplete="off">                     
            <br><br>
            <input id="remember" type="checkbox"> 
            <label for="remember">Remember Me</label>
        </form>
    </fieldset>
`;

export default template;