import { useMemo, useRef, useState } from 'react'
import translations from '../translations.json'

const classMedia = [
  { src: '/images/class_1.jpg', type: 'image' },
  { src: '/images/class_2.jpg', type: 'image' },
  { src: '/images/class_3.jpg', type: 'image' },
  { src: '/images/class_4.jpg', type: 'image' },
  { src: '/images/class_5.jpg', type: 'image' },
  { src: '/images/class_6.jpg', type: 'image' },
  { src: '/images/class_7.jpg', type: 'image' },
  { objectPosition: 'center top', src: '/images/frau_linh_lam.jpg', type: 'image' },
]

const nguyenMedia = [
  { src: '/images/nguyen_1.jpg', type: 'image' },
  { objectPosition: 'center top', src: '/images/nguyen_2.jpg', type: 'image' },
  { src: '/images/nguyen_3.jpg', type: 'image' },
  { objectPosition: 'center top', src: '/images/nguyen_4.jpg', type: 'image' },
  { src: '/images/nguyen_5.jpg', type: 'image' },
  { objectPosition: 'center top', src: '/images/nguyen_6.jpg', type: 'image' },
  { src: '/images/nguyen_7.jpg', type: 'image' },
  { src: '/images/nguyen_8.mp4', type: 'video' },
  { src: '/images/nguyen_9.mp4', type: 'video' },
]

function createMediaPages(media, section) {
  const pages = []

  for (let index = 0; index < media.length; index += 2) {
    pages.push({
      media: media.slice(index, index + 2),
      section,
      type: 'media',
    })
  }

  return pages
}

const classPages = createMediaPages(classMedia, 'class')
const nguyenPages = createMediaPages(nguyenMedia, 'nguyen')

const bookPages = [
  {
    type: 'contents',
  },
  {
    titleKey: 'contentsClass',
    type: 'section',
  },
  ...classPages,
  {
    titleKey: 'contentsNguyen',
    type: 'section',
  },
  ...nguyenPages,
]

const coverImage = '/images/auf_geht.jpg'
const backCoverImage = '/images/auf_geht_1.jpg'
const flipDuration = 980

function BookContents({ text }) {
  return (
    <div className="book-contents">
      <h2>{text.contentsTitle}</h2>
      <div className="toc-row">
        <span>{text.contentsClass}</span>
        <span className="toc-dots" />
        <span>1</span>
      </div>
      <div className="toc-row">
        <span>{text.contentsNguyen}</span>
        <span className="toc-dots" />
        <span>12</span>
      </div>
    </div>
  )
}

function BookSectionTitle({ page, text }) {
  return (
    <div className="book-section-title">
      <h2>{text[page.titleKey]}</h2>
    </div>
  )
}

function Lightbox({ item, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  function handleZoomIn() {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  }

  function handleZoomOut() {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  }

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" aria-label="Close" onClick={onClose}>✕</button>
      <div className="lightbox-toolbar" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleZoomOut} disabled={zoom === 1} aria-label="Zoom out">−</button>
        <span className="lightbox-zoom-level">{Math.round(zoom * 100)}%</span>
        <button onClick={handleZoomIn} disabled={zoom === 4} aria-label="Zoom in">+</button>
      </div>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <img 
          src={item.src} 
          alt="Enlarged view" 
          onPointerDown={(e) => {
            if (zoom > 1) {
              isDragging.current = true;
              lastPos.current = { x: e.clientX, y: e.clientY };
              e.target.setPointerCapture(e.pointerId);
            }
          }}
          onPointerMove={(e) => {
            if (isDragging.current && zoom > 1) {
              const dx = e.clientX - lastPos.current.x;
              const dy = e.clientY - lastPos.current.y;
              setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
              lastPos.current = { x: e.clientX, y: e.clientY };
            }
          }}
          onPointerUp={(e) => {
            if (isDragging.current) {
              isDragging.current = false;
              e.target.releasePointerCapture(e.pointerId);
            }
          }}
          onPointerCancel={(e) => {
            if (isDragging.current) {
              isDragging.current = false;
              e.target.releasePointerCapture(e.pointerId);
            }
          }}
          style={{
            transform: `scale(${zoom}) translate(${position.x/zoom}px, ${position.y/zoom}px)`,
            transition: isDragging.current ? 'none' : 'transform 0.2s',
            cursor: zoom > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default'
          }}
          draggable={false}
        />
      </div>
    </div>
  )
}

