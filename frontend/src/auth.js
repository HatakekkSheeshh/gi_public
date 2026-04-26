import { API_BASE_URL } from './config'

export const AUTH_TOKEN_KEY = 'gi:authToken'
export const AUTH_REDIRECT_KEY = 'gi:redirectUrl'
export const AUTH_DISPLAY_NAME_KEY = 'gi:displayName'

export function saveSession({ displayName, redirectUrl, token }) {
  if (!token || !redirectUrl) {
    clearSession()
    return
  }

  window.sessionStorage.setItem(AUTH_TOKEN_KEY, token)
  window.sessionStorage.setItem(AUTH_REDIRECT_KEY, redirectUrl)

  if (displayName) {
    window.sessionStorage.setItem(AUTH_DISPLAY_NAME_KEY, displayName)
  }
}

export function getSession() {
  return {
    displayName: window.sessionStorage.getItem(AUTH_DISPLAY_NAME_KEY),
    redirectUrl: window.sessionStorage.getItem(AUTH_REDIRECT_KEY),
    token: window.sessionStorage.getItem(AUTH_TOKEN_KEY),
  }
}

export function clearSession() {
  window.sessionStorage.removeItem(AUTH_DISPLAY_NAME_KEY)
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
  window.sessionStorage.removeItem(AUTH_REDIRECT_KEY)
}

export async function verifySession(path) {
  const { redirectUrl, token } = getSession()

  if (!token || redirectUrl !== path) {
    return false
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/session`, {
      body: JSON.stringify({ path, token }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()

    if (data.displayName) {
      window.sessionStorage.setItem(AUTH_DISPLAY_NAME_KEY, data.displayName)
    }

    return Boolean(data.ok)
  } catch {
    return false
  }
}
