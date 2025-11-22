import { Routes, Route } from 'react-router-dom';
import AnajVyapariDashboard from '../AnajVyapariDashboard';
import Overview from '../components/Overview';
import PlaceholderComponent from '../components/PlaceholderComponent';

const AnajVyapariRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AnajVyapariDashboard />}>
                <Route index element={<Overview />} />
                <Route path="pos" element={<PlaceholderComponent title="Billing & Invoicing" />} />
                <Route path="inventory" element={<PlaceholderComponent title="Stock & Inventory" />} />
                <Route path="customers" element={<PlaceholderComponent title="Customer Management" />} />
                <Route path="reports" element={<PlaceholderComponent title="Reports & Analytics" />} />
                <Route path="suppliers" element={<PlaceholderComponent title="Supplier Management" />} />
            </Route>
        </Routes>
    );
};

export default AnajVyapariRoutes;
