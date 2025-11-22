export const calculateGST = (price, rate) => {
    const gstAmount = (price * rate) / 100;
    return {
        gstAmount,
        totalPrice: price + gstAmount
    };
};

export const calculateBasePrice = (total, rate) => {
    const basePrice = total / (1 + rate / 100);
    return {
        basePrice,
        gstAmount: total - basePrice
    };
};
