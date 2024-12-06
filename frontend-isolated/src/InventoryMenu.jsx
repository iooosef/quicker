import React from 'react';
import { useNavigate } from 'react-router-dom';
import inventory from './assets/inventory.png';
import inventorylogo from './assets/inventorylogo.png';
import bedlogo from './assets/bedlogo.png';
import beds from './assets/beds.jpg';
import quicker from './assets/quicker.png';

const InventoryMenu = () => {
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
          style={{ backgroundImage: `url(${beds})` }}
          onClick={() => navigate('/bedmanagement')}
        >
          <img src={bedlogo} alt="Bed Logo" className="menu-icon" />
          <h3>Bed Management</h3>
        </div>

        
      </div>
    </div>
  );
};

export default InventoryMenu;
