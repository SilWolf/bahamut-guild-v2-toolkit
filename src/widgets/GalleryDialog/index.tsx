import { QueryFunction, useInfiniteQuery } from '@tanstack/react-query';
import React, { MouseEvent, useCallback, useState } from 'react';
import { apiGetHomeImagesByPage } from '../../helpers/api.helper';

import styles from './index.module.css';
import { TGalleryItem } from './index.type';

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
	const handleClickGalleryItem = (item: TGalleryItem) =>
		insertTextFn(item.content);

	/**
	 * Action Folder
	 */
	const [activeFolder, setActiveFolder] = useState<string>('home');
	const handleClickFolder = useCallback((e: MouseEvent) => {
		setActiveFolder(
			(e.currentTarget as HTMLElement).getAttribute('data-id') as string
		);
	}, []);

	return (
		<div>
			<h2>圖庫</h2>
			<div className='tw-flex tw-gap-x-1 tw-items-stretch tw-h-[50vh]'>
				<div className='tw-w-32 tw-text-sm tw-flex tw-flex-col tw-gap-y-1'>
					<div className='tw-flex-1 tw-overflow-y-scroll hide-scrollbar'>
						<ul className={styles['gallery-folders']}>
							<li
								className='gallery-folders-item'
								onClick={handleClickFolder}
								data-id='history'
								data-active={activeFolder === 'history'}
							>
								<i className='material-icons gallery-folders-icon'>history</i>
								最近使用
							</li>
							<li
								className='gallery-folders-item'
								onClick={handleClickFolder}
								data-id='favourite'
								data-active={activeFolder === 'favourite'}
							>
								<i className='material-icons gallery-folders-icon'>star</i>
								我的最愛
							</li>
						</ul>
					</div>
					<ul className={styles['gallery-folders']}>
						<li
							className='gallery-folders-item'
							onClick={handleClickFolder}
							data-id='home'
							data-active={activeFolder === 'home'}
						>
							<i className='material-icons gallery-folders-icon'>house</i>
							小屋圖庫
						</li>
					</ul>
					<div>編輯</div>
				</div>
				<div className='tw-flex-1'>
					<div
						className={
							activeFolder === 'home' ? 'tw-h-full tw-block' : 'tw-hidden'
						}
					>
						<GalleryForHomeImage onClickItem={handleClickGalleryItem} />
					</div>
				</div>
			</div>
		</div>
	);
}

export function GalleryForHomeImage({
	onClickItem,
}: {
	onClickItem: (item: TGalleryItem) => void;
}) {
	const {
		data: homeImagesData,
		fetchNextPage,
		isFetchingNextPage,
		hasNextPage,
	} = useInfiniteQuery({
		staleTime: Infinity,
		queryKey: ['home', 'images'],
		queryFn: fetchImagesFn,
		initialPageParam: 1,
		getNextPageParam: (lastPage, __, lastPageParam) =>
			lastPage.length > 0 ? lastPageParam + 1 : null,
	});

	const handleClickItem = useCallback(
		(e: MouseEvent<HTMLDivElement>) => {
			const url = e.currentTarget.getAttribute('data-url');
			if (!url) {
				return;
			}

			onClickItem({
				id: url,
				name: url,
				content: url,
				type: 'image',
				tags: [],
				createdAt: '',
			});
		},
		[onClickItem]
	);

	return (
		<div className={styles['gallery-container']}>
			<div className='tw-text-right tw-mb-2'>
				<button className='btn btn-primary'>上傳圖片</button>
			</div>
			<section className='gallery-container-body'>
				<div className='gallery-grid'>
					{homeImagesData?.pages.map((page) =>
						page.map((image) => (
							<div
								key={image.index}
								className='gallery-grid-item'
								onClick={handleClickItem}
								style={{ backgroundImage: `url(${image.url})` }}
								data-url={image.url}
							/>
						))
					)}
				</div>
				{hasNextPage && (
					<div className='tw-py-4 tw-text-center'>
						<button
							className='btn btn-primary'
							onClick={() => fetchNextPage()}
							disabled={isFetchingNextPage}
						>
							讀取更多
						</button>
					</div>
				)}
			</section>
		</div>
	);
}
