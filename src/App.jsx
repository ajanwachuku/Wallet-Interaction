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
      <WalletCard />
    </div>
  )
}

export default App
