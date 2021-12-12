// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import * as fs from 'fs';

type Data = {
    name: string;
    message?: string;
    data?: object;
}

function deleteFile(res: NextApiResponse<Data>, fileName: string) {
  fs.unlinkSync(`./uploads/${fileName}`);
  res.status(200).json({
    name: 'OK',
    message: 'File has been deleted!'
  })
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (!req.query.name) return res.status(403).json({ name: 'BAD REQUEST', message: 'Please add ?name to query' })
    
  const fileName = req.query.name as string;

  if (!fs.existsSync(`./uploads/${fileName}`)) return res.status(404).json({ name: 'NOT FOUND', message: 'Invalid ?name' })
  if (!fs.realpathSync(`./uploads/${fileName}`).includes(`muploader\\uploads\\${fileName}`)) return res.status(404).json({ name: 'NOT FOUND', message: 'Invalid ?name' })

  switch(req.method) {
    case 'GET':
      if (req.query.del) deleteFile(res, fileName);
      else {
        res.setHeader("content-disposition", "attachment; filename=" + fileName);
        res.status(200).end(fs.readFileSync(`./uploads/${fileName}`));
      }
      break;

    case 'DELETE':
      deleteFile(res, fileName)
      break;

    default:
      res.status(403).json({ name: 'Bad Request', message: `Use GET/POST instead of ${req.method}` });
      break;
  }
}