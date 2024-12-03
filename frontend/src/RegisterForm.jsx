import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import quicker from './assets/quicker.png';
import hospital from './assets/hospital.jpg'; 
import "./Register.css";

function RegisterForm() {
  // Variable Declaration
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(''); 

  const navigate = useNavigate(); 

  // Handle form submission
  const RegisterClick = (e) => {
    e.preventDefault();

    // Check fields if empty
    if (username === '' || password === '' || confirmPassword === '' || role === '') {
      alert('Please fill in all fields');
    } else if (password !== confirmPassword) {
      alert('Passwords do not match');
    } else {
        alert('Registration successful!');
        navigate('/'); // Redirect to the login page after successful registration
      }
  };

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
          value={username}
          onChange={(e) => setUsername(e.target.value)} // Update username field
          placeholder="Enter your username"
        />

        <label htmlFor="SelectRole">Select Role</label>
        <select
          id="SelectRole"
          value={role} // Set the selected role
          onChange={(e) => setRole(e.target.value)} // Update the role state when selected
        >
          <option value=""></option>
          <option value="inventory">Inventory</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>

        <label htmlFor="passWord">Password</label>
        <input
          id="passWord"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password" // Update password field
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password" // Update confirm password field
        />

        <button type="submit" onClick={RegisterClick}>Register</button>
        
        {/* Back to Login Link */}
        <a href="/" className="BacktoLogin">Back to Login</a>
      </div>
    </div>
  );
}

export default RegisterForm;
