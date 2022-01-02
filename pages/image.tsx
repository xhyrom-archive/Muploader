// deprecated, preview.tsx

import type { NextPage } from 'next';

export const getServerSideProps = async(ctx) => {
	const { id, token } = ctx.query;

	return {
		redirect: {
			destination: `/preview?id=${id}&token=${token}`,
			permanent: true,
		},
	};
};

const ImagePreview: NextPage = () => {
	return (
		<div></div>
	);
};

export default ImagePreview;