import { QueryFunction, useInfiniteQuery } from '@tanstack/react-query';
import React from 'react';
import { apiGetHomeImagesByPage } from '../../helpers/api.helper';

import styles from './index.module.css';

const fetchImagesFn: QueryFunction<
	Awaited<ReturnType<typeof apiGetHomeImagesByPage>>,
	string[],
	number
> = async ({ pageParam }) => apiGetHomeImagesByPage(pageParam);

export default function GalleryDialog({
	insertTextFn,
}: {
	insertTextFn: (newText: string) => void;
}) {
	const { data: homeImagesData } = useInfiniteQuery({
		staleTime: Infinity,
		queryKey: ['home', 'images'],
		queryFn: fetchImagesFn,
		initialPageParam: 1,
		getNextPageParam: (_, __, lastPageParam) => lastPageParam + 1,
	});

	const handleClickHomeImage = (e: React.MouseEvent<HTMLDivElement>) =>
		insertTextFn(e.currentTarget.getAttribute('data-src') as string);

	return (
		<div>
			<section className={styles['home-image-section']}>
				<div className='tw-flex tw-justify-between'>
					<div>小屋圖庫</div>
					<div>
						<button>上傳</button>
					</div>
				</div>
				<div className='home-image-section-body'>
					<div className='home-image-grid-container'>
						{homeImagesData?.pages.map((page) =>
							page.map((image) => (
								<div
									onClick={handleClickHomeImage}
									key={image.index}
									className='home-image-grid-container-item'
									style={{ backgroundImage: `url(${image.url})` }}
									data-src={image.url}
								/>
							))
						)}
					</div>
					<div className='tw-mt-4'>讀取更多…</div>
				</div>
			</section>
		</div>
	);
}
