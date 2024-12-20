import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Menu from './Menu';
import EmergencyRoom from './emergencyRoom';
import InventoryPage from './Inventory'; 
import BillingPage from './Billing';
import Logout from './auth/Logout';
import Me from './auth/Me';

import { UserProvider } from './auth/UserContext'; 
import ProtectedRoutes from './auth/ProtectedRoutes';
import { ConfigProvider } from './util/ConfigContext';


function App() {

  return (
    <ConfigProvider>
      <UserProvider>

        <Router>
          <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/me" element={<Me />} />

            <Route element={<ProtectedRoutes/>}>
              <Route path="/menu" element={<Menu />} />
            </Route>
            <Route element={<ProtectedRoutes/>}>
              <Route path="/emergency" element={<EmergencyRoom />} />
            </Route>
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="*" element={<div>404: Page Not Found</div>} />
          </Routes>
        </Router>

      </UserProvider>
    </ConfigProvider>
  );
}

export default App;
