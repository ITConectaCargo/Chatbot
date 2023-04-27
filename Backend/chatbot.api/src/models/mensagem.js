import mongoose from "mongoose";

const mensagemSchema = new mongoose.Schema(
    {
        name: {type: String},
        from: {type: String, required: true},
        timestamp: {type: String},
        text: {type: String, required: true},
        date: {type: Date, default: Date.now}
    }
)

const mensagem = mongoose.model("mensagem", mensagemSchema)

export default mensagem