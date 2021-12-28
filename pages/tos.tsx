import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const ToS: NextPage = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>Muploader</title>
                <meta name="description" content="Muploader | Easy to share files" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <h1 className="title">
                    Terms of Services
                </h1>
            </main>
        </div>
    )
}

export default ToS;