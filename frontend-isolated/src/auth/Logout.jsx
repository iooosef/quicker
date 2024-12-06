import React, { useEffect } from 'react';
import { useUser } from './UserContext';
import { useConfig } from '../util/ConfigContext';

const Logout = () => {
  const { serverUrl } = useConfig();
  const { logout } = useUser();

  useEffect(() => {
    const performLogout = async () => {
      // Call the logout API
      await fetch(`${serverUrl}/logout`, {
        method: 'POST', // Assuming POST method for logout
        credentials: 'include', // Include cookies if necessary
      });

      // Call the context logout function
      logout();

      // Redirect to the client side (React app)
      window.location.href = 'http://localhost:5173'; // Redirect to your client-side application (home page or login page)
    };

    performLogout();
  }, [logout]);

  return (
    <span className="loading loading-spinner loading-lg"></span>
  );
};

export default Logout;
