import { Schema, model } from 'mongoose';

const schema = new Schema({
	key: { type: String, required: true },
	type: { type: Number, required: true },
    createdAt: { type: Date, expires: '2h', default: Date.now }
});

global.keySchema = global.keySchema || model('key', schema);

export default global.keySchema;
