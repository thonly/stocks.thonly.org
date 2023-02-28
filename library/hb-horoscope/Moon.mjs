export default class {
    #LUNAR_MONTH = 29.530588853;
    date;

    constructor(date = new Date()) {
        this.date = date;
    }

    get julianDate() {
        const time = this.date.getTime();
        const tzoffset = this.date.getTimezoneOffset()
        return (time / 86400000) - (tzoffset / 1440) + 2440587.5;
    }

    get lunarAge() {
        return this.lunarAgePercent * this.#LUNAR_MONTH;
    }

    get lunarAgePercent() {
        return this.#normalize((this.julianDate - 2451550.1) / this.#LUNAR_MONTH);
    }

    #normalize(value) {
        value = value - Math.floor(value);
        if (value < 0) value = value + 1;
        return value;
    }

    get lunarPhase() {
        if (this.lunarAge < 1.84566)
          return "New";
        else if (this.lunarAge < 5.53699)
          return "Waxing Crescent";
        else if (this.lunarAge < 9.22831)
          return "First Quarter";
        else if (this.lunarAge < 12.91963)
          return "Waxing Gibbous";
        else if (this.lunarAge < 16.61096)
          return "Full";
        else if (this.lunarAge < 20.30228)
          return "Waning Gibbous";
        else if (this.lunarAge < 23.99361)
          return "Last Quarter";
        else if (this.lunarAge < 27.68493)
          return "Waning Crescent";
        return "New";
    }

    get lunarPhaseEmoji() {
        const phases = {
            "New Moon": "🌑",
            "Waxing Crescent": "🌒", 
            "First Quarter": "🌓", 
            "Waxing Gibbous": "🌔",
            "Full Moon": "🌕",
            "Waning Gibbous": "🌖",
            "Last Quarter": "🌗",
            "Waning Crescent": "🌘"
        };
        return phases[this.lunarPhase]
    }

    get isWaxing() {
        return this.lunarAge <= 14.765;
    }

    get isWaning() {
        return this.lunarAge > 14.765;
    }
}