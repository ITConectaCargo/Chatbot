import mongoose from "mongoose"

const filaSchema = new mongoose.Schema({
    from: {type: String, require: true},
    timestamp: {type: Date, require: true},
    botStage: {type: String},
    status: {type: String},
    date: {type: Date, default: Date.now}
})

const fila = mongoose.model("filas", filaSchema)

export default fila