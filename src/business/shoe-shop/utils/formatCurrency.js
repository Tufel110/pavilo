/**
 * Formats a number as Indian Rupee (INR).
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string (e.g., ₹1,234.56)
 */
export const formatCurrency = (amount) => {
    const value = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

/**
 * Formats a large number with suffixes (K, M, Cr).
 * @param {number} num 
 * @returns {string}
 */
export const formatCompactNumber = (num) => {
    return new Intl.NumberFormat('en-IN', {
        notation: "compact",
        compactDisplay: "short"
    }).format(num);
};
