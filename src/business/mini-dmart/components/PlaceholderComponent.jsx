const PlaceholderComponent = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
            <p className="text-gray-600">This feature is coming soon. It will use the same Supabase tables as the Shoe Shop module.</p>
            <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-md">
                <p className="text-sm text-blue-800">
                    <strong>Technical Note:</strong> This component will reuse the existing hooks (useInventory, useSales, useLoyalty)
                    with the same database tables (products, invoices, customers).
                </p>
            </div>
        </div>
    );
};

export default PlaceholderComponent;
