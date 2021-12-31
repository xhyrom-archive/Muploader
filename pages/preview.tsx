import type { NextPage } from 'next';
import Head from 'next/head';
import '../styles/Preview.module.css';
import absoluteUrl from 'next-absolute-url';
import Highlight from 'react-highlight';
import Util from 'hyttpo/dist/js/util/utils';
import { Button } from 'react-bulma-components';

const convertToBase64 = (buffer) => btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')).toString();

export const getServerSideProps = async(ctx) => {
    const { id, token } = ctx.query;

    const url = `${absoluteUrl(ctx.req).origin}/api/files?id=${id}${token ? `&token=${token}` : ''}&preview=true`;
    const res = await fetch(`${absoluteUrl(ctx.req).origin}/api/files?id=${id}${token ? `&token=${token}` : ''}`, { method: 'GET' }).then((res) => res.arrayBuffer());

    if (res.byteLength > 4000000) return { props: { data: null, url, isImage: false, error: 'File has more than 4 MB.' } }

    const data = Util.isJSON(Buffer.from(res).toString('utf-8')) ? null : convertToBase64(res)?.toString();

    const isImage = data ? Buffer.from(data, 'base64').toString().includes('�') : false;

    return { props: { data: data, url, isImage: isImage }};
}

const Preview: NextPage = ({ data, url, isImage, error }: any) => {
    const downloadFile = () => {
        window.location.replace(url.replace('&preview=true', ''));
    }

    return (
        <div>
            <Head>
                <title>Muploader</title>
                <link rel='icon' href='/favicon.ico' />

                <meta name='robots' content='noindex, follow' />
                <meta content={url} property='og:image' />
                <meta name='theme-color' content='#A1C240' />
                <meta name='twitter:card' content='summary_large_image' />
            </Head>

            <main>
                <h1 className='title'>
                    { data && isImage ?
                        <img src={`data:image/png;base64,${data}`} alt='Image' className='img-fluid' style={{ border: '3px solid #555' }} />
                    : isImage ?
                        <img src={`https://http.cat/404`} alt='404' className='img-fluid' />
                    : 
                        <Highlight>
                            { data ? atob(data) : error ? error : 'Missing Authorization (?token)' }
                        </Highlight>
                    }

                    <div className='has-text-centered'>
                        <Button color='success' onClick={() => downloadFile()}>Download File</Button>
                    </div>
                </h1>
            </main>
        </div>
    )
}

export default Preview;