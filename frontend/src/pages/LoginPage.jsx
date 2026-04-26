import { useState } from 'react'
import { API_BASE_URL } from '../config'
import translations from '../translations.json'

function AuthField({ id, label, name, type = 'text', placeholder, helper }) {
  return (
    <label className="auth-field" htmlFor={id}>
      <span>{label}</span>
      <span className="input-wrap">
        <input id={id} name={name} type={type} placeholder={placeholder} />
        {helper ? <button type="button" aria-label={helper} className="field-icon" /> : null}
      </span>
    </label>
  )
}

function LoginPage() {
  const [language, setLanguage] = useState('en')
  const [loginStatus, setLoginStatus] = useState(null)
  const text = translations[language]

  async function handleLogin(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        body: JSON.stringify({ username, password }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        setLoginStatus('error')
        return
      }

      const data = await response.json()

      if (!data.ok) {
        setLoginStatus('error')
        return
      }

      setLoginStatus('success')

      if (data.redirectUrl) {
        window.location.assign(data.redirectUrl)
      }
    } catch {
      setLoginStatus('error')
    }
  }

  return (
    <main className="login-page">
      <div className="language-switcher" aria-label="Choose language">
        {Object.entries(translations).map(([key, option]) => (
          <button
            className={language === key ? 'active' : ''}
            key={key}
            onClick={() => setLanguage(key)}
            type="button"
          >
            {option.name}
          </button>
        ))}
      </div>

      <section className="brand-panel" aria-label={text.welcomeLabel}>
        <div className="brand-copy">
          <h1>{text.heroTitle}</h1>
        </div>
      </section>

      <section className="auth-stage" aria-label={text.accountLabel}>
        <div className="auth-card auth-card-single">
          <form className="auth-form login-form" onSubmit={handleLogin}>
            <h2>{text.formTitle}</h2>
            <AuthField
              id="login-username"
              name="username"
              label={text.email}
              placeholder={text.emailPlaceholder}
            />
            <AuthField
              id="login-password"
              name="password"
              label={text.password}
              type="password"
              placeholder={text.passwordPlaceholder}
              helper={text.showPassword}
            />
            <button className="primary-button login-button" type="submit">
              {text.login}
            </button>
            {loginStatus ? (
              <p className={`login-message ${loginStatus}`} role="status">
                {loginStatus === 'success' ? text.loginSuccess : text.loginError}
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
