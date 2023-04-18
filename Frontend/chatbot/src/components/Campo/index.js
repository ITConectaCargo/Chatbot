import React from 'react'

export default function Campo({tipo, placeholder, children}) {
  return (
    <div>
        <label>{children}</label>
        <input type={tipo} placeholder={placeholder}></input>
    </div>
  )
}
