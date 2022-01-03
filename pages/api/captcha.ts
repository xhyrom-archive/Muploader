// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import hyttpo from 'hyttpo';
import { VerifyKey } from '../../middleware/verifyKeys';
import { strToBool } from '../../utils/stringToBool';
import { nanoid } from 'nanoid';

type Data = {
    name: string;
    message?: string;
    data?: object;
}

const handler = async(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) => {
	if (req.method !== 'POST') return res.status(400).json({ name: 'Bad Request', message: `Use POST instead of ${req.method}` });
	if (strToBool(process.env.NEXT_PUBLIC_AUTHORIZATION) && req.headers['authorization'] !== process.env.AUTHORIZATION_TOKEN)  return res.status(403).json({ name: 'Forbidden', message: 'Invalid authorization token!' });

	req.body = JSON.parse(req.body);

	if (!req.body.gcaptcha) {
		return res.status(422).json({
			name: 'UNPROCESSABLE ENTITY',
			message: 'Missing gcaptcha!'
		});
	}

	const verify = await hyttpo.request(
		{
			url: `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_KEY}&response=${req.body.gcaptcha}`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
			},
			body: JSON.stringify({}),
			method: 'POST',
		}
	).catch(e => e);
	const id = nanoid(15);

	if (verify.data.success) {
		await VerifyKey.setCaptcha({
			key: id,
			type: 2
		});

		return res.status(200).json({
			name: 'OK',
			message: id
		});
	} else {
		return res.status(422).json({
			name: 'UNPROCESSABLE ENTITY',
			message: 'Invalid captcha key!'
		});
	}
};

export default handler;