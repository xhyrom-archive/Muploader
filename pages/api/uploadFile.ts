// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

// @ts-ignore
import * as formidable from 'formidable';
import axios from 'axios';

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    if (req.method !== 'POST') return res.status(403).json({ name: 'Bad Request', message: `Use POST instead of ${req.method}` });

    const maxFileSize = 1000000000;
    const form = new formidable.IncomingForm({ uploadDir: './uploads', keepExtensions: true, maxFileSize: maxFileSize, allowEmptyFiles: false });

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

    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) {
        return res.status(413).json({
          name: 'TOO LARGE',
          message: typeof err === 'object' ? 'Maximum allowed size is 1 GB' : err
        })
      }

      res.status(200).json({ 
        name: 'OK',
        message: {
          msg: 'File has been uploaded',
          path: files.file[0].newFilename.toString()
        }, 
      })
    });

    // TODO: Delete after X minutes
}
