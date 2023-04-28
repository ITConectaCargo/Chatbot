import mongoose from "mongoose"

const mensagemAutomaticaSchema = new mongoose.Schema({
    function: {type: String, require: true},
    stage: {type: String, require: true},
    text: {type: String, require: true}
})

const mensagemAutomatica = mongoose.model("mensagens_automaticas", mensagemAutomaticaSchema)

export default mensagemAutomatica