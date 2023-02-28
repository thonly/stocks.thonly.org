export const KIITOS = navigator.userAgent.includes('Nexus 5'); // Nexus 5 Build/MRA58N
export const LIVE = location.hostname === 'kiitos.heartbank.market';

export function formatToDollar(element, amount) {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    element.textContent = formatter.format(Math.abs(amount));
    element.style.color = amount < 0 ? 'red' : 'green';
    element.style.fontWeight = 'bold';
}

export function formatToPercent(element, percentage) {
    element.textContent = Math.abs(percentage).toFixed(2) + "%";
    element.style.color = percentage < 0 ? 'red' : 'green';
}

// TODO: put in prototpe of native string or number objects

export function formatToDollars(amount) {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    return formatter.format(amount);
}

export function formatToPercents(percentage) {
    return percentage.toFixed(2) + "%";
}

export function formatToQuantity(quantity) {
    const formatter = new Intl.NumberFormat('en-US');
    return formatter.format(quantity);
}