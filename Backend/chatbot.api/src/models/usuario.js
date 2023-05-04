import mongoose from "mongoose"

const usuarioSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, select: false},
    department: {type: String},
    date: {type: Date, default: Date.now},
    isActive: {type: Boolean},
    dateDisable: {type: Date}
})

const usuario = mongoose.model("usuarios", usuarioSchema)

export default usuario