import mongoose from "mongoose"

const contatoSchema = new mongoose.Schema({
    name: { type: String },
    tel: { type: String, required: true },
    cpfCnpj: { type: String },
    address: { type: String },
    date: { type: Date, default: Date.now }
})

const contato = mongoose.model("contatos", contatoSchema)

export default contato