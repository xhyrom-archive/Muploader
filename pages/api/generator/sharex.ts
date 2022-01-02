// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from '../../../utils/rateLimit';
import { strToBool } from '../../../utils/stringToBool';
import Utils from 'hyttpo/dist/js/util/utils';

type Data = {
    name: string;
    message?: string;
    data?: object;
}

const limiter = rateLimit({
	interval: 30000,
	uniqueTokenPerInterval: 100,
});

async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'GET') return res.status(400).json({ name: 'Bad Request', message: `Use GET instead of ${req.method}` });
	if (
		strToBool(process.env.NEXT_PUBLIC_AUTHORIZATION) &&
        (req.headers['authorization'] !== process.env.AUTHORIZATION_TOKEN) &&
        (req.query.token !== process.env.AUTHORIZATION_TOKEN)
	)  return res.status(403).json({ name: 'Forbidden', message: 'Invalid authorization token!' });

	const rateLimit = limiter.check(res, process.env.SHAREX_RATE_LIMIT, 'CACHE_TOKEN');

	if (rateLimit) return res.status(429).json({
		name: 'TOO MANY REQUESTS',
		message: 'Rate limit'
	});

	if (!req.query['config']) return res.status(422).json({
		name: 'UNPROCESSABLE ENTITY',
		message: 'Missing body config!'
	});

	req.query['config'] = Utils.isJSON(req.query['config']) ? JSON.parse(req.query['config'] as string) : null;

	if (
		typeof req.query['config'] !== 'object' ||
        !req.query['config']['Version'] ||
        !req.query['config']['Name'] ||
        !req.query['config']['DestinationType'] ||
        !req.query['config']['RequestMethod'] ||
        !req.query['config']['RequestURL'] ||
        !req.query['config']['Body'] ||
        !req.query['config']['Arguments'] ||
        req.query['config']['Arguments']['gcaptcha'] !== 'none' ||
        req.query['config']['Arguments']['tos-accept'] !== 'true' ||
        req.query['config']['FileFormName'] !== 'file' ||
        req.query['config']['URL'] !== '$json:message.url$'
	) return res.status(400).json({
		name: 'BAD REQUEST',
		message: 'Invalid config!'
	});

	res.setHeader('content-disposition', `attachment; filename=${req.query['config']['Name']}.sxcu`);
	res.status(200).end(JSON.stringify(req.query['config'], null, 2));
}

export default handler;