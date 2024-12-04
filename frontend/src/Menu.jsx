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
      <div className="w-full flex justify-between mb-4">
        <img src={quicker} alt="Quicker Logo" className="menu-logo w-52" />
          <a href="/logout" className="text-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                  <path fill="currentColor"
                        d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h6q.425 0 .713.288T12 4t-.288.713T11 5H5v14h6q.425 0 .713.288T12 20t-.288.713T11 21zm12.175-8H10q-.425 0-.712-.288T9 12t.288-.712T10 11h7.175L15.3 9.125q-.275-.275-.275-.675t.275-.7t.7-.313t.725.288L20.3 11.3q.3.3.3.7t-.3.7l-3.575 3.575q-.3.3-.712.288t-.713-.313q-.275-.3-.262-.712t.287-.688z"/>
              </svg>
          </a>
      </div>
        <div className="menu-grid h-full flex gap-4">
            {(user.role == "ADMIN" || user.role == "INVENTORYSTAFF") &&
                <div
                    className="menu-card w-full h-full py-8 flex justify-center items-center rounded-lg cursor-pointer hover:translate-y-[-5px] transition-all ease-in"
                    style={{backgroundImage: `url(${inventory})`}}
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
