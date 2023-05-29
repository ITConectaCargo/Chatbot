import mongoose from "mongoose";

const mensagemSchema = new mongoose.Schema(
    {
        from: {type: mongoose.Schema.Types.ObjectId, ref: 'contatos', required: true},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario'},
        to: {type: String},
        room: {type: String},
        phoneId: {type: String, required: true},
        timestamp: {type: String},
        template: {type: String},
        text: {type: String, required: true},
        date: {type: Date, default: Date.now}
    }
)

const mensagem = mongoose.model("mensagens", mensagemSchema)

export default mensagem