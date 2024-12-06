import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import quicker from './assets/quicker.png';
import hospital from './assets/hospital.jpg'; 
import "./LogIn.css";

import { useUser } from './auth/UserContext'; 
import { useConfig } from './util/ConfigContext';

function LoginForm() {
  const { serverUrl } = useConfig();
  // Variable Declaration
  const { login } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Handle form submission
  const LoginClick = async () => {
    const payload = {
      userName: username,
      userPassword: password,
    };
  
    try {
      const response = await fetch(`${serverUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },        
        credentials: 'include',
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const data = await response.json();
        login(data);
        navigate('/menu');
      } else {
        const data = await response.json();
        if (data.errors && data.errors[0].type === 'authentication_error') {
          setErrorMessage(data.errors[0].message); // Set the error message
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage('An error occurred, please try again.');
    }
  };

  const ToRegister = () => {
    navigate('/register')
  }

  // Style for background image (outer div)
  const backgroundStyle = {
    backgroundImage: `url(${hospital})`,  // Set the background image
    backgroundSize: 'cover',             // Image covers the entire container
    backgroundPosition: 'center center', // Center the image
    backgroundAttachment: 'fixed',       // Ensure background stays fixed
    height: '100vh',                     // Set the height to cover the full viewport
    display: 'flex',                     // Use flex to center the form vertically
    justifyContent: 'center',            // Center horizontally
    alignItems: 'center',                // Center vertically
  };

  return (
    <div style={backgroundStyle}>
      <div className="Register">
        <img src={quicker} alt="quicker logo" />

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          className="text-black"
          onChange={(e) => setUsername(e.target.value)} // Update username field
          placeholder="Enter your username"
        />

        <label htmlFor="passWord">Password</label>
        <input
          id="passWord"
          type="password"
          value={password}
          className="text-black"
          onChange={(e) => setPassword(e.target.value)} // Update password field
          placeholder="Enter your password"
        />

        <button type="submit" className='mt-4' onClick={LoginClick}>Login</button>

        {errorMessage && <p className="mt-2 badge badge-error">{errorMessage}</p>}

        {/* Link to Register Page */}
        <a onClick={ToRegister} className="BacktoLogin">Don't have an account? Register</a>
      </div>
    </div>
  );
}

export default LoginForm;
