import mongoose from "mongoose";

const mensagensSchema = new mongoose.Schema(
    {
        id: {type: String},
        imagem: {type: String, required: true},
        nome: {type: String, required: true},
        mensagem: {type: String, required: true},
        hora: {type: Date, default: Date.now}
    },
    {
        versionKey: false
    }
)

const mensagens = mongoose.model("mensagens", mensagensSchema)

export default mensagens;