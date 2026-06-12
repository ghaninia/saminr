import { useEffect, useState, useRef } from 'react'
import './ScrollToTop.css'

const FULL_DASH = 307.919

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  const [offset, setOffset] = useState(FULL_DASH)
  const pathRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight

      const progress = docHeight > 0 ? scrollTop / docHeight : 0
      setOffset(FULL_DASH - progress * FULL_DASH)
      setVisible(scrollTop > 80)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      className={`progress-wrap cursor-pointer${visible ? ' active-progress' : ''}`}
      onClick={handleClick}
      role="button"
      aria-label="Scroll to top"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Arrow icon */}
      <svg
        className="progress-arrow"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Progress circle */}
      <svg
        className="progress-circle svg-content"
        width="100%"
        height="100%"
        viewBox="-1 -1 102 102"
      >
        <path
          ref={pathRef}
          d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
          style={{
            transition: 'stroke-dashoffset 10ms linear',
            strokeDasharray: `${FULL_DASH}, ${FULL_DASH}`,
            strokeDashoffset: offset,
          }}
        />
      </svg>
    </div>
  )
}
