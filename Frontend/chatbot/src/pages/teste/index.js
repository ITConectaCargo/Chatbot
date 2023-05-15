import { useEffect, useState } from 'react'
import  io  from "socket.io-client";
const socket = io("http://localhost:9000/")

export default function Teste() {
  const [mensagem, setMensagem] = useState('')
  const [mensagens, setMensagens] = useState([])

  socket.on('connect', () => {
    console.log('conectado')
  })

  useEffect(() => {
    socket.on('chat.mensagem', (dados) => {
      console.log(dados)
      setMensagens([...mensagens, dados])
    })
  })

  const enviaMensagem = () => {
    socket.emit("chat.mensagem", {mensagem})
  }

  const aoSubmeter = (e) => {
    e.preventDefault()
    enviaMensagem()
    setMensagem('')
  }

  return (
    <>
      <h1>Mensagens</h1>
      {mensagens.map((msg) =>{
        return <p key={msg.mensagem}>{msg.mensagem}</p>
      })}
      
      <form onSubmit={aoSubmeter}>
        <input type='text' placeholder='mensagem' value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
        <button type='submit' >enviar</button>
      </form>
    </>
  )
}
