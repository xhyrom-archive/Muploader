import { Schema, model } from 'mongoose';

const schema = new Schema({
    id: { type: String, required: true },
    path: { type: String, required: true }
});

global.fileSchema = global.fileSchema || model('file', schema);

export default global.fileSchema;
