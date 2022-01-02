// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import connectDB from '../../middleware/mongodb';
import file from '../../models/file';
import { strToBool } from '../../utils/stringToBool';

type Data = {
    name: string;
    message?: string;
    data?: object;
}

const deleteFile = (req: NextApiRequest, res: NextApiResponse<Data>, fileId: string, deleteKey: string, path: string, ui?: boolean) => {
	if (
		strToBool(process.env.NEXT_PUBLIC_AUTHORIZATION) &&
    (req.headers['authorization'] !== process.env.AUTHORIZATION_TOKEN) &&
    (req.query.token !== process.env.AUTHORIZATION_TOKEN)
	)  return res.status(403).json({ name: 'Forbidden', message: 'Invalid authorization token!' });

	if (
		req.query.del !== deleteKey
	) return res.status(403).json({ name: 'Forbidden', message: 'Invalid delete key!' });

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	file.findOneAndDelete({ id: fileId }, () => {});

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	fs.unlink(path, () => {});

	if (!ui) {
		res.status(200).json({
			name: 'OK',
			message: 'File has been deleted!'
		});
	} else {
		res.status(200).redirect('/');
	}
};

const handler = async(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) => {
	if (!req.query.id) return res.status(400).json({ name: 'BAD REQUEST', message: 'Please add ?id to query' });

	const fileId = req.query.id as string;

	const schema = await file.findOne({ id: fileId }).exec();
	if (!schema) return res.status(404).json({ name: 'NOT FOUND', message: 'Invalid ?id' });

	if (
		strToBool(process.env.NEXT_PUBLIC_AUTHORIZATION) &&
    (!schema.withoutAuth) &&
    (req.headers['authorization'] !== process.env.AUTHORIZATION_TOKEN) &&
    (req.query.token !== process.env.AUTHORIZATION_TOKEN)
	)  return res.status(403).json({ name: 'Forbidden', message: 'Invalid authorization token!' });

	switch(req.method) {
	case 'GET':
		if (req.query.del) deleteFile(req, res, fileId, schema.deleteKey, schema.path, true);
		else {
			if (req.query.preview) {
				res.status(200).end(fs.readFileSync(schema.path));
			} else {
				res.setHeader('content-disposition', 'attachment; filename=' + schema.fileName);
				res.status(200).end(fs.readFileSync(schema.path));
			}
		}
		break;

	case 'DELETE':
		deleteFile(req, res, fileId, schema.deleteKey, schema.path);
		break;

	default:
		res.status(400).json({ name: 'Bad Request', message: `Use GET/DELETE instead of ${req.method}` });
		break;
	}
};

export default connectDB(handler);