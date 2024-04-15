import { useEffect, useState } from 'react';

type PostMetadata = {
	gsn: string;
	sn: string;
};

const useBahaPostMetadata = () => {
	const [postMetadata, setPostMetadata] = useState<PostMetadata | null>(null);

	useEffect(() => {
		const qs = new URLSearchParams(window.location.search);
		const gsn = qs.get('gsn');
		const sn = qs.get('sn');

		if (gsn && sn) {
			setPostMetadata({
				gsn,
				sn,
			});
		}
	}, []);

	return postMetadata;
};

export default useBahaPostMetadata;
