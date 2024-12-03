import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import quicker from './assets/quicker.png';
import hospital from './assets/hospital.jpg'; 
import "./Register.css";
import { useConfig } from './util/ConfigContext';

function RegisterForm() {
  const { serverUrl } = useConfig();
  // Variable Declaration
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(''); 
  const [errors, setErrors] = useState({});

  const navigate = useNavigate(); 

  const validateModel = () => {
    const foundErrors = {};
    if (!username) {
      foundErrors.username = 'Username is required';
    }
    if (!password) {
      foundErrors.password = 'Password is required';
    }
    if (!confirmPassword) {
      foundErrors.confirmPassword = 'Confirm Password is required';
    }
    if (password !== confirmPassword) {
      foundErrors.confirmPassword = 'Passwords do not match';
    }
    if (!role) {
      foundErrors.role = 'Role is required';
    }

    setErrors(foundErrors);
    return Object.keys(foundErrors).length === 0;
  }

  const RegisterClick = async () => {
    if (!validateModel()) {
      return;
    }
    
    const payload = {
      userName: username,
      userPassword: password,
      userRoles: role,
    };

    try {
      const response = await fetch(`${serverUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Registration successful:", data);
        alert('Registration successful!');
        navigate('/'); // Redirect to the login page after successful registration
      } else {
        const data = await response.json();
        alert('Registration failed');
        console.log("Registration failed:", data);
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  const ToLogin = () => {
    navigate('/')
  }

  // Style for background image
  const backgroundStyle = {
    backgroundImage: `url(${hospital})`,  // Set the background image
    backgroundSize: 'cover',             // Background image covers the entire container
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
          className='mb-2 text-black'
          value={username}
          onChange={(e) => setUsername(e.target.value)} // Update username field
          placeholder="Enter your username"
        />
        {errors.username && <span className="w-full text-error text-right">{errors.username}</span>}

        <label htmlFor="SelectRole">Select Role</label>
        <select
          id="SelectRole"
          className='mb-2 text-black'
          value={role} // Set the selected role
          onChange={(e) => setRole(e.target.value)} // Update the role state when selected
        >
          <option value="">Select a Role</option>
          <option value="INVENTORYSTAFF">Inventory</option>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
        {errors.role && <span className="w-full text-error text-right">{errors.role}</span>}

        <label htmlFor="passWord">Password</label>
        <input
          id="passWord"
          className='mb-2 text-black'
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password" // Update password field
        />
        {errors.password && <span className="w-full text-error text-right">{errors.password}</span>}

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          className='mb-2 text-black'
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password" // Update confirm password field
        />
          {errors.confirmPassword && <span className="w-full text-error text-right">{errors.confirmPassword}</span>}

        <button type="button" className='mt-6 mb-3' onClick={RegisterClick}>Register</button>
        
        {/* Back to Login Link */}
        <a onClick={ToLogin} className="BacktoLogin">Back to Login</a>
      </div>
    </div>
  );
}

export default RegisterForm;
