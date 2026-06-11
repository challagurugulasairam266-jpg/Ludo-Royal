'use client'
import { useState } from 'react'
import Button from './button'

export default function Dice() {
  const [number, setNumber] = useState(1)
  
  function rollDice() {
    const random = Math.floor(Math.random() * 6) + 1
    setNumber(random)
  }

  return (
    <div style={{textAlign:'center', marginTop:'50px'}}>
      <h1>Ludo Royal</h1>
      <div 
        onClick={rollDice}
        style={{
          width:'100px', 
          height:'100px', 
          background:'white', 
          margin:'20px auto', 
          fontSize:'60px',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          borderRadius:'15px',
          cursor:'pointer',
          boxShadow:'0 4px 10px rgba(0,0,0,0.2)'
        }}
      >
        {number}
      </div>
      <div onClick={rollDice}>
        <Button />
      </div>
    </div>
  )
}
