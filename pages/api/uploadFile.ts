// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

// @ts-ignore
import * as formidable from 'formidable';
import axios from 'axios';
import connectDB from '../../middleware/mongodb';
import file from '../../models/file';
import path from 'path';
import fs from 'fs';
import { strToBool } from '../../utils/stringToBool';

type Data = {
  name: string;
  message?: string | object;
  data?: object;
}

export const config = {
    api: {
      bodyParser: false
    }
}

function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    if (req.method !== 'POST') return res.status(400).json({ name: 'Bad Request', message: `Use POST instead of ${req.method}` });
    if (strToBool(process.env.NEXT_PUBLIC_AUTHORIZATION) && req.headers['authorization'] !== process.env.AUTHORIZATION_TOKEN)  return res.status(403).json({ name: 'Forbidden', message: `Invalid authorization token!` });

    const maxFileSize = 1000000000;
    const form: any = new formidable.IncomingForm({ uploadDir: `./uploads/`, keepExtensions: true, keepFilenames: true, maxFileSize: maxFileSize, allowEmptyFiles: false });

    form.on('field', async(name: any, value: any) => {
      if (name === 'gcaptcha') {
        const verify = await axios(
          {
            url: `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_KEY}&response=${value}`,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            },
            method: "POST",
          }
        ).catch(e => e?.response);

        if (!verify.data.success) form._error('Invalid captcha key!');
      }
    })

    form.parse(req, async(err: any, fields: any, files: any) => {   
      if (!files || files.length === 0) {
        return res.status(422).json({
          name: 'UNPROCESSABLE ENTITY',
          message: 'Missing files!'
        })
      }

      if (!fields || fields.length === 0 || !fields['gcaptcha']) {
        fs.unlinkSync(`./uploads/${files.file[0].newFilename.toString()}`);
        
        return res.status(422).json({
          name: 'UNPROCESSABLE ENTITY',
          message: 'Missing gcaptcha!'
        })
      }

      if (err) {
        return res.status(413).json({
          name: 'TOO LARGE',
          message: typeof err === 'object' ? 'Maximum allowed size is 1 GB' : err
        })
      }

      const randomFileName = path.parse(files.file[0].newFilename.toString()).name;

      let object: any = { id: randomFileName, path: `./uploads/${files.file[0].newFilename.toString()}`, fileName: files.file[0].originalFilename.toString() };
      if (fields.withoutAuth) object.withoutAuth = strToBool(fields.withoutAuth);

      await file.create(object);

      res.status(200).json({ 
        name: 'OK',
        message: {
          msg: 'File has been uploaded.',
          path: randomFileName
        }, 
      })
    });

    // TODO: Delete after X minutes
}

export default connectDB(handler);