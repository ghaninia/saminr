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
import ProductDetails from './pages/Product/ProductDetails'
import { ROUTES } from './constants/index'
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
                <Route path={ROUTES.HOME} element={<Main />} />
                <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetails />} />
                <Route path={ROUTES.CONTACT} element={<Contact />} />
                <Route path={ROUTES.GALLERY} element={<Gallery />} />
                <Route path={ROUTES.EVENTS} element={<Events />} />
                <Route path={ROUTES.REGISTRATION_EVENT} element={<RegistrationEvent />} />
                <Route path={ROUTES.GET_TICKET} element={<GetTicket />} />
              </Routes>
            </div>
          </Router>
        </SettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App

