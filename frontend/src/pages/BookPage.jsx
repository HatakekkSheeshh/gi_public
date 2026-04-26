import { useEffect, useMemo, useRef, useState } from 'react'
import { getSession } from '../auth'
import translations from '../translations.json'

const youtubeTracks = [
  {
    id: 'exit-sign',
    startSeconds: 24,
    title: 'Exit Sign',
    videoId: 'sJt_i0hOugA',
  },
]

const MUSIC_PLAYER_POSITION_KEY = 'gi:bookMusicPosition'
const WISH_TYPE_SPEED_MS = 72
const FALLBACK_DISPLAY_NAMES = {
  bach: 'B\u00e1ch',
  han: 'H\u00e2n',
  hieu: 'Hi\u1ec7u',
  huy: 'Huy',
  khang: 'Khang',
  minh: 'Minh',
  ngan: 'Ng\u00e2n',
  nguyen: 'Nguy\u00ean',
  nhi: 'Nhi',
  phuc_anh: 'Ph\u00fac Anh',
  quan: 'Qu\u00e2n',
  quynh_anh: 'Qu\u1ef3nh Anh',
  thu: 'Th\u01b0',
}
let youtubeApiPromise = null

function loadYoutubeApi() {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT)
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve, reject) => {
      const previousCallback = window.onYouTubeIframeAPIReady

      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.()
        resolve(window.YT)
      }

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement('script')
        script.src = 'https://www.youtube.com/iframe_api'
        script.onerror = () => {
          reject(new Error('YouTube API failed to load'))
        }
        document.head.appendChild(script)
      }
    })
  }

  return youtubeApiPromise.catch((error) => {
    youtubeApiPromise = null
    throw error
  })
}

function extractYoutubeVideoId(value) {
  const input = value.trim()

  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input
  }

  try {
    const url = new URL(input)
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] ?? null
    }

    if (host.endsWith('youtube.com')) {
      const watchId = url.searchParams.get('v')

      if (watchId) {
        return watchId
      }

      const parts = url.pathname.split('/').filter(Boolean)
      const markerIndex = parts.findIndex((part) => ['embed', 'live', 'shorts'].includes(part))

      return markerIndex >= 0 ? parts[markerIndex + 1] ?? null : null
    }
  } catch {
    const match = input.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/)

    return match?.[1] ?? null
  }

  return null
}

function getYoutubeErrorMessage(code) {
  if (code === 2) {
    return 'Invalid YouTube video ID'
  }

  if (code === 5) {
    return 'This video cannot play in the embedded player'
  }

  if (code === 100) {
    return 'This video was not found or is private'
  }

  if (code === 101 || code === 150) {
    return 'This video does not allow embedding'
  }

  return 'YouTube could not play this video'
}

