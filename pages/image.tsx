import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import '../styles/Image.module.css';
import absoluteUrl from 'next-absolute-url'

const convertToBase64 = (buffer) => btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));

export async function getServerSideProps(req) {
    const { id, token } = req.query;

    const res = await fetch(`${absoluteUrl(req.req).origin}/api/files?id=${id}${token ? `&token=${token}` : ''}`, { method: 'GET' }).then((res) => res.arrayBuffer());

    return { props: { data: convertToBase64(res)?.toString() || null, url: `${absoluteUrl(req.req).origin}/api/files?id=${id}${token ? `&token=${token}` : ''}&preview=true` }};
}

const ImagePreview: NextPage = ({ data, url }: any) => {
    return (
        <div className={styles.container} style={{ backgroundColor: '#222' }}>
            <Head>
                <title>Muploader</title>
                <link rel='icon' href='/favicon.ico' />

                <meta content={url} property='og:image' />
                <meta name='theme-color' content='#A1C240' />
                <meta name='twitter:card' content='summary_large_image' />
            </Head>

            <main>
                <h1 className='title'>
                    { data ? <img src={`data:image/png;base64,${data}`} alt='Image' className='img-fluid' /> : 'Loading' }
                </h1>
            </main>
        </div>
    )
}

export default ImagePreview;