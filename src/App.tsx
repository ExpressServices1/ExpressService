import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Home from './pages/Home';
import TrackPage from './pages/track';
import PricingPage from './pages/Pricing';
import CompanyPage from './pages/CompanyPage';
import LegalPage from './pages/LegalPage';
import ContactPage from './pages/ContactPage';
import ServicesPage from './pages/services/ServicesPage';
import SupplyChainPage from './pages/services/SupplyChainPage';
import AdminLogin from './admindashboard/index';
import OrderListPage from './admindashboard/orders';
import ProtectedRoute from './admindashboard/ProtectedRoute';

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admindashboard');

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/company" element={<CompanyPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/supply-chain" element={<SupplyChainPage />} />
          <Route path="/admindashboard/index" element={<AdminLogin />} />
          <Route
            path="/admindashboard/orders"
            element={
              <ProtectedRoute>
                <OrderListPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
};

const App: React.FC = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;
