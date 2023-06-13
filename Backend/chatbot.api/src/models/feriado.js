import mongoose from "mongoose"

const feriadosSchema = new mongoose.Schema({
    date: {type: Date},
    name: {type: String},
    type: {type: String},
})

const feriado = mongoose.model("feriados", feriadosSchema)

export default feriado