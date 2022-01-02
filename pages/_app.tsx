import '../styles/globals.css';
import 'bulma/css/bulma.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Home.module.css';
import type { AppProps } from 'next/app';
import Navbar from '../components/navbar';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<div className={styles.container}>
			<Navbar />
			<div className={styles.containercenterred}>
				<Component {...pageProps} />
			</div>
		</div>
	);
}

export default MyApp;
