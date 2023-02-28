import "./Astro.min.js";
import "./LST.min.js";
import Moon from "./Moon.mjs";
import template from "./template.mjs";
const { Origin, Horoscope } = Astro;

class HbHoroscope extends HTMLElement {
    #horoscope;
    #id = "horoscope";

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        //console.log(LST.getLST(new Date(), -119.7938046)) // FIXME: don't know why doesn't work for current time
    }

    render({ birth, current }) {
        const { transit } = this.createChart({ birth, current });
        this.#render(current, transit);
    }

    #render({ date, location }, { Sun, Moon, Earth }) {
        this.shadowRoot.getElementById('synodic-time').textContent = date.toLocaleTimeString();
        this.shadowRoot.getElementById('sidereal-time').textContent = LST.getLST(date, location[1]); 
        this.shadowRoot.getElementById('sun-sign').textContent = Sun.Sign.label + " in " + Sun.House.label;
        this.shadowRoot.getElementById('moon-sign').textContent = Moon.Sign.label + " in " + Moon.House.label;
        this.shadowRoot.getElementById('earth-as').textContent = Earth.As.Sign.label + " Ascendant";
        this.shadowRoot.getElementById('earth-mc').textContent = Earth.Mc.Sign.label + " Midheaven";
        this.#renderMoon(date);
    }

    #renderMoon(date) {
        const moon = new Moon(date);
        const span = this.shadowRoot.getElementById('moon')
        span.textContent = moon.lunarPhaseEmoji;
        span.title = Math.round(moon.lunarAgePercent * 100) + "%";
    }

    createChart({ birth, current }) {
        const element = this.querySelector('#' + this.#id);
        element.replaceChildren();

        const width = element.offsetWidth < 500 ? element.offsetWidth : 500;
        const chart = new astrology.Chart(this.#id, width, width);

        const { planets, cusps, As, Ds, Mc, Ic, Sun, Moon, Earth } = this.#getHoroscope(birth || current);
        const radix = chart.radix({ planets, cusps });
        radix.addPointsOfInterest({ As, Mc, Ds, Ic });

        if (birth) {
            const transit = this.#getHoroscope(current);
            this.#horoscope = radix.transit({ planets: transit.planets, cusps: transit.cusps }).aspects();
            return { natal: { Sun, Moon, Earth }, transit: { Sun: transit.Sun, Moon: transit.Moon, Earth: transit.Earth } };
        } else return { transit: { Sun, Moon, Earth }};
    }

    animateTransit(location, { date, planets, cusps, Sun, Moon, Earth }) {
        this.#horoscope.animate({ planets, cusps }, 3, false, () => this.#render({ date, location }, { Sun, Moon, Earth }));
    }

    #getHoroscope({ date, location }) {  
        const origin = new Origin({
            year: date.getFullYear(),
            month: date.getMonth(),
            date: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            latitude: location[0],
            longitude: location[1]
        });
    
        const horoscope = new Horoscope({
            origin,
            houseSystem: "whole-sign",
            zodiac: "tropical",
            aspectPoints: ['bodies', 'points', 'angles'],
            aspectWithPoints: ['bodies', 'points', 'angles'],
            aspectTypes: ["major", "minor"],
            customOrbs: {},
            language: 'en'
        });

        return this.#getData(horoscope);
    }

    #getData(horoscope) {
        const data = {};

        data.planets = Object.assign(
            {},
            ...horoscope._celestialBodies.all.map((body) => {
                const key = body.key.charAt(0).toUpperCase() + body.key.slice(1);
                return { [key]: [body.ChartPosition.Ecliptic.DecimalDegrees] };
            })
        );

        data.cusps = horoscope._houses.map((cusp) => {
            return cusp.ChartPosition.StartPosition.Ecliptic.DecimalDegrees;
        });

        data.As = [horoscope._ascendant.ChartPosition.Horizon.DecimalDegrees];
        data.Ds = [(data.As + 180) % 360];
        data.Mc = [horoscope._midheaven.ChartPosition.Horizon.DecimalDegrees];
        data.Ic = [(horoscope._midheaven.ChartPosition.Horizon.DecimalDegrees + 180) % 360];

        data.Sun = horoscope.CelestialBodies.sun;
        data.Moon = horoscope.CelestialBodies.moon;
        data.Earth = { As: horoscope.Ascendant, Mc: horoscope.Angles.midheaven };

        return data;
    }
}

customElements.define("hb-horoscope", HbHoroscope);