// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import * as formidable from 'formidable';
import { nanoid } from 'nanoid';
import connectDB from '../../middleware/mongodb';
import file from '../../models/file';
import path from 'path';
import absoluteUrl from 'next-absolute-url';
import { strToBool } from '../../utils/stringToBool';
import { rateLimit } from '../../utils/rateLimit';
import { VerifyKey } from '../../middleware/verifyKeys';

type Data = {
  name: string;
  message?: string | object;
  data?: object;
}

export const config = {
	api: {
		bodyParser: false
	}
};

const limiter = rateLimit({
	interval: process.env.SHAREX_RATE_LIMIT_INTERVAL,
	uniqueTokenPerInterval: 100,
});

const handler = (
	req: NextApiRequest,
	res: NextApiResponse<Data>
) => {
	if (req.method !== 'POST') return res.status(400).json({ name: 'Bad Request', message: `Use POST instead of ${req.method}` });
	if (strToBool(process.env.NEXT_PUBLIC_AUTHORIZATION) && req.headers['authorization'] !== process.env.AUTHORIZATION_TOKEN)  return res.status(403).json({ name: 'Forbidden', message: 'Invalid authorization token!' });

	const maxFileSize = 1000000000;
	const form: any = new formidable.IncomingForm({
		uploadDir: './uploads/',
		keepExtensions: true,
		maxFileSize: maxFileSize,
		allowEmptyFiles: false,
		multiples: false,
		filename: function (name, ext) {
			return `${nanoid(36)}${ext}`;
		}
	});

	form.on('field', async(name: any, value: any) => {
		if (name === 'tos-accept' && !strToBool(value)) form._error('You must accept our ToS!');
	});

	form.parse(req, async(err: any, fields: any, files: any) => {
		if (err) {
			res.setHeader('Connection', 'close');

			return res.status(413).json({
				name: 'TOO LARGE',
				message: typeof err === 'object' ? 'Maximum allowed size is 1 GB' : err
			});
		}

		if (!files || files.length === 0) {
			return res.status(422).json({
				name: 'UNPROCESSABLE ENTITY',
				message: 'Missing files!'
			});
		}

		if (!fields || fields.length === 0 || !fields['gcaptcha']?.[0]) {
			files.file[0].destroy();

			return res.status(422).json({
				name: 'UNPROCESSABLE ENTITY',
				message: 'Missing gcaptcha!'
			});
		}

		const verify = await VerifyKey.getCaptcha(fields['gcaptcha'][0]);
		VerifyKey.deleteCaptcha(fields['gcaptcha'][0]);

		if (!verify) {
			const rateLimit = limiter.check(res, process.env.SHAREX_RATE_LIMIT, 'CACHE_TOKEN');

			if (strToBool(process.env.NEXT_PUBLIC_SHAREX_SUPPORT) && req.headers['user-agent'].includes('ShareX') && !rateLimit) {} // eslint-disable-line no-empty
			else {
				files.file[0].destroy();

				return res.status(rateLimit ? 429 : 422).json({
					name: rateLimit ? 'TOO MANY REQUESTS' : 'UNPROCESSABLE ENTITY',
					message: rateLimit ? 'Rate limit' : 'Invalid captcha key!'
				});
			}
		}

		const deleteKey = nanoid(25);
		const newFileName = path.parse(files.file[0].newFilename.toString()).name;

		const object: any = {
			id: newFileName,
			path: `./uploads/${files.file[0].newFilename.toString()}`,
			fileName: files.file[0].originalFilename.toString(), deleteKey: deleteKey,
			withoutAuth: strToBool(fields.withoutAuth[0]) 
		};

		await file.create(object);

		res.status(200).json({ 
			name: 'OK',
			message: {
				msg: 'File has been uploaded.',
				path: newFileName,
				url: `${absoluteUrl(req).origin}/preview?id=${newFileName}${!strToBool(fields.withoutAuth[0]) ? `&token=${process.env.AUTHORIZATION_TOKEN}` : ''}`,
				downloadUrl: `${absoluteUrl(req).origin}/api/files?id=${newFileName}${!strToBool(fields.withoutAuth[0]) ? `&token=${process.env.AUTHORIZATION_TOKEN}` : ''}`,
				deleteUrl: `${absoluteUrl(req).origin}/api/files?id=${newFileName}${process.env.AUTHORIZATION_TOKEN ? `&token=${process.env.AUTHORIZATION_TOKEN}` : ''}&del=${deleteKey}`,
			}, 
		});
	});

	// TODO: Delete after X minutes property
};

export default connectDB(handler);