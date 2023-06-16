import mongoose from "mongoose";

const mensagemSchema = new mongoose.Schema(
    {
        protocol: {type: String},
        from: {type: mongoose.Schema.Types.ObjectId, ref: 'contatos', required: true},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario'},
        to: {type: String},
        room: {type: String},
        phoneId: {type: String, required: true},
        timestamp: {type: String},
        context: {type: String},
        template: {type: String},
        parameters: {type: Object},
        text: {type: String, required: true},
        date: {type: Date, default: Date.now}
    }
)

const mensagem = mongoose.model("mensagens", mensagemSchema)

export default mensagem