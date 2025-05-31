import CanvasAnimation from './components/CanvasAnimation'
import LanguageCanvasAnimation from './components/LanguageCanvasAnimation'
import { Logo } from './components/Logo'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Logo />
      <CanvasAnimation />
      <LanguageCanvasAnimation />
    </div>
  )
}

export default App
