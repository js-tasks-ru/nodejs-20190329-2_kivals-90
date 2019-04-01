function sum(a, b) {
    if (!isNumeric(a) || !isNumeric(b)) {
        throw new TypeError("invalid arguments");
    }

    return a + b;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = sum;
