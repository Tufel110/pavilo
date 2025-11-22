import { useState, useEffect } from 'react';

export const useReports = () => {
    const [salesData, setSalesData] = useState([]);

    useEffect(() => {
        // Mock data for charts
        const data = [
            { name: 'Mon', sales: 4000 },
            { name: 'Tue', sales: 3000 },
            { name: 'Wed', sales: 2000 },
            { name: 'Thu', sales: 2780 },
            { name: 'Fri', sales: 1890 },
            { name: 'Sat', sales: 2390 },
            { name: 'Sun', sales: 3490 },
        ];
        setSalesData(data);
    }, []);

    const getTopSellingItems = () => {
        return [
            { name: 'Nike Air Max', quantity: 45 },
            { name: 'Adidas Ultraboost', quantity: 32 },
            { name: 'Puma T-Shirt', quantity: 28 },
        ];
    };

    return {
        salesData,
        getTopSellingItems
    };
};
