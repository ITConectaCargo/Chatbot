import mongoose from "mongoose"

const embarcadorSchema = new mongoose.Schema({
    cpfCnpj: { type: String },
    name: { type: String },
    cepFrom: { type: String },
    cepTo: { type: String },
    daysWeek: [{ type: String }],
    appointmentLimit: {type: String}
})

const embarcador = mongoose.model("embarcadores", embarcadorSchema)

export default embarcador