import CircularGallery from './CircularGallery'

export const Work = () => {
  return (
    <div style={{ height: '600px', position: 'relative' }}>
      <CircularGallery bend={3} textColor="#ffffff" borderRadius={0.05} />
    </div>
  )
}
