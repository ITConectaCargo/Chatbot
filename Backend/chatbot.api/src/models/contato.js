import mongoose from "mongoose"

const contatoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameWhatsapp: { type: String, required: true },
    tel: { type: String, required: true },
    cpfCnpj: { type: String },
    address: {
        street: { type: String },
        district: { type: String },
        city: { type: String },
        state: { type: String },
        cep: { type: String },
        complement: { type: String },
        reference: { type: String }
    },
    date: { type: Date, default: Date.now }
})

const contato = mongoose.model("contatos", contatoSchema)

export default contato