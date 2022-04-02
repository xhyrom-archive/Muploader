import imageType from 'image-type';

export const isImage = (buffer) => {
	const type = imageType(buffer);
	if (type?.ext) return true;

	return false;
};