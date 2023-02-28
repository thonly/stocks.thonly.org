const template = document.createElement("template");

template.innerHTML = `
    <link rel="stylesheet" href="/library/hb-horoscope/shadow.css">
    <section>
        <slot></slot>
        <h1 id="synodic-time"></h1>
        <h2 id="sidereal-time"></h2>
        <h3>Sun: <span id="sun-sign"></span></h3>
        <h3>Moon: <span id="moon-sign"></span> <span id="moon"></span></h3>
        <h3>Earth: <span id="earth-as"></span></h3>
        <h3>Earth: <span id="earth-mc"></span></h3>
    </section>
`;

export default template;