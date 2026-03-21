import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Navigation from './components/Navigation'
import Main from './pages/Main/Main'
import Contact from './pages/Contact/Contact'
import Gallery from './pages/Gallery/Gallery'
import Events from './pages/Events/Events'
import RegistrationEvent from './pages/RegistrationEvent/RegistrationEvent'
import GetTicket from './pages/GetTicket/GetTicket'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SettingsProvider>
          <Router>
            <div className="App">
              <Navigation />
              <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/events" element={<Events />} />
                <Route path="/registration-event" element={<RegistrationEvent />} />
                <Route path="/get-ticket" element={<GetTicket />} />
              </Routes>
            </div>
          </Router>
        </SettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App

