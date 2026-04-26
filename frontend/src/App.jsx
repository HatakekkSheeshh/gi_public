import './App.css'
import BookPage from './pages/BookPage'
import LoginPage from './pages/LoginPage'
import FlowerPage from './pages/FlowerPage'

function App() {
  if (window.location.pathname === '/book') {
    return <BookPage />
  }

  if (window.location.pathname === '/flower') {
    return <FlowerPage />
  }

  return <LoginPage />
}

export default App
