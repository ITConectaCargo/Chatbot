import mongoose from "mongoose"

const agendamentoSchema = new mongoose.Schema({
    protocol: [{ type: String }],
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'contatos', required: true },
    nfe: { type: mongoose.Schema.Types.ObjectId, ref: 'nfes', required: true },
    shipper: { type: mongoose.Schema.Types.ObjectId, ref: 'embarcadores', required: true },
    status: { type: String },
    statusDescription: { type: String },
    freightDate: { type: Date },
    appointmentDate: { type: Date },
    disassembledProduct: { type: Boolean },
    checklist: {
        statusPackaging: { type: String },
        reason: { type: String },
        details: { type: String },
    },
    residence: {
        type: { type: String },
        floor: { type: String },
        elevator: { type: Boolean },
    },
})

const agendamento = mongoose.model("agendamentos", agendamentoSchema)

export default agendamento