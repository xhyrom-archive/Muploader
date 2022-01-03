import keySchema from '../models/key';
import { getConnection } from './mongodb';

export class VerifyKeyManager {
	constructor() {
		getConnection();
	}

	async setCaptcha(options) {
		const value = await keySchema.create({
			key: options.key,
			type: options.type
		}).catch(e => e)

		return value;
	}

	async getCaptcha(key) {
		const value = await keySchema.findOne({ key }).exec();
		
		return value?.type;
	}

	deleteCaptcha(key) {
		keySchema.findOneAndDelete({ key }, () => {});

		return;
	}
}

global.VerifyKey = global.VerifyKey || new VerifyKeyManager();
export const VerifyKey = global.VerifyKey;