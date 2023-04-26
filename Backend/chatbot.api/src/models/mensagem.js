import mongoose from "mongoose";

const mensagemSchema = new mongoose.Schema(
    {
        id: { type: String },
        titulo: { type: String, required: true},
        autor: {type: String, required: true},
        text: {type: String}
    }
)

const mensagem = mongoose.model("mensagem", mensagemSchema)

export default mensagem