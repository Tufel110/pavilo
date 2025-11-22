/**
 * Generates a unique barcode based on item details and a timestamp.
 * Format: CAT-VAR-TIMESTAMP (e.g., SHO-BLK-1715623)
 * @param {string} category - Product category (e.g., 'SHOES', 'SHIRT')
 * @param {string} variant - Product variant (e.g., 'BLK', 'XL')
 * @returns {string} - Generated barcode string
 */
export const generateBarcode = (category = 'GEN', variant = 'STD') => {
  const prefix = category.substring(0, 3).toUpperCase();
  const varCode = variant.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${prefix}-${varCode}-${timestamp}${random}`;
};

/**
 * Validates if a barcode string follows the expected format.
 * @param {string} barcode 
 * @returns {boolean}
 */
export const validateBarcode = (barcode) => {
  const regex = /^[A-Z]{3}-[A-Z]{3}-\d{9}$/;
  return regex.test(barcode);
};
