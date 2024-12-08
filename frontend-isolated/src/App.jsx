import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Menu from './Menu';
import EmergencyRoom from './emergencyRoom';
import InventoryPage from './Inventory';
import BedsPage from './bedmanagement' 
import BillingPage from './Billing';
import Logout from './auth/Logout';
import Me from './auth/Me';

import { ConfigProvider } from './util/ConfigContext';
import { UserProvider } from './auth/UserContext'; 
import ProtectedRoutes from './auth/ProtectedRoutes';
import { IStaticMethods } from 'flyonui/flyonui';


function App() {

  
  const location = useLocation();
  useEffect(() => {
      // Reinitialize FlyonUI components on page change
      const loadFlyonui = async () => {
        const flyonui = await import('flyonui/flyonui');
        window.HSStaticMethods.autoInit();
      };
      loadFlyonui();
    }, [location.pathname]); // Dependency on pathname

  return (
          <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/me" element={<Me />} />

            <Route element={<ProtectedRoutes />}>
              <Route path="/menu" element={<Menu />} />
            </Route>

            <Route element={<ProtectedRoutes allowedRoles={['ADMIN', 'INVENTORYSTAFF']} />}>
              <Route path="/inventory" element={<InventoryPage />} />
            </Route>

            <Route element={<ProtectedRoutes allowedRoles={['ADMIN', 'INVENTORYSTAFF']} />}>
              <Route path="/beds" element={<BedsPage />} />
            </Route>

            <Route element={<ProtectedRoutes allowedRoles={['ADMIN', 'STAFF']} />}>
              <Route path="/emergency" element={<EmergencyRoom />} />
            </Route>

            <Route element={<ProtectedRoutes allowedRoles={['ADMIN', 'STAFF']} />}>
              <Route path="/billing" element={<BillingPage />} />
            </Route>

            <Route path="*" element={<div>404: Page Not Found</div>} />
          </Routes>
  );
}

export default App;
