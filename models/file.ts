import { Schema, model } from 'mongoose';

const schema = new Schema({
	id: { type: String, required: true },
	path: { type: String, required: true },
	fileName: { type: String, required: true },
	withoutAuth: { type: Boolean, required: false, default: true },
	deleteKey: { type: String, required: true }
});

global.fileSchema = global.fileSchema || model('file', schema);

export default global.fileSchema;
