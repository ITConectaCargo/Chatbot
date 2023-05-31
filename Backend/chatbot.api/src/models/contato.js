import mongoose from "mongoose"

const contatoSchema = new mongoose.Schema({
    name: { type: String },
    nameWhatsapp: { type: String },
    tel: { type: String, required: true },
    cpfCnpj: { type: String },
    address: {
        street: {type: String},
        district: {type: String},
        city: {type: String},
        state: {type: String},
        cep: {type: String},
        complement: {type: String}
    },
    date: { type: Date, default: Date.now }
})

const contato = mongoose.model("contatos", contatoSchema)

export default contato