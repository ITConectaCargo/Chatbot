import mongoose from "mongoose"

const autenticacaoSchema = new mongoose.Schema({
    token: {type: String, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'contatos', required: true},
    date: {type: Date, default: Date.now}
})

const autenticacao = mongoose.model("autenticacoes", autenticacaoSchema)

export default autenticacao