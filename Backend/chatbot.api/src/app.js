import express from "express"
import { Server } from "socket.io";
import http from 'http'
import bodyParser from "body-parser"
import cors from 'cors'
import routes from "./routes/routes.js"
import db from "./config/dbConfig.js"

db.on("error", console.log.bind(console, 'Erro de conexao'))
db.once("open", () => {
    console.log("conexao com o banco feita com sucesso")
})

const app = express();  //instância do express
app.use(bodyParser.json()) //interpretação em json
app.use(cors())
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

  socket.on('chat.mensagem', (data) => {
    console.log(data)
    socket.emit('chat.mensagem', data)
  })

  socket.on("disconnect", () => {
    console.log("desconectado")
  })
});

export default server