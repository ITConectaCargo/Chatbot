import { useEffect, useState } from 'react'
import ScrollToBottom from "react-scroll-to-bottom";
import io from "socket.io-client";
const socket = io("http://192.168.1.183:9000/");

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

  const sala = () => {
    socket.emit('chat.sala', "1")
  }

  const enviaMensagem = async () => {
    if (mensagem !== "") {
      const messageData = {
        room: "1",
        message: mensagem,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("chat.mensagem", messageData);
      setMensagens((msg) => [...msg, messageData]);
      setMensagem('')
    }
  }

  const aoSubmeter = (e) => {
    e.preventDefault()
    sala()
    enviaMensagem()
  }

  return (
    <>
      <h1>Mensagens</h1>
      <ScrollToBottom>
        {mensagens.map((msg) => {
          return <p key={msg}>{msg.message}</p>
        })}
      </ScrollToBottom>

      <form onSubmit={aoSubmeter}>
        <input type='text' placeholder='mensagem' value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
        <button type='submit' >enviar</button>
      </form>
    </>
  )
}