function BookMediaItem({ item, pageNumber, itemNumber, text, onMediaClick }) {
  const label = `${text.page} ${pageNumber}.${itemNumber}`

  if (item.type === 'video') {
    return (
      <video aria-label={label} controls loop muted playsInline>
        <source src={item.src} type="video/mp4" />
      </video>
    )
  }

  return (
    <img 
      alt={label} 
      src={item.src} 
      style={{ objectPosition: item.objectPosition, cursor: 'zoom-in' }} 
      onClick={() => onMediaClick(item)} 
    />
  )
}

function BookPageContent({ page, pageNumber, text, variant, onMediaClick }) {
  if (!page) {
    return (
      <div className="book-content empty-page-content">
        <p>{text.empty}</p>
      </div>
    )
  }

  if (page.type === 'contents') {
    return (
      <div className={`book-content ${variant}`}>
        <BookContents text={text} />
      </div>
    )
  }

  if (page.type === 'section') {
    return (
      <div className={`book-content ${variant}`}>
        <BookSectionTitle page={page} text={text} />
      </div>
    )
  }

  return (
    <div className={`book-content ${variant}`}>
      <div className={`book-media-grid media-count-${page.media.length}`}>
        {page.media.map((item, index) => (
          <figure key={item.src}>
            <BookMediaItem
              item={item}
              itemNumber={index + 1}
              pageNumber={pageNumber}
              text={text}
              onMediaClick={onMediaClick}
            />
          </figure>
        ))}
      </div>
    </div>
  )
}

