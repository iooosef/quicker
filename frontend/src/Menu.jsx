import React from 'react';
import { useNavigate } from 'react-router-dom';
import inventory from './assets/inventory.png';
import inventorylogo from './assets/inventorylogo.png';
import emergency from './assets/emergency.png';
import emergencylogo from './assets/emergencylogo.png';
import billing from './assets/billing.png';
import billinglogo from './assets/billslogo.png';
import quicker from './assets/quicker.png';

const Menu = () => {
  const navigate = useNavigate();
  return (
    <div className="menu-container">
      <img src={quicker} alt="Quicker Logo" className="menu-logo" />
      <div className="menu-grid">
        <div
          className="menu-card"
          style={{ backgroundImage: `url(${inventory})` }}
          onClick={() => navigate('/inventory')}
        >
          <img src={inventorylogo} alt="Inventory Logo" className="menu-icon" />
          <h3>Inventory</h3>
        </div>
        <div
          className="menu-card"
          style={{ backgroundImage: `url(${emergency})` }}
          onClick={() => navigate('/emergency')}
        >
          <img src={emergencylogo} alt="Emergency Logo" className="menu-icon" />
          <h3>Emergency Room</h3>
        </div>
        <div
          className="menu-card"
          style={{ backgroundImage: `url(${billing})` }}
          onClick={() => navigate('/billing')}
        >
          <img src={billinglogo} alt="Billing Logo" className="menu-icon" />
          <h3>Bills & Paperwork</h3>
        </div>
      </div>
    </div>
  );
};

export default Menu;
