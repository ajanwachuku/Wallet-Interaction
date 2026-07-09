import WalletCard from './components/WalletCard/WalletCard'
import './App.css'

function App() {
  return (
    <div className="stage">
      <div className="stage__intro">
        <p className="stage__eyebrow">Wallet</p>
        <h1 className="stage__title">Tap to reveal your card</h1>
        <p className="stage__hint">
          Click "View Details" to expand the card and see its full number.
        </p>
      </div>
      <div className="stage__cards">
        {/* 1. Default card */}
        <WalletCard />

        {/* 2. The same component — customized via props + theme tokens, sound off */}
        <WalletCard
          cardholder="Ada Lovelace"
          balance="12,908.40"
          number="4000123412341234"
          cvv="204"
          expiry="08/29"
          tier="Signature"
          sound={false}
          style={{
            '--wc-face': 'linear-gradient(151deg, #8ec5ff 12%, #2b5cff 78%)',
            '--wc-surface': '#0e1116',
            '--wc-border': '#2a2f3a',
          }}
        />
      </div>
    </div>
  )
}

export default App