function BookPage() {
  const [language, setLanguage] = useState('en')
  const [lightboxItem, setLightboxItem] = useState(null)
  const [isCoverOpen, setIsCoverOpen] = useState(false)
  const [coverSide, setCoverSide] = useState('front')
  const [spreadIndex, setSpreadIndex] = useState(0)
  const [flipDirection, setFlipDirection] = useState(null)
  const [pendingSpreadIndex, setPendingSpreadIndex] = useState(null)
  const [isDraggingBook, setIsDraggingBook] = useState(false)
  const [bookPosition, setBookPosition] = useState({ x: 0, y: 0 })
  const dragRef = useRef({
    isDragging: false,
    moved: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  })
  const text = translations[language].book
  const spreads = useMemo(() => {
    const result = []

    for (let index = 0; index < bookPages.length; index += 2) {
      result.push({
        left: bookPages[index],
        right: bookPages[index + 1] ?? null,
      })
    }

    return result
  }, [])

  const spread = spreads[spreadIndex]
  const visibleSpread = pendingSpreadIndex === null ? spread : spreads[pendingSpreadIndex]
  const currentPage = spreadIndex * 2 + 1
  const visiblePage = (pendingSpreadIndex ?? spreadIndex) * 2 + 1
  const totalPages = bookPages.length
  const isFlipping = Boolean(flipDirection)

  function turnPage(direction) {
    if (!isCoverOpen) {
      setIsCoverOpen(true)
      setCoverSide('front')
      if (direction === -1) {
        setSpreadIndex(spreads.length - 1)
      }
      return
    }

    const nextIndex = spreadIndex + direction

    if (direction === -1 && spreadIndex === 0) {
      setIsCoverOpen(false)
      setCoverSide('front')
      setSpreadIndex(0)
      return
    }

    if (direction === 1 && spreadIndex === spreads.length - 1) {
      setIsCoverOpen(false)
      setCoverSide('back')
      return
    }

    if (nextIndex < 0 || nextIndex > spreads.length - 1 || isFlipping) {
      return
    }

    setPendingSpreadIndex(nextIndex)
    setFlipDirection(direction)
    window.setTimeout(() => {
      setSpreadIndex(nextIndex)
      setPendingSpreadIndex(null)
      setFlipDirection(null)
    }, flipDuration)
  }

  function goToLogin() {
    window.location.assign('/')
  }

  function handleBookKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      turnPage(1)
    }
  }

  function handleBookPointerDown(event) {
    if (event.button !== 0) {
      return
    }

    if (event.target.tagName.toLowerCase() === 'img') {
      return
    }

    event.preventDefault()

    dragRef.current = {
      isDragging: true,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: bookPosition.x,
      originY: bookPosition.y,
    }

    setIsDraggingBook(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleBookPointerMove(event) {
    const drag = dragRef.current

    if (!drag.isDragging || drag.pointerId !== event.pointerId) {
      return
    }

    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      drag.moved = true
    }

    setBookPosition({
      x: drag.originX + deltaX,
      y: drag.originY + deltaY,
    })
  }

  function handleBookPointerUp(event) {
    const drag = dragRef.current

    if (!drag.isDragging || drag.pointerId !== event.pointerId) {
      return
    }

    dragRef.current = {
      ...drag,
      isDragging: false,
      pointerId: null,
    }

    setIsDraggingBook(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleBookPointerCancel(event) {
    const drag = dragRef.current

    if (drag.pointerId !== event.pointerId) {
      return
    }

    dragRef.current = {
      ...drag,
      isDragging: false,
      pointerId: null,
    }
    setIsDraggingBook(false)
  }

  return (
    <main className="book-page">
      <div className="book-language-switcher" aria-label="Choose language">
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

      <button className="book-back-button" onClick={goToLogin} type="button">
        {text.back}
      </button>

      <section className="book-stage" aria-label="3D photo book">
        <button
          className="page-button"
          disabled={!isCoverOpen}
          onClick={() => turnPage(-1)}
          type="button"
        >
          {text.previous}
        </button>

        <div
          className={`book-shell ${isCoverOpen ? 'is-open' : 'is-closed'} ${
            flipDirection === 1 ? 'flip-next' : ''
          } ${flipDirection === -1 ? 'flip-previous' : ''} ${
            isDraggingBook ? 'is-dragging' : ''
          }`}
          onKeyDown={handleBookKeyDown}
          onLostPointerCapture={handleBookPointerCancel}
          onPointerCancel={handleBookPointerCancel}
          onPointerDown={handleBookPointerDown}
          onPointerMove={handleBookPointerMove}
          onPointerUp={handleBookPointerUp}
          role="button"
          style={{
            '--book-x': `${bookPosition.x}px`,
            '--book-y': `${bookPosition.y}px`,
          }}
          tabIndex="0"
          title={text.hint}
        >
          {!isCoverOpen ? (
            <article className="book-cover closed-cover">
              <img
                alt={coverSide === 'front' ? "Auf geht's book cover" : "Auf geht's back cover"}
                src={coverSide === 'front' ? coverImage : backCoverImage}
              />
            </article>
          ) : (
            <>
              <div className="book-stack left-stack" />
              <div className="book-stack right-stack" />
              <div className="book-spine" />
              <article className={`book-page-side left-page ${isFlipping ? 'current-spread' : ''}`}>
                <BookPageContent
                  onMediaClick={setLightboxItem}
                  page={spread.left}
                  pageNumber={currentPage}
                  text={text}
                  variant="left-content"
                />
                <span>{currentPage}</span>
              </article>
              <article className={`book-page-side right-page ${isFlipping ? 'current-spread' : ''}`}>
                <BookPageContent
                  onMediaClick={setLightboxItem}
                  page={spread.right}
                  pageNumber={currentPage + 1}
                  text={text}
                  variant="right-content"
                />
                <span>{spread.right ? currentPage + 1 : totalPages}</span>
              </article>
              {isFlipping ? (
                <>
                  <article className="book-page-side left-page next-spread">
                    <BookPageContent
                      onMediaClick={setLightboxItem}
                      page={visibleSpread.left}
                      pageNumber={visiblePage}
                      text={text}
                      variant="left-content"
                    />
                    <span>{visiblePage}</span>
                  </article>
                  <article className="book-page-side right-page next-spread">
                    <BookPageContent
                      onMediaClick={setLightboxItem}
                      page={visibleSpread.right}
                      pageNumber={visiblePage + 1}
                      text={text}
                      variant="right-content"
                    />
                    <span>{visibleSpread.right ? visiblePage + 1 : totalPages}</span>
                  </article>
                </>
              ) : null}
              {isFlipping ? (
                <article
                  className={`turning-page ${
                    flipDirection === 1 ? 'turning-next' : 'turning-previous'
                  }`}
                >
                    <BookPageContent
                    onMediaClick={setLightboxItem}
                    page={flipDirection === 1 ? spread.right : spread.left}
                    pageNumber={flipDirection === 1 ? currentPage + 1 : currentPage}
                    text={text}
                    variant="turning-content"
                  />
                </article>
              ) : null}
            </>
          )}
        </div>

        <button
          className="page-button"
          disabled={!isCoverOpen && coverSide === 'back'}
          onClick={() => turnPage(1)}
          type="button"
        >
          {text.next}
        </button>
      </section>

      <footer className="book-footer">
        <span>
          {isCoverOpen
            ? `${text.page} ${currentPage}-${Math.min(currentPage + 1, totalPages)} / ${totalPages}`
            : coverSide === 'front'
              ? text.empty
              : text.backCover}
        </span>
        <span>{text.hint}</span>
      </footer>

      {lightboxItem && (
        <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
      )}
    </main>
  )
}

export default BookPage
