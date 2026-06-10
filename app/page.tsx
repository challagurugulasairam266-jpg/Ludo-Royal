import Dice from './dice'
import Button from './button'

export default function Home() {
  return (
    <main style={{
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      background: '#1a1a2e', 
      color: 'white',
      gap: '30px'
    }}>
      <div style={{fontSize: '24px', fontWeight: 'bold'}}>🎲 Ludo Royal</div>
      <Dice />
      <Button />
    </main>
  )
}
