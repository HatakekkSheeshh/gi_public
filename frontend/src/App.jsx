import { useEffect, useState } from 'react'
import './App.css'
import { clearSession, verifySession } from './auth'
import BookPage from './pages/BookPage'
import LoginPage from './pages/LoginPage'
import FlowerPage from './pages/FlowerPage'

const protectedRoutes = {
  '/book': BookPage,
  '/flower': FlowerPage,
}

function App() {
  const path = window.location.pathname
  const ProtectedPage = protectedRoutes[path]
  const [isAllowed, setIsAllowed] = useState(!ProtectedPage)

  useEffect(() => {
    if (!ProtectedPage) {
      return
    }

    let isMounted = true

    async function checkAccess() {
      const hasAccess = await verifySession(path)

      if (!isMounted) {
        return
      }

      if (!hasAccess) {
        clearSession()
        window.location.replace('/')
        return
      }

      setIsAllowed(true)
    }

    checkAccess()

    return () => {
      isMounted = false
    }
  }, [ProtectedPage, path])

  if (ProtectedPage) {
    if (!isAllowed) {
      return (
        <main className="auth-loading" role="status">
          Checking access...
        </main>
      )
    }

    return <ProtectedPage />
  }

  return <LoginPage />
}

export default App
