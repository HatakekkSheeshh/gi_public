import translations from '../translations.json'

function FlowerPage() {
  const text = translations.en.book

  function goToLogin() {
    window.location.assign('/')
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#131b21', overflow: 'hidden', position: 'relative' }}>
      <button 
        className="book-back-button" 
        onClick={goToLogin} 
        style={{ position: 'absolute', top: 22, left: 24, zIndex: 10 }}
      >
        {text.back}
      </button>
      <iframe 
        src="/flower/index.html" 
        style={{ width: '100%', height: '100%', border: 'none' }} 
        title="Flower"
        allow="autoplay"
      />
    </div>
  )
}

export default FlowerPage
