// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import hyttpo from 'hyttpo';
import { VerifyKey } from '../../utils/verifyKeys';
import { strToBool } from '../../utils/stringToBool';

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

    if (!verify.data.success) {
        if (strToBool(process.env.NEXT_PUBLIC_SHAREX_SUPPORT) && req.headers['user-agent'].includes('ShareX')) {

        } else {
            /*return res.status(rateLimit ? 429 : 422).json({
                name: rateLimit ? 'TOO MANY REQUESTS' : 'UNPROCESSABLE ENTITY',
                message: rateLimit ? 'Rate limit' : 'Invalid captcha key!'
            });*/
        }
    }
}

export default handler;