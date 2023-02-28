import template from "./template.mjs";
import { formatToDollar, formatToDollars } from "/library/utils.mjs";
const { Origin, Horoscope } = Astro;

class HbHistory extends HTMLElement {
    #MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
        
    render(history, location) {
        //console.log(history)
        const summary = this.#createSummaryDataStructure(history);
        const calendar = this.shadowRoot.querySelector('section');
        
        summary.forEach((years, year) => {
            let yearTotal = 0;
        
            years.forEach((months, month) => {
                const fieldset = document.createElement('fieldset');
                const legend = document.createElement('legend');
                const span = document.createElement('span');
                legend.textContent = `${this.#MONTHS[month]} ${year}: `;
                legend.append(span);
                fieldset.append(legend);
            
                let monthTotal = 0;
            
                months.forEach((days, day) => {
                    const table = document.createElement('table');
                    const caption = document.createElement('caption');
                    caption.textContent = day;
            
                    const thead = document.createElement('thead');
                    const trhead = document.createElement('tr');
                    const th1 = document.createElement('th');
                    th1.textContent = "Date";
                    const th2 = document.createElement('th');
                    th2.textContent = "Order";
                    const th3 = document.createElement('th');
                    th3.textContent = "Stock";
                    const th4 = document.createElement('th');
                    th4.textContent = "Quantity";
                    const th5 = document.createElement('th');
                    th5.textContent = "Price";
                    const th6 = document.createElement('th');
                    th6.textContent = "Net";
                    const th7 = document.createElement('th');
                    th7.textContent = "Sun";
                    const th8 = document.createElement('th');
                    th8.textContent = "Moon";
                    const th9 = document.createElement('th');
                    th9.textContent = "Earth";
            
                    const tbody = document.createElement('tbody');
                    const tfoot = document.createElement('tfoot');
            
                    fieldset.prepend(table);
                    table.append(caption, thead, tbody, tfoot);
                    thead.append(trhead);
                    trhead.append(th1, th2, th3, th4, th5, th6, th7, th8, th9);
            
                    days.forEach(transaction => {
                        const date = new Date(transaction.transactionDate);
                        const { planets, cusps, Sun, Moon, Earth } = this.#getHoroscope(date, location);
                        const tr = document.createElement('tr');
                        tr.onclick = event => this.#dispatch('trade', { date, planets, cusps, Sun, Moon, Earth });
                
                        const td1 = document.createElement('td');
                        td1.textContent = date.toLocaleTimeString();
                        const td2 = document.createElement('td');
                        td2.textContent = transaction.description; //transactionItem.instruction;
                        const td3 = document.createElement('td');
                        td3.textContent = transaction.transactionItem.instrument.symbol;
                        const td4 = document.createElement('td');
                        td4.textContent = transaction.transactionItem.amount;
                        const td5 = document.createElement('td');
                        td5.textContent = formatToDollars(transaction.transactionItem.price);
                        const td6 = document.createElement('td');
                        formatToDollar(td6, transaction.netAmount);
                        const td7 = document.createElement('td');
                        td7.textContent = Sun.Sign.label + " " + Sun.House.label;
                        const td8 = document.createElement('td');
                        td8.textContent = Moon.Sign.label + " " + Moon.House.label;
                        const td9 = document.createElement('td');
                        td9.textContent = Earth.As.Sign.label + " Ascendant";
                
                        tbody.prepend(tr);
                        tr.append(td1, td2, td3, td4, td5, td6, td7, td8, td9);
                    });
            
                    let tripTotal = 0;
                    let volumeTotal = 0;
                    let dayTotal = 0;
            
                    days.forEach(transaction => {
                        tripTotal += 1;
                        volumeTotal += transaction.transactionItem.amount;
                        dayTotal += transaction.netAmount;
                    });
            
                    const trthfoot = document.createElement('tr');
                    const fth1 = document.createElement('td');
                    fth1.textContent = "";
                    const fth2 = document.createElement('th');
                    fth2.textContent = "Trips";
                    const fth3 = document.createElement('td');
                    fth3.textContent = "";
                    const fth4 = document.createElement('th');
                    fth4.textContent = "Volume";
                    const fth5 = document.createElement('td');
                    fth5.textContent = "";
                    const fth6 = document.createElement('th');
                    fth6.textContent = "Profit";
            
                    const trtdfoot = document.createElement('tr');
                    const td1 = document.createElement('td');
                    td1.textContent = "";
                    const td2 = document.createElement('td');
                    td2.textContent = tripTotal;
                    const td3 = document.createElement('td');
                    td3.textContent = "";
                    const td4 = document.createElement('td');
                    td4.textContent = volumeTotal;
                    const td5 = document.createElement('td');
                    td5.textContent = "";
                    const td6 = document.createElement('td');
                    formatToDollar(td6, dayTotal);
            
                    tfoot.append(trthfoot, trtdfoot);
                    trthfoot.append(fth1, fth2, fth3, fth4, fth5, fth6);
                    trtdfoot.append(td1, td2, td3, td4, td5, td6);
            
                    monthTotal += dayTotal;
                });
            
                calendar.prepend(fieldset);
                formatToDollar(span, monthTotal);
                yearTotal += monthTotal;
            });
        
            // console.log(yearTotal);
        });
    }

    #createSummaryDataStructure(history) {
        const summary = [];
      
        history.forEach(transaction => {
            const date = new Date(transaction.transactionDate);
            if (summary[date.getFullYear()] === undefined) summary[date.getFullYear()] = [];
            if (summary[date.getFullYear()][date.getMonth()] === undefined) summary[date.getFullYear()][date.getMonth()] = [];
            if (summary[date.getFullYear()][date.getMonth()][date.getDate()] == undefined) summary[date.getFullYear()][date.getMonth()][date.getDate()] = [];
            summary[date.getFullYear()][date.getMonth()][date.getDate()].push(transaction);
        });
      
        return summary;
    }

    #dispatch(action, data) {
        this.dispatchEvent(new CustomEvent("hb-history", { bubbles: true, composed: true, detail: { action, data }}));
    }

    #getHoroscope(date, location) {  
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

customElements.define("hb-history", HbHistory);