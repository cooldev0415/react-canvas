import CanvasAnimation from './components/CanvasAnimation'
import LanguageCanvasAnimation from './components/LanguageCanvasAnimation'
import { Logo } from './components/Logo'
// import { DockMenu } from './components/dock-menu'

function App() {
  return (
    <div className='app-container'>
      <Logo />
      <CanvasAnimation />
      <LanguageCanvasAnimation />
      {/* <DockMenu /> */}
    </div>
  )
}

export default App
