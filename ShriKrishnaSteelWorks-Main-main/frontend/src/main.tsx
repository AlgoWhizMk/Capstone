import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './skw-styles.css'
import './footer-styles.css'
import './navbar-extras.css'
import './about-styles.css'
import './projects-styles.css'
import './products-styles.css'
import './contact-styles.css'
import App from './App.tsx'
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="top-right" />
    </AuthProvider>
  </StrictMode>,
)