import mongoose from "mongoose"

const embarcadorSchema = new mongoose.Schema({
    cpfCnpj: { type: String },
    name: { type: String },
    city: { type: String },
    state: { type: String },
})

const embarcador = mongoose.model("embarcadores", embarcadorSchema)

export default embarcador