import express from "express"
import { Server } from "socket.io";
import http from 'http'
import bodyParser from "body-parser"
import cors from 'cors'
import routes from "./routes/routes.js"
import db from "./config/dbConfig.js"
import dbSql from "./config/dbSqlConfig.js"
import dotenv from 'dotenv'
dotenv.config()

db.on("error", console.log.bind(console, 'Erro de conexao')) //teste de conexao com o mongoDb
db.once("open", () => {
    console.log("Conexao MongoDb bem-sucedida")
})

try {
  dbSql.connect((error) => { //teste de conexao com o mySql
    if (error) {
        console.error('Erro ao conectar: ' + error.stack);
        return;
    }
    console.log('Conexão dbSql bem-sucedida!');
  });
} catch (error) {
  console.log(error)
}


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