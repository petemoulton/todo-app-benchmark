import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Use standalone version for Ticket #3 (UI only, no backend integration)
import App from './App.standalone.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
