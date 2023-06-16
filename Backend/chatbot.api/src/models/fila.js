import mongoose from "mongoose"

const filaSchema = new mongoose.Schema({
    from: {type: mongoose.Schema.Types.ObjectId, ref: 'contatos', required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'usuario'},
    protocol: {type: String},
    botStage: {type: String},
    status: {type: String},
    department: {type: String},
    date: {type: Date, default: Date.now}
})

const fila = mongoose.model("filas", filaSchema)

export default fila