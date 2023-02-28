const template = document.createElement("template");

template.innerHTML = `
    <link rel="stylesheet" href="/admin/hb-form/shadow.css">
    <fieldset>
        <h2></h2>
        <form onsubmit="this.getRootNode().host.placeOrder(event)">
            <select name="symbol">
                <optgroup label="Cash">
                    <option>AAPL</option>
                </optgroup>
                <optgroup label="Margin">
                    <option selected>SQ</option>
                    <option>ABNB</option>
                </optgroup>
            </select>
            <select name="order">
                <optgroup label="Bear">
                    <option selected>Short</option>
                    <option>Cover</option>
                </optgroup>
                <optgroup label="Bull">
                    <option>Buy</option>
                    <option>Sell</option>
                </optgroup>
            </select>
            <br><br>
            <input id="number-quantity" name="quantity" type="number" value="5" onchange="this.getRootNode().host.updateQuantity(this)">
            <input id="range-quantity" type="range" value="5" onchange="this.getRootNode().host.updateQuantity(this)">
            <br><br>
            <input type="datetime-local">
            <br><br>
            <input type="submit" value="Submit">
            <!--<input type="submit" onclick="this.form.account=this.value" value="corporate">-->
            <!--<input type="submit" onclick="this.form.account=this.value" value="personal">-->
        </form>
    </fieldset>
`;

export default template;