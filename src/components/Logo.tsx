import FunnyMouseFace from "./EyeComponent"

export const Logo = () => {
  return (
    <div className="logo">
      <div className="logo-container">
        <img
          src='/logo-icon.svg'
          alt='logo'
          className="logo-img"
        />
        <span className="logo-title">Projectassistant</span>
      </div>
      <FunnyMouseFace />
    </div>
  )
}