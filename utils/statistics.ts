import LRU from 'lru-cache';
import fs from 'fs';

const formatBytes = (bytes, decimals = 2) => {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getFullSize = () => {
	const files = fs.readdirSync('./uploads', { withFileTypes: true }).filter(f => !f.isDirectory());

	let size = 0;

	files.forEach((file) => {
		size = fs.statSync(`./uploads/${file.name}`).size;
	});

	return formatBytes(size);
};

const getDailyFiles = () => {
	const files = fs.readdirSync('./uploads', { withFileTypes: true }).filter(f => !f.isDirectory());
	const now = new Date();

	let size = 0;

	files.forEach((file) => {
		const birthTime = fs.statSync(`./uploads/${file.name}`).birthtime;

		if (birthTime.getDate() === now.getDate() && birthTime.getMonth() === now.getMonth() && birthTime.getFullYear() === now.getFullYear()) size++;
	});

	return size.toLocaleString('en-US');
};

export const getStats = () => {
	const cache = new LRU({
		maxAge: 3600000
	});

	return {
		get: () => {
			let uploads = cache.get('uploads') || null;
			let storage = cache.get('storage') || null;
			let dailyuploads = cache.get('dailyuploads') || null;

			if (!uploads) {
				uploads = fs.readdirSync('./uploads').length;
				cache.set('uploads', uploads);
			}

			if (!storage) {
				storage = getFullSize();
				cache.set('storage', storage);
			}

			if (!dailyuploads) {
				dailyuploads = getDailyFiles();
				cache.set('dailyuploads', dailyuploads);
			}

			return {
				uploads,
				storage,
				dailyuploads
			};
		}
	};
};