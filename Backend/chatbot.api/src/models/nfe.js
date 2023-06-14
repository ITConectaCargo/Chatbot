import mongoose from 'mongoose'

const nfeSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'contatos', require: true },
    key: { type: String },
    freightDate: { type: Date },
    appointmentDate: { type: Date },
    product: { type: String },
    value: { type: Number },
    status: { type: String },
    shipper: { type: mongoose.Schema.Types.ObjectId, ref: 'embarcadores', require: true },
    checklist: {
        statusPackaging: {type: String},
        reason: {type: String},
        details: {type: String},
    },
    date: { type: Date, default: Date.now }
})

const nfe = mongoose.model("nfes", nfeSchema)

export default nfe