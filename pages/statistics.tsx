import type { NextPage } from 'next';
import Head from 'next/head';
import { CardGroup, Card } from 'react-bootstrap';
import { getStats } from '../utils/statistics';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { config, dom } from '@fortawesome/fontawesome-svg-core';
import { faFileImage, faHdd, faSun } from '@fortawesome/free-solid-svg-icons';

config.autoAddCss = false;

const stats = getStats();

export const getServerSideProps = () => {
	const { uploads, storage, dailyuploads } = stats.get();

	return { props: { uploads, storage, dailyuploads } };
};

const Statistics: NextPage = ({ uploads, storage, dailyuploads }: any) => {
	return (
		<div>
			<Head>
				<title>Muploader</title>
				<meta name='description' content='Muploader | Easy to share files' />
				<link rel='icon' href='/favicon.ico' />

				<style>{dom.css()}</style>
			</Head>

			<main>
				<h1 className='title'>
                    Statistics
				</h1>

				<h1 className='subtitle'>
                    Updates every 1 hour
				</h1>

				<CardGroup>
					<Card style={{ width: '18rem' }}>
						<Card.Body>
							<Card.Text>
                                Files / Uploads
							</Card.Text>
							<Card.Title>
								<FontAwesomeIcon icon={faFileImage} size='2x' />
								<span className='ml-2' style={{ fontSize: '35px' }}>{ uploads.toLocaleString('en-US') }</span>
							</Card.Title>
						</Card.Body>
					</Card>
					<Card style={{ width: '18rem' }}>
						<Card.Body>
							<Card.Text>
                                Storage Space Used
							</Card.Text>
							<Card.Title>
								<FontAwesomeIcon icon={faHdd} size='2x' />
								<span className='ml-2' style={{ fontSize: '35px' }}>{ storage }</span>
							</Card.Title>
						</Card.Body>
					</Card>
					<Card style={{ width: '18rem' }}>
						<Card.Body>
							<Card.Text>
                                Daily Uploads
							</Card.Text>
							<Card.Title>
								<FontAwesomeIcon icon={faSun} size='2x' />
								<span className='ml-2' style={{ fontSize: '35px' }}>{ dailyuploads }</span>
							</Card.Title>
						</Card.Body>
					</Card>
				</CardGroup>
			</main>
		</div>
	);
};

export default Statistics;