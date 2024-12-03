import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import quicker from './assets/quicker.png';
import hospital from './assets/hospital.jpg'; 
import "./LogIn.css";

function LoginForm() {
  // Variable Declaration
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate(); 

  // Handle form submission
  const LoginClick = (e) => {
    e.preventDefault();

    // Check if fields are empty
    if (username === '' || password === '') {
      alert('Please fill in all fields');
    } else {
      alert('Login successful!');
      navigate('/menu'); // Navigate to the Menu page
    }
  };

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
          onChange={(e) => setUsername(e.target.value)} // Update username field
          placeholder="Enter your username"
        />

        <label htmlFor="passWord">Password</label>
        <input
          id="passWord"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Update password field
          placeholder="Enter your password"
        />

        <button type="submit" onClick={LoginClick}>Login</button>

        {/* Link to Register Page */}
        <a href="/register" className="BacktoLogin">Don't have an account? Register</a>
      </div>
    </div>
  );
}

export default LoginForm;
