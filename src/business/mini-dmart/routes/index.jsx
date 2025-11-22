import { Routes, Route } from 'react-router-dom';
import MiniDmartDashboard from '../MiniDmartDashboard';
import Overview from '../components/Overview';
import PlaceholderComponent from '../components/PlaceholderComponent';

const MiniDmartRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<MiniDmartDashboard />}>
                <Route index element={<Overview />} />
                <Route path="pos" element={<PlaceholderComponent title="POS & Billing" />} />
                <Route path="inventory" element={<PlaceholderComponent title="Inventory Management" />} />
                <Route path="customers" element={<PlaceholderComponent title="Customer Management" />} />
                <Route path="reports" element={<PlaceholderComponent title="Reports & Analytics" />} />
                <Route path="suppliers" element={<PlaceholderComponent title="Supplier Management" />} />
            </Route>
        </Routes>
    );
};

export default MiniDmartRoutes;
