// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import * as fs from 'fs';
import connectDB from '../../middleware/mongodb';
import file from '../../models/file';

type Data = {
    name: string;
    message?: string;
    data?: object;
}

function deleteFile(res: NextApiResponse<Data>, fileId: string, path: string) {
  file.findOneAndDelete({ id: fileId }, () => {});

  fs.unlinkSync(path);
  res.status(200).json({
    name: 'OK',
    message: 'File has been deleted!'
  })
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (!req.query.id) return res.status(403).json({ name: 'BAD REQUEST', message: 'Please add ?id to query' })
    
  const fileId = req.query.id as string;

  const schema = await file.findOne({ id: fileId }).exec();
  if (!schema) return res.status(404).json({ name: 'NOT FOUND', message: 'Invalid ?id' });

  switch(req.method) {
    case 'GET':
      if (req.query.del) deleteFile(res, fileId, schema.path);
      else {
        res.setHeader("content-disposition", "attachment; filename=" + schema.fileName);
        res.status(200).end(fs.readFileSync(schema.path));
      }
      break;

    case 'DELETE':
      deleteFile(res, fileId, schema.path)
      break;

    default:
      res.status(403).json({ name: 'Bad Request', message: `Use GET/POST instead of ${req.method}` });
      break;
  }
}

export default connectDB(handler);