import FormData from 'form-data';
import { hyttpo } from 'hyttpo';
import fs from 'fs';

(async() => {
    const form = new FormData();

    form.append('file', fs.createReadStream('./image.png'));
    form.append('gcaptcha', 'none');
    form.append('tos-accept', 'true');

    const res = await hyttpo.request({
        method: 'POST',
        url: 'http://localhost:3000/api/uploadFile',
        headers: {
            'Authorization': 'your key',
            'User-Agent': 'ShareX',
            ...form.getHeaders(),
        },
        body: form
    }).catch(e => e);

    console.log(res)
})();