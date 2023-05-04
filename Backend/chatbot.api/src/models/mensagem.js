import mongoose from "mongoose";

const mensagemSchema = new mongoose.Schema(
    {
        from: {type: mongoose.Schema.Types.ObjectId, ref: 'contato', required: true},
        phoneId: {type: String, required: true},
        timestamp: {type: String},
        text: {type: String, required: true},
        date: {type: Date, default: Date.now}
    }
)

const mensagem = mongoose.model("mensagens", mensagemSchema)

export default mensagem