import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import inventory from './assets/inventory.png';
import inventorylogo from './assets/inventorylogo.png';
import emergency from './assets/emergency.png';
import emergencylogo from './assets/emergencylogo.png';
import billing from './assets/billing.png';
import billinglogo from './assets/billslogo.png';
import quicker from './assets/quicker.png';
import { useUser } from './auth/UserContext';

const Menu = () => {
  const { user, loading } = useUser(); 
  const navigate = useNavigate();
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    if (user || loading === false) {
      setIsUserLoaded(true);
      console.log(user)
    }
  }, [user, loading]);

  if (loading || !isUserLoaded) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="menu-container h-full flex flex-col p-6">
      <div className="w-full flex justify-center mb-4">
        <img src={quicker} alt="Quicker Logo" className="menu-logo w-52" />
      </div>
      <div className="menu-grid h-full flex gap-4">
        {(user.role == "ADMIN" || user.role == "INVENTORYSTAFF") && 
          <div
          className="menu-card w-full h-full py-8 flex justify-center items-center rounded-lg cursor-pointer hover:translate-y-[-5px] transition-all ease-in"
          style={{ backgroundImage: `url(${inventory})` }}
          onClick={() => navigate('/inventory')}
          >
            <div className="flex flex-col items-center">  
              <img src={inventorylogo} alt="Inventory Logo" className="menu-icon w-20 h-20" />
              <h3 className="pt-6 text-white text-2xl uppercase text-center">Inventory</h3>
            </div>
          </div>
        }
        
        {(user.role == "ADMIN" || user.role == "STAFF") &&
          <div
            className="menu-card w-full h-full py-8 flex justify-center items-center rounded-lg cursor-pointer hover:translate-y-[-5px] transition-all ease-in"
            style={{ backgroundImage: `url(${emergency})` }}
            onClick={() => navigate('/emergency')}
          >
            <div className="flex flex-col items-center">  
              <img src={emergencylogo} alt="Emergency Logo" className="menu-icon w-20" />
              <h3 className="pt-6 text-white text-2xl uppercase text-center">Emergency Room</h3>
            </div>
          </div>
        }
        
        {(user.role == "ADMIN" || user.role == "STAFF") &&
          <div
          className="menu-card w-full h-full py-8 flex justify-center items-center rounded-lg cursor-pointer hover:translate-y-[-5px] transition-all ease-in"
          style={{ backgroundImage: `url(${billing})` }}
          onClick={() => navigate('/billing')}
          >
            <div className="flex flex-col items-center">  
              <img src={billinglogo} alt="Billing Logo" className="menu-icon w-20" />
              <h3 className="pt-6 text-white text-2xl uppercase text-center">Bills & Paperwork</h3>
            </div>
          </div>
        }

        
      </div>
    </div>
  );
};

export default Menu;
