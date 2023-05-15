import { useEffect, useState } from 'react'
import axios from 'axios'
import io from "socket.io-client";
const socket = io.connect("http://192.168.1.183:9000/");

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

  const enviaMensagem = async () => {
    if (mensagem !== "") {
      let dadosMensagem = {
        from: {
          _id: '64621ca197584a92b5312ec7',
          name: 'Conecta Cargo',
          nameWhatsapp: 'Conecta Cargo',
          tel: '5511945718427',
          cpfCnpj: '12146737000104',
          address: 'Avenida Monteiro Lobato, 4550 Galpao02 Asa 06 CIDADE JARDIM CUMBICA GUARULHOS - SP 07180-000',
          date: '2023-05-09T18:07:09.168Z',
          __v: 0
        },
        to: "5511997397199",
        phoneId: '105378582538953',
        timestamp: new Date().getTime(),
        text: mensagem,
        __v: 0
      }

      try {
        const resposta = await axios.post(`http://localhost:9000/whatsapp/mensagem`, dadosMensagem)
        const dados = resposta.data
        console.log(dados)
        
        socket.emit('chat.sala', dadosMensagem.to)
        await socket.emit("chat.mensagem", dados);
        setMensagens((msg) => [...msg, dadosMensagem]);
        setMensagem('')
      } catch (error) {
        console.log(error)
      }
    }
  }

  const aoSubmeter = (e) => {
    e.preventDefault()
    enviaMensagem()
  }

  return (
    <>
      <h1>Mensagens</h1>

        {mensagens.map((msg) => {
          return <p key={msg._id}>{msg.text}</p>
        })}


      <form onSubmit={aoSubmeter}>
        <input type='text' placeholder='mensagem' value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
        <button type='submit' >enviar</button>
      </form>
    </>
  )
}
