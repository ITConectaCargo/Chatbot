import express from "express"
import { Server } from "socket.io";
import http from 'http'
import bodyParser from "body-parser"
import cors from 'cors'
import routes from "./routes/routes.js"
import db from "./config/dbConfig.js"
import dotenv from 'dotenv'
dotenv.config()

db.on("error", console.log.bind(console, 'Erro de conexao'))
db.once("open", () => {
    console.log("conexao com o banco feita com sucesso")
})

const app = express();  //instância do express
app.use(bodyParser.json()) //interpretação em json
app.use(cors()) //habilita o Cors para todas as conexoes
routes(app) //chamando a rota

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connect', (socket) => {
  console.log('usuario conectado', socket.id );

  socket.on('chat.sala', (sala) => {
    socket.join(sala)
    console.log(`usuario com o ID ${socket.id} entrou na sala ${sala}`)
  })

  socket.on('chat.mensagem', (mensagem) => {
    console.log(mensagem)
    socket.to(mensagem.room).emit('chat.mensagem', mensagem)
  })

  socket.on("disconnect", () => {
    console.log("desconectado")
  })
});

export default server