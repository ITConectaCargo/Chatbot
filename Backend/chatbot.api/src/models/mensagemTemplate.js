import mongoose from "mongoose";

const mensagemTemplateSchema = new mongoose.Schema(
    {
        text: {type: String, required: true},
        model: {type: String, required: true},
    }
)

const mensagemTemplate = mongoose.model("mensagemTemplates", mensagemTemplateSchema)

export default mensagemTemplate