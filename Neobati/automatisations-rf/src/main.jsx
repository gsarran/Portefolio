import { createRoot } from 'react-dom/client'
import '@xyflow/react/dist/style.css'
import './index.css'
import App from './App.jsx'

// StrictMode retiré intentionnellement : il double-déclenche les useEffect en dev,
// ce qui causait 3 animations au lieu d'une.
createRoot(document.getElementById('root')).render(<App />)