function getBookDisplayName() {
  const session = getSession()

  if (session.displayName) {
    return session.displayName
  }

  const tokenPayload = session.token?.split('.')[0]

  if (!tokenPayload) {
    return null
  }

  try {
    const normalizedPayload = tokenPayload.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(window.atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=')))

    return payload.displayName ?? FALLBACK_DISPLAY_NAMES[payload.username] ?? payload.username ?? null
  } catch {
    return null
  }
}

const classMedia = [
  { src: '/images/class_1.jpg', type: 'image' },
  { src: '/images/class_2.jpg', type: 'image' },
  { src: '/images/class_3.jpg', type: 'image' },
  { src: '/images/class_4.jpg', type: 'image' },
  { src: '/images/class_5.jpg', type: 'image' },
  { src: '/images/class_6.JPG', type: 'image' },
  { src: '/images/class_7.JPG', type: 'image' },
  { src: '/images/class_8.JPG', type: 'image' },
  { objectPosition: 'center top', src: '/images/frau_linh_lam.jpg', type: 'image' },
]

const nguyenMedia = [
  { src: '/images/nguyen_1.jpg', type: 'image' },
  { objectPosition: 'center top', src: '/images/nguyen_2.jpg', type: 'image' },
  { src: '/images/nguyen_3.jpg', type: 'image' },
  { objectPosition: 'center top', src: '/images/nguyen_4.jpg', type: 'image' },
  { src: '/images/nguyen_5.jpg', type: 'image' },
  { objectPosition: 'center top', src: '/images/nguyen_6.jpg', type: 'image' },
  { objectPosition: 'center top', src: '/images/nguyen_7.jpg', type: 'image' },
  { src: '/images/troll.png', type: 'image' },
  { src: '/images/nguyen_8.mp4', type: 'video' },
  { src: '/images/nguyen_9.mp4', type: 'video' },
]

const personSections = [
  {
    media: [{ objectPosition: 'center top', src: '/images/quan.jpg', type: 'image' }],
    section: 'quan',
    title: 'Qu\u00e2n',
  },
  {
    media: [{ objectPosition: 'center top', src: '/images/panh.JPG', type: 'image' }],
    section: 'panh',
    title: 'Ph\u00fac Anh',
  },
  {
    media: [{ objectPosition: 'center top', src: '/images/quyanh.jpg', type: 'image' }],
    section: 'quyanh',
    title: 'Qu\u1ef3nh Anh',
  },
  {
    media: [{ objectPosition: 'center top', src: '/images/khang.JPG', type: 'image' }],
    section: 'khang',
    title: 'Khang',
  },
  {
    media: [{ objectPosition: 'center top', src: '/images/huy.JPG', type: 'image' }],
    section: 'huy',
    title: 'Huy',
  },
  {
    media: [{ objectPosition: 'center top', src: '/images/backi.JPG', type: 'image' }],
    section: 'backi',
    title: 'B\u00e1ch',
  },
  {
    media: [{ objectPosition: 'center top', src: '/images/minh.JPG', type: 'image' }],
    section: 'minh',
    title: 'Minh',
  },
  {
    media: [{ display: 'contain', objectPosition: 'center', src: '/images/trio.jpg', type: 'image' }],
    section: 'trio',
    title: 'Trio',
  },
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

const bookSections = [
  {
    media: classMedia,
    section: 'class',
    titleKey: 'contentsClass',
  },
  {
    media: nguyenMedia,
    section: 'nguyen',
    titleKey: 'contentsNguyen',
  },
  ...personSections,
]

function createBookPages(sections) {
  return [
    {
      type: 'contents',
    },
    ...sections.flatMap((section) => [
      {
        section: section.section,
        title: section.title,
        titleKey: section.titleKey,
        type: 'section',
      },
      ...createMediaPages(section.media, section.section),
    ]),
  ]
}

function createContentsEntries(sections) {
  let pageNumber = 2

  return sections.map((section) => {
    const entry = {
      pageNumber,
      section: section.section,
      title: section.title,
      titleKey: section.titleKey,
    }

    pageNumber += 1 + Math.ceil(section.media.length / 2)

    return entry
  })
}

const bookPages = createBookPages(bookSections)
const contentsEntries = createContentsEntries(bookSections)
const coverImage = '/images/auf_geht.jpg'
const backCoverImage = '/images/auf_geht_1.jpg'
const flipDuration = 980

function BookContents({ text }) {
  return (
    <div className="book-contents">
      <h2>{text.contentsTitle}</h2>
      {contentsEntries.map((entry) => (
        <div className="toc-row" key={entry.section}>
          <span>{entry.title ?? text[entry.titleKey]}</span>
          <span className="toc-dots" />
          <span>{entry.pageNumber}</span>
        </div>
      ))}
    </div>
  )
}

function BookSectionTitle({ page, text }) {
  return (
    <div className="book-section-title">
      <h2>{page.title ?? text[page.titleKey]}</h2>
    </div>
  )
}

function Lightbox({ item, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isImageDragging, setIsImageDragging] = useState(false);
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
              setIsImageDragging(true);
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
              setIsImageDragging(false);
              e.target.releasePointerCapture(e.pointerId);
            }
          }}
          onPointerCancel={(e) => {
            if (isDragging.current) {
              isDragging.current = false;
              setIsImageDragging(false);
              e.target.releasePointerCapture(e.pointerId);
            }
          }}
          style={{
            transform: `scale(${zoom}) translate(${position.x/zoom}px, ${position.y/zoom}px)`,
            transition: isImageDragging ? 'none' : 'transform 0.2s',
            cursor: zoom > 1 ? (isImageDragging ? 'grabbing' : 'grab') : 'default'
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
      className={item.display === 'contain' ? 'book-media-contain' : undefined}
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

function YoutubeMusicPlayer() {
  const playerElementRef = useRef(null)
  const musicPlayerRef = useRef(null)
  const playerRef = useRef(null)
  const isReadyRef = useRef(false)
  const pendingPlayRef = useRef(false)
  const selectedTrackRef = useRef(youtubeTracks[0])
  const musicDragRef = useRef({
    isDragging: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 24,
    originY: 24,
  })
  const [customTrack, setCustomTrack] = useState(null)
  const [selectedTrackId, setSelectedTrackId] = useState(youtubeTracks[0].id)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isPlayerRequested, setIsPlayerRequested] = useState(false)
  const [playerMountKey, setPlayerMountKey] = useState(0)
  const [isDraggingMusic, setIsDraggingMusic] = useState(false)
  const [musicQuery, setMusicQuery] = useState('')
  const [musicMessage, setMusicMessage] = useState('')
  const [youtubeFallbackUrl, setYoutubeFallbackUrl] = useState(
    `https://www.youtube.com/watch?v=${youtubeTracks[0].videoId}`,
  )
  const [musicPosition, setMusicPosition] = useState(() => {
    try {
      const savedPosition = JSON.parse(
        window.localStorage.getItem(MUSIC_PLAYER_POSITION_KEY) ?? 'null',
      )

      if (typeof savedPosition?.x === 'number' && typeof savedPosition?.y === 'number') {
        return savedPosition
      }
    } catch {
      // Keep the default position when saved data is invalid.
    }

    return { x: 24, y: 24 }
  })
  const availableTracks = customTrack ? [...youtubeTracks, customTrack] : youtubeTracks
  const selectedTrack = availableTracks.find((track) => track.id === selectedTrackId) ?? youtubeTracks[0]

  useEffect(() => {
    isReadyRef.current = isReady
  }, [isReady])

  useEffect(() => {
    if (!isPlayerRequested) {
      return undefined
    }

    let isMounted = true
    let readyTimer = null

    if (playerRef.current) {
      return undefined
    }

    setMusicMessage('Loading YouTube player...')
    readyTimer = window.setTimeout(() => {
      if (!isMounted || isReadyRef.current) {
        return
      }

      pendingPlayRef.current = false
      playerRef.current?.destroy()
      playerRef.current = null
      setIsPlayerRequested(false)
      setMusicMessage('YouTube player was blocked. Try turning off adblock for this page.')
    }, 8000)

    loadYoutubeApi()
      .then((YT) => {
        if (!isMounted || !playerElementRef.current) {
          return
        }

        playerRef.current = new YT.Player(playerElementRef.current, {
          height: '200',
          host: 'https://www.youtube-nocookie.com',
          playerVars: {
            controls: 1,
            origin: window.location.origin,
            playsinline: 1,
            rel: 0,
            start: selectedTrackRef.current.startSeconds,
          },
          videoId: selectedTrackRef.current.videoId,
          width: '200',
          events: {
            onReady: () => {
              window.clearTimeout(readyTimer)
              setIsReady(true)
              setYoutubeFallbackUrl(`https://www.youtube.com/watch?v=${selectedTrackRef.current.videoId}`)

              if (pendingPlayRef.current) {
                pendingPlayRef.current = false
                setMusicMessage('Loading YouTube video...')
                playerRef.current?.loadVideoById({
                  startSeconds: selectedTrackRef.current.startSeconds,
                  videoId: selectedTrackRef.current.videoId,
                })
                window.setTimeout(() => {
                  const playerState = playerRef.current?.getPlayerState()

                  if (playerState !== 1 && playerState !== 3) {
                    setMusicMessage('If nothing plays, adblock or the video embed setting may be blocking it')
                  }
                }, 1800)
                return
              }

              setMusicMessage('Ready')
              playerRef.current?.cueVideoById({
                startSeconds: selectedTrackRef.current.startSeconds,
                videoId: selectedTrackRef.current.videoId,
              })
            },
            onError: (event) => {
              pendingPlayRef.current = false
              setIsPlaying(false)
              setYoutubeFallbackUrl(`https://www.youtube.com/watch?v=${selectedTrackRef.current.videoId}`)
              setMusicMessage(getYoutubeErrorMessage(event.data))
            },
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) {
                setIsPlaying(true)
                setMusicMessage('')
              }

              if (
                event.data === YT.PlayerState.PAUSED ||
                event.data === YT.PlayerState.ENDED ||
                event.data === YT.PlayerState.CUED
              ) {
                setIsPlaying(false)
              }
            },
          },
        })
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        window.clearTimeout(readyTimer)
        pendingPlayRef.current = false
        setIsPlayerRequested(false)
        setMusicMessage('YouTube API was blocked. Try turning off adblock for this page.')
      })

    return () => {
      isMounted = false
      window.clearTimeout(readyTimer)
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [isPlayerRequested, playerMountKey])

  useEffect(() => {
    window.localStorage.setItem(MUSIC_PLAYER_POSITION_KEY, JSON.stringify(musicPosition))
  }, [musicPosition])

  function clampMusicPosition(position) {
    const player = musicPlayerRef.current
    const width = player?.offsetWidth ?? 224
    const height = player?.offsetHeight ?? 320
    const padding = 8

    return {
      x: Math.min(Math.max(position.x, padding), Math.max(window.innerWidth - width - padding, padding)),
      y: Math.min(Math.max(position.y, padding), Math.max(window.innerHeight - height - padding, padding)),
    }
  }

  function handleMusicPointerDown(event) {
    const interactiveElement = event.target.closest('button, input, select, iframe')

    if (interactiveElement) {
      return
    }

    event.preventDefault()

    musicDragRef.current = {
      isDragging: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: musicPosition.x,
      originY: musicPosition.y,
    }

    setIsDraggingMusic(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleMusicPointerMove(event) {
    const drag = musicDragRef.current

    if (!drag.isDragging || drag.pointerId !== event.pointerId) {
      return
    }

    setMusicPosition(
      clampMusicPosition({
        x: drag.originX + event.clientX - drag.startX,
        y: drag.originY + event.clientY - drag.startY,
      }),
    )
  }

  function handleMusicPointerUp(event) {
    const drag = musicDragRef.current

    if (!drag.isDragging || drag.pointerId !== event.pointerId) {
      return
    }

    musicDragRef.current = {
      ...drag,
      isDragging: false,
      pointerId: null,
    }
    setIsDraggingMusic(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function rebuildPlayer(track, shouldPlay) {
    pendingPlayRef.current = shouldPlay
    playerRef.current?.destroy()
    playerRef.current = null
    isReadyRef.current = false
    setIsReady(false)
    setIsPlaying(false)
    setIsPlayerRequested(true)
    setMusicMessage(shouldPlay ? 'Loading YouTube video...' : 'Selected. Press play to start')
    setPlayerMountKey((currentKey) => currentKey + 1)
    setYoutubeFallbackUrl(`https://www.youtube.com/watch?v=${track.videoId}`)
  }

  function loadTrack(track, shouldPlay) {
    setYoutubeFallbackUrl(`https://www.youtube.com/watch?v=${track.videoId}`)

    if (!playerRef.current || !isReady) {
      rebuildPlayer(track, shouldPlay)
      return
    }

    if (shouldPlay) {
      rebuildPlayer(track, true)
    } else {
      playerRef.current.cueVideoById({
        startSeconds: track.startSeconds,
        videoId: track.videoId,
      })
      setIsPlaying(false)
    }
  }

  function handleTrackChange(event) {
    const nextTrack = availableTracks.find((track) => track.id === event.target.value) ?? youtubeTracks[0]
    const wasPlaying = isPlaying

    selectedTrackRef.current = nextTrack
    setSelectedTrackId(nextTrack.id)
    setMusicMessage('')
    loadTrack(nextTrack, wasPlaying)
  }

  function handleMusicSearch(event) {
    event.preventDefault()

    const query = musicQuery.trim()

    if (!query) {
      return
    }

    const videoId = extractYoutubeVideoId(query)

    if (!videoId) {
      window.open(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        '_blank',
        'noopener,noreferrer',
      )
      setMusicMessage('Opened YouTube search')
      return
    }

    const nextTrack = {
      id: `custom-${videoId}`,
      startSeconds: 0,
      title: 'Custom YouTube video',
      videoId,
    }

    setCustomTrack(nextTrack)
    selectedTrackRef.current = nextTrack
    setSelectedTrackId(nextTrack.id)
    setMusicQuery('')
    setYoutubeFallbackUrl(`https://www.youtube.com/watch?v=${nextTrack.videoId}`)
    setMusicMessage('Loading YouTube video...')
    loadTrack(nextTrack, true)
  }

  function toggleMusic() {
    if (!playerRef.current || !isReady) {
      rebuildPlayer(selectedTrackRef.current, true)
      return
    }

    if (isPlaying) {
      playerRef.current.pauseVideo()
      setIsPlaying(false)
      return
    }

    playerRef.current.playVideo()
  }

  return (
    <aside
      aria-label="YouTube music player"
      className={`book-music-player ${isDraggingMusic ? 'is-dragging' : ''}`}
      onPointerCancel={handleMusicPointerUp}
      onPointerDown={handleMusicPointerDown}
      onPointerMove={handleMusicPointerMove}
      onPointerUp={handleMusicPointerUp}
      ref={musicPlayerRef}
      style={{
        '--music-x': `${musicPosition.x}px`,
        '--music-y': `${musicPosition.y}px`,
      }}
    >
      <div className="book-music-controls">
        <button
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
          className={isPlaying ? 'playing' : ''}
          disabled={isPlayerRequested && !isReady}
          onClick={toggleMusic}
          type="button"
        >
          <span>{isPlaying ? 'II' : '♪'}</span>
        </button>
        <label className="book-music-select-wrap" htmlFor="book-music-select">
          <span>Music</span>
          <select id="book-music-select" onChange={handleTrackChange} value={selectedTrack.id}>
            {availableTracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <form className="book-music-search" onSubmit={handleMusicSearch}>
        <input
          aria-label="YouTube URL, video ID, or search keywords"
          onChange={(event) => setMusicQuery(event.target.value)}
          placeholder="YouTube URL, ID, or keywords"
          type="search"
          value={musicQuery}
        />
        <button type="submit">Go</button>
      </form>
      <a
        className="book-youtube-link"
        href={youtubeFallbackUrl}
        rel="noreferrer"
        target="_blank"
      >
        Open on YouTube
      </a>
      {musicMessage ? <p className="book-music-message">{musicMessage}</p> : null}
      <div className="book-youtube-frame">
        {isPlayerRequested ? (
          <div className="book-youtube-mount" key={playerMountKey} ref={playerElementRef} />
        ) : (
          <span>Press play to load YouTube</span>
        )}
      </div>
    </aside>
  )
}

function BookPage() {
  const [language, setLanguage] = useState('en')
  const [displayName] = useState(getBookDisplayName)
  const [typedWishText, setTypedWishText] = useState('')
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
  const wishText = useMemo(
    () =>
      displayName
        ? `Ich w\u00fcnsche dir, ${displayName}, dass du deine Ziele erreichst. Wir sehen uns in Deutschland wieder. Tsch\u00fcssiee!`
        : '',
    [displayName],
  )
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

  useEffect(() => {
    if (!wishText) {
      return undefined
    }

    let nextLength = 0
    const timer = window.setInterval(() => {
      nextLength += 1
      setTypedWishText(wishText.slice(0, nextLength))

      if (nextLength >= wishText.length) {
        window.clearInterval(timer)
      }
    }, WISH_TYPE_SPEED_MS)

    return () => window.clearInterval(timer)
  }, [wishText])

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

      {displayName ? (
        <div className="book-wish-banner" aria-label="German wish">
          <p className="book-wish" aria-label={wishText}>
            <span>{typedWishText}</span>
            <span className="book-wish-caret" aria-hidden="true" />
          </p>
        </div>
      ) : null}

      <YoutubeMusicPlayer />

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
