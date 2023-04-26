import mongoose from "mongoose";

const mensagemSchema = new mongoose.Schema(
    {
        name: {type: String},
        from: {type: String},
        to: { type: String},
        text: {type: String}
    }
)

const mensagem = mongoose.model("mensagem", mensagemSchema)

export default mensagem