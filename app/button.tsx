export default function Button({onClick}) {
  return (
    <button 
      onClick={onClick}
      style={{
        padding:'12px 24px', 
        fontSize:'18px',
        background:'white',
        color:'black',
        border:'none',
        borderRadius:'10px',
        cursor:'pointer',
        fontWeight:'bold',
        marginTop:'20px'
      }}
    >
      Roll Dice
    </button>
  )
}
