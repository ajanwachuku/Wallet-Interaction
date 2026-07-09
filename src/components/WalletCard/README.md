# WalletCard

A tap-to-reveal wallet card interaction: the gold card flips and the wallet
expands to show the cardholder details, with a copy-to-clipboard number and
optional sound. Built with React + [GSAP](https://gsap.com).

> Reference component for the reusable-interactions registry. Everything is
> prop-driven and themeable via CSS variables — copy this folder into a project
> and customize without editing the internals.

## Install

```bash
npm i gsap
```

Copy `WalletCard.jsx`, `WalletCard.css`, and the `assets/card/` folder into your
project (any bundler that imports `.svg` / `.png` — Vite, Next, etc.).

## Usage

```jsx
import WalletCard from './WalletCard'

// Defaults
<WalletCard />

// Customized content + theme, sound off
<WalletCard
  cardholder="Ada Lovelace"
  balance="12,908.40"
  number="4000123412341234"      // string or ['4000','1234',...]
  cvv="204"
  expiry="08/29"
  tier="Signature"
  sound={false}
  style={{
    '--wc-face': 'linear-gradient(151deg, #8ec5ff 12%, #2b5cff 78%)',
    '--wc-surface': '#0e1116',
  }}
/>
```

## Props

| Prop         | Type                 | Default                    | Description                                        |
| ------------ | -------------------- | -------------------------- | -------------------------------------------------- |
| `cardholder` | `string`             | `'Jane Appleseed'`         | Name shown on the back of the card.                |
| `balance`    | `string`             | `'481,296.80'`             | Balance as `dollars.cents`; cents are dimmed.      |
| `number`     | `string \| string[]` | `['1234','5678','9012','3456']` | Card number; a string is auto-grouped into 4s. |
| `cvv`        | `string`             | `'010'`                    | CVV/CVC value.                                     |
| `expiry`     | `string`             | `'01/27'`                  | Expiry date.                                       |
| `tier`       | `string`             | `'Platinum'`               | Tier label on the card face.                       |
| `sound`      | `boolean`            | `true`                     | WebAudio flip/copy sound effects.                  |
| `className`  | `string`             | —                          | Added to the root element.                         |
| `style`      | `object`             | —                          | Merged onto the root — set theme tokens here.      |

Any other props (`aria-*`, `data-*`, `id`, …) are spread onto the root element.

## Theme tokens (CSS variables)

Override inline via `style`, or in your CSS by targeting `.wallet-card`:

| Token             | Default                                        | Controls               |
| ----------------- | ---------------------------------------------- | ---------------------- |
| `--card-width`    | `412px`                                        | Card width             |
| `--wc-radius`     | `34px`                                         | Outer corner radius    |
| `--wc-surface`    | `#191919`                                      | Wallet body color      |
| `--wc-border`     | `#353535`                                      | Inner hairline border  |
| `--wc-face`       | `linear-gradient(151deg, #f1c564, #ad8130)`    | Card face (front/back) |
| `--wc-face-text`  | `#fff`                                          | Text on the card face  |
| `--wc-toggle-bg`  | `rgba(0, 0, 0, 0.6)`                            | View/Hide button       |

## Accessibility & behavior

- **Reduced motion:** when the user has `prefers-reduced-motion: reduce`, the
  reveal happens instantly (same result, no animation).
- **Sound:** off-by-prop with `sound={false}`; also fails silently if the
  browser blocks WebAudio.
- The toggle exposes `aria-expanded`; the copy button has an `aria-label`.

## Dependencies

- `react` (18 or 19)
- `gsap` `^3` — all GSAP plugins are free as of 3.13, so no license needed.

## License

MIT — use it, remix it, ship it.
