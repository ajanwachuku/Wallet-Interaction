import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import visaLogo from '../../assets/card/visa-logo.svg'
import chevronBottom from '../../assets/card/chevron-bottom.svg'
import flapShape from '../../assets/card/flap-shape.svg'
import leatherTexture from '../../assets/card/leather-texture.png'
import './WalletCard.css'

const COLLAPSED_HEIGHT = 255
const EXPANDED_HEIGHT = 331

// Normalize the card number into groups of 4 whether it's passed as an array
// (['1234','5678',...]) or a plain string ('1234 5678 9012 3456' / '1234567890123456').
function toGroups(number) {
  if (Array.isArray(number)) return number
  return String(number).replace(/\s+/g, '').match(/.{1,4}/g) ?? [String(number)]
}

/**
 * WalletCard — a tap-to-reveal wallet card interaction.
 *
 * All content is prop-driven and the look is themeable via CSS variables
 * (see WalletCard.css / README). Respects `prefers-reduced-motion` and lets
 * you turn the sound effects off.
 */
export default function WalletCard({
  cardholder = 'Jane Appleseed',
  balance = '481,296.80',
  number = ['1234', '5678', '9012', '3456'],
  cvv = '010',
  expiry = '01/27',
  tier = 'Platinum',
  sound = true,
  className,
  style,
  ...rest
}) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const groups = toGroups(number)

  const cardRef = useRef(null)
  const flipRef = useRef(null)
  const chevronRef = useRef(null)
  const labelViewRef = useRef(null)
  const labelHideRef = useRef(null)
  const detailLinesRef = useRef([])
  const timelineRef = useRef(null)
  const audioCtxRef = useRef(null)

  useLayoutEffect(() => {
    // Honour reduced-motion: same choreography, but instant.
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const d = (seconds) => (reduce ? 0 : seconds)

    const ctx = gsap.context(() => {
      gsap.set(detailLinesRef.current, { opacity: 0, y: 8 })
      gsap.set(labelHideRef.current, { opacity: 0 })

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } })

      tl.to(cardRef.current, { height: EXPANDED_HEIGHT, duration: d(0.8) }, 0)
        .to(flipRef.current, { rotateY: 180, duration: d(0.9) }, 0)
        .to(chevronRef.current, { rotate: 180, duration: d(0.5) }, 0)
        .to(labelViewRef.current, { opacity: 0, duration: d(0.2) }, 0)
        .to(labelHideRef.current, { opacity: 1, duration: d(0.3) }, d(0.25))
        .to(
          detailLinesRef.current,
          { opacity: 1, y: 0, duration: d(0.4), stagger: d(0.06), ease: 'power2.out' },
          d(0.5),
        )

      timelineRef.current = tl
    }, cardRef)

    return () => ctx.revert()
  }, [])

  const playWhoosh = (opening) => {
    if (!sound) return
    try {
      let ctx = audioCtxRef.current
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)()
        audioCtxRef.current = ctx
      }
      if (ctx.state === 'suspended') ctx.resume()

      const now = ctx.currentTime
      const duration = 0.5

      // short burst of white noise shaped into an airy whoosh
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.Q.value = 0.8
      // sweep up when opening, down when closing, to track the flip
      filter.frequency.setValueAtTime(opening ? 500 : 1500, now)
      filter.frequency.exponentialRampToValueAtTime(opening ? 1600 : 450, now + duration)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.03, now + 0.12)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      noise.connect(filter).connect(gain).connect(ctx.destination)
      noise.start(now)
      noise.stop(now + duration)
    } catch {
      /* audio unavailable, flip silently */
    }
  }

  const toggleExpanded = () => {
    const tl = timelineRef.current
    if (!tl) return
    setExpanded((prev) => {
      const next = !prev
      if (next) {
        playWhoosh(true)
        tl.play()
      } else {
        tl.reverse()
        // the reversed flip eases in slowly, so hold the whoosh until it takes off
        window.setTimeout(() => playWhoosh(false), 150)
      }
      return next
    })
  }

  const playChing = () => {
    if (!sound) return
    try {
      let ctx = audioCtxRef.current
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)()
        audioCtxRef.current = ctx
      }
      if (ctx.state === 'suspended') ctx.resume()

      const now = ctx.currentTime
      // two quick ascending bell-like notes for a bright "ching"
      const freqs = [1046.5, 1568.0] // C6 -> G6
      freqs.forEach((freq, i) => {
        const start = now + i * 0.07
        const osc = ctx.createOscillator()
        osc.type = 'triangle'
        osc.frequency.value = freq

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.exponentialRampToValueAtTime(0.05, start + 0.008)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35)

        osc.connect(gain).connect(ctx.destination)
        osc.start(start)
        osc.stop(start + 0.4)
      })
    } catch {
      /* audio unavailable, copy silently */
    }
  }

  const handleCopy = async (event) => {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(groups.join(''))
    } catch {
      /* clipboard unavailable, still show feedback */
    }
    setCopied(true)
    playChing()
    gsap.fromTo(
      event.currentTarget,
      { scale: 1 },
      { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' },
    )
    window.clearTimeout(handleCopy._t)
    handleCopy._t = window.setTimeout(() => setCopied(false), 1400)
  }

  const [dollars, cents] = String(balance).split('.')

  return (
    <div
      className={`wallet-card${className ? ` ${className}` : ''}`}
      ref={cardRef}
      style={{ height: COLLAPSED_HEIGHT, ...style }}
      {...rest}
    >
      <div className="wallet-card__border" />

      <div className="wallet-card__face">
        <div className="wallet-card__flip" ref={flipRef}>
          <div className="wallet-card__face-front">
            <img className="wallet-card__visa" src={visaLogo} alt="Visa" />
            <p className="wallet-card__tier">{tier}</p>
          </div>

          <div className="wallet-card__face-back">
            <div
              className="wallet-card__back-leather"
              style={{ backgroundImage: `url(${leatherTexture})` }}
            />

            <div className="wallet-card__back-content">
              <div className="wallet-card__row" ref={(el) => (detailLinesRef.current[0] = el)}>
                <p className="wallet-card__label">Cardholder Name</p>
                <p className="wallet-card__value">{cardholder}</p>
              </div>

              <div className="wallet-card__row" ref={(el) => (detailLinesRef.current[1] = el)}>
                <p className="wallet-card__label">Card Number</p>
                <div className="wallet-card__number-row">
                  <div className="wallet-card__number">
                    {groups.map((group, i) => (
                      <span key={i}>{group}</span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={`wallet-card__copy${copied ? ' is-copied' : ''}`}
                    onClick={handleCopy}
                    aria-label="Copy card number"
                  >
                    <svg
                      className="wallet-card__copy-glyph"
                      viewBox="0 0 12.8668 12.8668"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        className="wallet-card__copy-mark"
                        d="M8.04172 4.82503V2.27849C8.04172 1.90838 7.74169 1.60834 7.37158 1.60834H2.27849C1.90838 1.60834 1.60834 1.90838 1.60834 2.27849V7.37158C1.60834 7.74169 1.90838 8.04172 2.27849 8.04172H4.82503M5.49517 4.82503H10.5883C10.9584 4.82503 11.2584 5.12506 11.2584 5.49517V10.5883C11.2584 10.9584 10.9584 11.2584 10.5883 11.2584H5.49517C5.12506 11.2584 4.82503 10.9584 4.82503 10.5883V5.49517C4.82503 5.12506 5.12506 4.82503 5.49517 4.82503Z"
                        stroke="white"
                        strokeWidth="1.49893"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        className="wallet-card__check-mark"
                        d="M3.35 6.9L5.5 9.05L9.55 4.2"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="wallet-card__meta-row" ref={(el) => (detailLinesRef.current[2] = el)}>
                <div>
                  <p className="wallet-card__label">CVV/CVC</p>
                  <p className="wallet-card__value">{cvv}</p>
                </div>
                <div>
                  <p className="wallet-card__label">Expiry Date</p>
                  <p className="wallet-card__value">{expiry}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wallet-card__lip">
        <img className="wallet-card__lip-shape" src={flapShape} alt="" />
        <div
          className="wallet-card__leather"
          style={{ backgroundImage: `url(${leatherTexture})` }}
        />
        <div className="wallet-card__stitch" />

        <div className="wallet-card__bottom">
          <div className="wallet-card__balance">
            <p className="wallet-card__balance-label">Card Balance</p>
            <p className="wallet-card__balance-amount">
              ${dollars}
              {cents != null && <span>.{cents}</span>}
            </p>
          </div>

          <button
            type="button"
            className="wallet-card__toggle"
            onClick={toggleExpanded}
            aria-expanded={expanded}
          >
            <span className="wallet-card__toggle-label-stack">
              <span className="wallet-card__toggle-label" ref={labelViewRef}>
                View Details
              </span>
              <span className="wallet-card__toggle-label" ref={labelHideRef}>
                Hide Details
              </span>
            </span>
            <img className="wallet-card__chevron" ref={chevronRef} src={chevronBottom} alt="" />
          </button>
        </div>
      </div>
    </div>
  )
}
