import React, { useState } from 'react'
import { io } from "socket.io-client";

export default function Teste() {
  const socket = io("http://localhost:9000/")
  const [mensagem, setMensagem] = useState()
  //const [mensagens, setMensagens] = useState([])

  socket.on('connection', () => {
    console.log('conectado')
  })

  return (
    <>
      <h1>Mensagens</h1>
      <p>msg</p>
      <form>
        <input type='text' placeholder='mensagem' value={mensagem} onChange={(e) => setMensagem(e.target.value)}/>
        <button type='submit' >enviar</button>
      </form>

    </>
  )
}
