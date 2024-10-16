import {
	InfiniteData,
	QueryFunction,
	useInfiniteQuery,
} from '@tanstack/react-query';
import React, {
	createContext,
	MouseEvent,
	MouseEventHandler,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { apiGetHomeImagesByPage } from '../../helpers/api.helper';

import styles from './index.module.css';
import { TGalleryConfig, TGalleryItem } from './index.type';
import { useLocalStorage, useSet } from 'react-use';
import { LS_KEY_BGT_V3_GALLERY_CONFIG } from '../../constant';
import { postImgurImage } from '../../helpers/imgur.helper';
import { generateRandomId, getNowDateString } from '../../utils/string.util';
import GalleryAddItemsDialog from './GalleryAddItemsDialog';

const fetchImagesFn: QueryFunction<
	Awaited<ReturnType<typeof apiGetHomeImagesByPage>>,
	string[],
	number
> = async ({ pageParam }) => apiGetHomeImagesByPage(pageParam);

export const BGT_V3_GALLERY_CONFIG_DEFAULT_VALUE: TGalleryConfig = {
	version: 1,
	folders: [],
	items: [],
};

const GalleryDialogConfigContext = createContext<TGalleryConfig>(
	BGT_V3_GALLERY_CONFIG_DEFAULT_VALUE
);
const useGalleryConfig = () => useContext(GalleryDialogConfigContext);

type TActionItem =
	| {
			action: 'addToFolder';
			payload: {
				targetFolderName: string;
				items: (TGalleryItem | undefined)[];
			};
	  }
	| {
			action: 'removeFromFolder';
			payload: {
				targetFolderName: string;
				items: Set<string>;
			};
	  }
	| {
			action: 'removeEntirely';
			payload: {
				targetFolderName: string;
				items: Set<string>;
			};
	  }
	| {
			action: 'switchFolder';
			payload: string;
	  }
	| {
			action: 'upsertFolder';
			payload: string;
	  }
	| {
			action: 'toggleAddNewItemsDialog';
			payload: string;
	  };

type TActionFn = (actionItem: TActionItem[]) => void;

export default function GalleryDialog({
	insertTextFn,
}: {
	insertTextFn: (newText: string) => void;
}) {
	/**
	 * Gallery Config
	 */
	const [galleryConfig, setGalleryConfig] = useLocalStorage<TGalleryConfig>(
		LS_KEY_BGT_V3_GALLERY_CONFIG,
		BGT_V3_GALLERY_CONFIG_DEFAULT_VALUE
	);

	const handleClickGalleryItem = (item: TGalleryItem) =>
		insertTextFn(item.content);

	/**
	 * Active Folder
	 */
	const [activeFolder, setActiveFolder] = useState<string>('_home');
	const handleClickFolder = useCallback((e: MouseEvent) => {
		setActiveFolder(
			(e.currentTarget as HTMLElement).getAttribute('data-id') as string
		);
	}, []);

	const handleAction = useCallback<TActionFn>(
		(actionItems) => {
			const newGalleryConfig = { ...galleryConfig! };

			for (const { action, payload } of actionItems) {
				if (action === 'addToFolder') {
					for (const newItem of payload.items) {
						if (!newItem) {
							continue;
						}

						const itemIndex = newGalleryConfig.items.findIndex(
							({ id }) => id === newItem.id
						);
						if (itemIndex !== -1) {
							const targetItem = newGalleryConfig.items[itemIndex];
							if (!targetItem.tags.includes(payload.targetFolderName)) {
								targetItem.tags.push(payload.targetFolderName);
							}
						} else {
							newGalleryConfig.items.unshift({
								...newItem,
								tags: [payload.targetFolderName],
							});
						}
					}
				} else if (action === 'removeFromFolder') {
					for (const targetItemId of payload.items) {
						if (!targetItemId) {
							continue;
						}

						const targetItem = newGalleryConfig.items.find(
							({ id }) => id === targetItemId
						);
						if (targetItem) {
							const targetTagIndex = targetItem.tags.indexOf(
								payload.targetFolderName
							);
							if (targetTagIndex !== -1) {
								targetItem.tags.splice(targetTagIndex, 1);
							}
						}
					}
				} else if (action === 'removeEntirely') {
					for (const targetItemId of payload.items) {
						if (!targetItemId) {
							continue;
						}

						const targetItemIndex = newGalleryConfig.items.findIndex(
							({ id }) => id === targetItemId
						);
						if (targetItemIndex !== -1) {
							newGalleryConfig.items.splice(targetItemIndex, 1);
						}
					}
				} else if (action === 'switchFolder') {
					setActiveFolder(payload);
				} else if (action === 'upsertFolder') {
					if (!newGalleryConfig.folders.includes(payload)) {
						newGalleryConfig.folders.push(payload);
					}
				} else if (action === 'toggleAddNewItemsDialog') {
					setAddItemsDialogPayload(payload);
				}
			}

			setGalleryConfig(newGalleryConfig);
		},
		[galleryConfig, setGalleryConfig]
	);

	/**
	 * Gallery Add Items Dialog
	 */
	const [addItemsDialogPayload, setAddItemsDialogPayload] = useState<
		string | null
	>(null);
	const handleSubmitGalleryAddItemsDialog = useCallback(
		async (
			targetFolderName: string,
			newValue: {
				items: (Pick<TGalleryItem, 'name' | 'content'> & {
					type: 'text' | 'image-url' | 'image-upload';
					file?: FileList;
				})[];
			}
		) => {
			const promises = newValue.items.map((item): Promise<TGalleryItem> => {
				if (item.type === 'image-upload') {
					return postImgurImage(item.file![0]).then(({ link }) => ({
						id: generateRandomId(),
						name: item.name,
						type: 'image',
						content: link,
						tags: [],
						createdAt: getNowDateString(),
					}));
				}

				return Promise.resolve({
					id: generateRandomId(),
					name: item.name,
					type: item.type === 'image-url' ? 'image' : 'text',
					content: item.content,
					tags: [],
					createdAt: getNowDateString(),
				});
			});

			return Promise.allSettled(promises).then((results) => {
				handleAction([
					{
						action: 'addToFolder',
						payload: {
							targetFolderName: 'targetFolderName',
							items: results
								.filter(({ status }) => status === 'fulfilled')
								.map(
									(results) =>
										(results as PromiseFulfilledResult<TGalleryItem>).value
								),
						},
					},
				]);

				return results.map((result) => ({
					success: result.status === 'fulfilled',
					message: (result as PromiseRejectedResult).reason,
				}));
			});
		},
		[handleAction]
	);

	return (
		<GalleryDialogConfigContext.Provider value={galleryConfig!}>
			<div className='tw-flex tw-gap-x-1 tw-items-stretch tw-h-[50vh]'>
				<div className='tw-w-32 tw-text-sm tw-flex tw-flex-col tw-gap-y-1'>
					<div className='tw-flex-1 tw-overflow-y-scroll hide-scrollbar'>
						<ul className={styles['gallery-folders']}>
							<li
								className='gallery-folders-item'
								onClick={handleClickFolder}
								data-id='_all'
								data-active={activeFolder === '_all'}
							>
								<i className='material-icons gallery-folders-icon'>
									photo_library
								</i>
								全部
							</li>
							<li
								className='gallery-folders-item'
								onClick={handleClickFolder}
								data-id='_favorite'
								data-active={activeFolder === '_favorite'}
							>
								<i className='material-icons gallery-folders-icon'>star</i>
								我的最愛
							</li>
							{galleryConfig?.folders.map((name) => (
								<li
									key={name}
									className='gallery-folders-item'
									onClick={handleClickFolder}
									data-id={name}
									data-active={activeFolder === name}
								>
									<i className='material-icons gallery-folders-icon'>tag</i>
									{name}
								</li>
							))}
						</ul>
					</div>
					<ul className={styles['gallery-folders']}>
						<li
							className='gallery-folders-item'
							onClick={handleClickFolder}
							data-id='_home'
							data-active={activeFolder === '_home'}
						>
							<i className='material-icons gallery-folders-icon'>house</i>
							小屋圖庫
						</li>
					</ul>
				</div>
				<div className='tw-flex-1'>
					<div
						className={
							activeFolder === '_home' ? 'tw-h-full tw-block' : 'tw-hidden'
						}
					>
						<GalleryMainForHomeImage
							onClickItem={handleClickGalleryItem}
							onAction={handleAction}
						/>
					</div>
					<div
						className={
							activeFolder !== '_home' ? 'tw-h-full tw-block' : 'tw-hidden'
						}
					>
						<GalleryMainForFolder
							folderName={activeFolder}
							onClickItem={handleClickGalleryItem}
							onAction={handleAction}
						/>
					</div>
				</div>
			</div>

			{addItemsDialogPayload && (
				<GalleryAddItemsDialog
					onSubmit={handleSubmitGalleryAddItemsDialog}
					onCancel={() => setAddItemsDialogPayload(null)}
					targetFolderName={addItemsDialogPayload}
				/>
			)}
		</GalleryDialogConfigContext.Provider>
	);

	/**
	 * Control Panel
	 */
}

const homeImagesSelectFn = (
	data: InfiniteData<
		{
			index: number;
			thumb_url: string;
			url: string;
		}[],
		number
	>
) =>
	data.pages
		.map((page) =>
			page
				.map(
					(image): TGalleryItem => ({
						id: `_homeImage_${image.index.toString()}`,
						name: image.url,
						content: image.url,
						type: 'image',
						createdAt: '',
						tags: [],
					})
				)
				.flat()
		)
		.flat();

export function GalleryMain({
	items,
	folderName,
	onAction,
	onClickItem,
	onClickLoadMore,
	isLoadingMore,
	canLoadMore,
	disableAddItems,
	disableRemoveItems,
}: {
	items: TGalleryItem[];
	onClickItem: (item: TGalleryItem) => void;
	folderName: string;
	onAction: TActionFn;
	onClickLoadMore?: () => void;
	isLoadingMore?: boolean;
	canLoadMore?: boolean;
	disableAddItems?: boolean;
	disableRemoveItems?: boolean;
}) {
	/**
	 * Selected Items
	 */
	const [
		selectedSet,
		{ has: isSelected, toggle: toggleSelected, clear: clearSelected },
	] = useSet<string>();

	const handleClickItem = useCallback(
		(e: MouseEvent<HTMLDivElement>) => {
			const targetId = e.currentTarget.getAttribute('data-id');
			if (!targetId) {
				return;
			}
			const item = items.find(({ id }) => id === targetId);
			if (!item) {
				return;
			}

			if (selectedSet.size > 0 || e.shiftKey || e.ctrlKey) {
				toggleSelected(item.id);
				return;
			}

			onClickItem(item);
		},
		[items, onClickItem, selectedSet.size, toggleSelected]
	);

	const handleClickAddToFavorites = () => {
		onAction([
			{
				action: 'addToFolder',
				payload: {
					targetFolderName: '_favorite',
					items: [...selectedSet].map((selectedId) =>
						items?.find(({ id }) => id === selectedId)
					),
				},
			},
			{
				action: 'switchFolder',
				payload: '_favorite',
			},
		]);
		clearSelected();
	};

	const handleClickAddToNewFolder = () => {
		const newFolderName = prompt(
			'請輸入資料夾名稱（如果資料夾不存在，會一併創建）'
		);
		if (!newFolderName) {
			return;
		}

		onAction([
			{
				action: 'upsertFolder',
				payload: newFolderName,
			},
			{
				action: 'addToFolder',
				payload: {
					targetFolderName: newFolderName,
					items: [...selectedSet].map((selectedId) =>
						items?.find(({ id }) => id === selectedId)
					),
				},
			},
			{
				action: 'switchFolder',
				payload: newFolderName,
			},
		]);

		clearSelected();
	};

	const handleClickRemoveFromFolder = () => {
		if (
			confirm(
				'確定要移出資料夾嗎？\n（* 這不是永久刪除，你依然能在其他資料夾／「全部」中找到它們）'
			)
		) {
			onAction([
				{
					action: 'removeFromFolder',
					payload: {
						targetFolderName: folderName,
						items: selectedSet,
					},
				},
			]);
			clearSelected();
		}
	};

	const handleClickRemoveEntirely = () => {
		if (confirm('確定要永久刪除嗎？這將會從全部資料夾中移除，且無法復原！')) {
			onAction([
				{
					action: 'removeEntirely',
					payload: {
						targetFolderName: folderName,
						items: selectedSet,
					},
				},
			]);
			clearSelected();
		}
	};

	const handleClickAddItems = () => {
		onAction([
			{
				action: 'toggleAddNewItemsDialog',
				payload: folderName,
			},
		]);
	};

	useEffect(() => {
		clearSelected();
	}, [clearSelected, folderName]);

	return (
		<div className={styles['gallery-container']}>
			<div className='tw-text-right'>
				{!disableAddItems && (
					<button
						className='btn btn-primary tw-mb-2'
						onClick={handleClickAddItems}
					>
						新增項目
					</button>
				)}
			</div>

			<section className='gallery-container-body'>
				<div className='gallery-grid'>
					{items.map((item) => (
						<GalleryItem
							key={item.id}
							item={item}
							onClick={handleClickItem}
							isSelected={isSelected(item.id)}
						/>
					))}
				</div>

				{onClickLoadMore && canLoadMore && (
					<div className='tw-py-4 tw-text-center'>
						<button
							className='btn btn-primary'
							onClick={onClickLoadMore}
							disabled={isLoadingMore}
						>
							讀取更多
						</button>
					</div>
				)}

				{selectedSet.size > 0 && (
					<div className='tw-absolute tw-bottom-2 tw-left-2 tw-right-2 tw-p-4 tw-bg-bg1 tw-rounded tw-shadow-lg'>
						<div>
							<div>已選取 {selectedSet.size} 項</div>
							<div className='tw-space-x-2 tw-text-right'>
								{folderName !== '_favorite' && (
									<span
										onClick={handleClickAddToFavorites}
										className='tw-text-baha tw-underline tw-cursor-pointer'
									>
										加入最愛
									</span>
								)}
								<span
									onClick={handleClickAddToNewFolder}
									className='tw-text-baha tw-underline tw-cursor-pointer'
								>
									加至新資料夾
								</span>
								<span
									className='tw-text-baha tw-underline tw-cursor-pointer'
									onClick={clearSelected}
								>
									取消選擇
								</span>
							</div>
							<div className='tw-space-x-2 tw-text-right tw-mt-1'>
								{!disableRemoveItems && (
									<>
										<span
											onClick={handleClickRemoveFromFolder}
											className='tw-text-red-500 tw-underline tw-cursor-pointer'
										>
											移出資料夾
										</span>
										<span
											onClick={handleClickRemoveEntirely}
											className='tw-text-red-500 tw-underline tw-cursor-pointer'
										>
											永久刪除
										</span>
									</>
								)}
							</div>
						</div>
					</div>
				)}
			</section>

			<div className='tw-text-sm tw-mt-2'>
				點擊: 貼到輸入框 | ctrl+點擊: 選擇
			</div>
		</div>
	);
}

export function GalleryMainForHomeImage({
	onClickItem,
	onAction,
}: {
	onClickItem: (item: TGalleryItem) => void;
	onAction: TActionFn;
}) {
	const {
		data: items,
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
		select: homeImagesSelectFn,
		initialData: { pages: [], pageParams: [] },
	});

	return (
		<GalleryMain
			folderName='_home'
			items={items}
			onAction={onAction}
			onClickItem={onClickItem}
			onClickLoadMore={fetchNextPage}
			isLoadingMore={isFetchingNextPage}
			canLoadMore={hasNextPage}
			disableAddItems
			disableRemoveItems
		/>
	);
}

export function GalleryMainForFolder({
	onClickItem,
	folderName,
	onAction,
}: {
	onClickItem: (item: TGalleryItem) => void;
	folderName: string;
	onAction: TActionFn;
}) {
	const { items } = useGalleryConfig();
	const filteredItems = useMemo(
		() =>
			folderName !== '_all'
				? items.filter(({ tags }) => tags.includes(folderName))
				: items,
		[folderName, items]
	);

	return (
		<GalleryMain
			folderName={folderName}
			items={filteredItems}
			onAction={onAction}
			onClickItem={onClickItem}
		/>
	);
}

export function GalleryItem({
	item,
	isSelected,
	onClick,
}: {
	item: TGalleryItem;
	isSelected: boolean;
	onClick: MouseEventHandler;
}) {
	return (
		<div
			key={item.id}
			className='gallery-grid-item'
			onClick={onClick}
			style={{
				backgroundImage:
					item.type === 'image' ? `url(${item.content})` : 'none',
			}}
			data-id={item.id}
			data-selected={isSelected}
		/>
	);
}
