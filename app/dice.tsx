'use client'
import { useState } from 'react'
import Button from './Button'

export default function Dice() {
  const [number, setNumber] = useState(1)
  
  function rollDice() {
    const random = Math.floor(Math.random() * 6) + 1
    setNumber(random)
  }

  return (
    <div style={{textAlign:'center', marginTop:'50px', color:'white'}}>
      {/* Dice dabba - idhi click cheste roll avthundi */}
      <div 
        onClick={rollDice}
        style={{
          width:'120px', 
          height:'120px', 
          background:'white', 
          margin:'30px auto', 
          fontSize:'70px',
          fontWeight:'bold',
          color:'black',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          borderRadius:'20px',
          cursor:'pointer',
          boxShadow:'0 8px 20px rgba(0,0,0,0.3)'
        }}
      >
        {number}
      </div>
      
      {/* Button - idhi click cheste roll avthundi. Okkate undi */}
      <Button onClick={rollDice} />
    </div>
  )
}
