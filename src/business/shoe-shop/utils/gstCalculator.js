/**
 * Calculates GST amount and total price.
 * @param {number} basePrice - The price before tax
 * @param {number} gstRate - GST percentage (e.g., 18 for 18%)
 * @returns {object} - { gstAmount, totalPrice }
 */
export const calculateGST = (basePrice, gstRate) => {
    const price = parseFloat(basePrice) || 0;
    const rate = parseFloat(gstRate) || 0;

    const gstAmount = (price * rate) / 100;
    const totalPrice = price + gstAmount;

    return {
        gstAmount: parseFloat(gstAmount.toFixed(2)),
        totalPrice: parseFloat(totalPrice.toFixed(2))
    };
};

/**
 * Reverse calculates base price from total price (inclusive of GST).
 * @param {number} totalPrice - The price including tax
 * @param {number} gstRate - GST percentage
 * @returns {object} - { basePrice, gstAmount }
 */
export const calculateBasePrice = (totalPrice, gstRate) => {
    const total = parseFloat(totalPrice) || 0;
    const rate = parseFloat(gstRate) || 0;

    const basePrice = total / (1 + rate / 100);
    const gstAmount = total - basePrice;

    return {
        basePrice: parseFloat(basePrice.toFixed(2)),
        gstAmount: parseFloat(gstAmount.toFixed(2))
    };
};
