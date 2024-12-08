import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import { ConfigProvider } from './util/ConfigContext';
import { UserProvider } from './auth/UserContext'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    <ConfigProvider>
      <UserProvider>

        <Router>
          <App />
        </Router>

      </UserProvider>
    </ConfigProvider>
    
  </StrictMode>,
)
