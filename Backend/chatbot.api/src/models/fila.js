import mongoose from "mongoose"

const filaSchema = new mongoose.Schema({
    from: {type: String, require: true},
    date: {type: Date, require: true},
    botStage: {type: String},
    status: {type: String}
})

const fila = mongoose.model("fila", filaSchema)

export default fila