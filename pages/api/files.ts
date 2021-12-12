// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import * as fs from 'fs';

type Data = {
    name: string;
    message?: string;
    data?: object;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    if (!req.query.name) return res.status(403).json({ name: 'BAD REQUEST', message: 'Please add ?name to query' })
    
    const fileName = req.query.name;
    if (!fs.existsSync(`./uploads/${fileName}`)) return res.status(404).json({ name: 'NOT FOUND', message: 'Invalid ?name' })

    res.setHeader("content-disposition", "attachment; filename=" + fileName);
    res.status(200).end(fs.readFileSync(`./uploads/${fileName}`));
}