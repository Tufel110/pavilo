export const generateBarcode = (category, variant) => {
    const prefix = category ? category.substring(0, 3).toUpperCase() : 'GEN';
    const varCode = variant ? variant.substring(0, 3).toUpperCase() : 'STD';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${varCode}-${timestamp}`;
};
