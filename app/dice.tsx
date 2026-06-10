'use client'
import { useState } from 'react'

export default function Dice() {
  const [num, setNum] = useState(1)
  return (
    <div 
      onClick={() => setNum(Math.floor(Math.random()*6)+1)}
      style={{
        fontSize:'100px', 
        cursor:'pointer', 
        userSelect:'none',
        padding: '40px',
        border: '5px solid white',
        borderRadius: '20px',
        background: 'white',
        color: 'black'
      }}
    >
      {num}
    </div>
  )
}
