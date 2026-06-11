export default function Button({onClick}) {
  return (
    <button 
      onClick={onClick}
      style={{
        padding:'14px 28px', 
        fontSize:'18px',
        background:'white',
        color:'black',
        border:'none',
        borderRadius:'12px',
        cursor:'pointer',
        fontWeight:'bold'
      }}
    >
      Roll Dice
    </button>
  )
}
