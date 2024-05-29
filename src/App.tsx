import './App.css';
import {
	QueryFunction,
	useInfiniteQuery,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import {
	apiGetAllComments,
	apiGetCommentsInPaginations,
	apiGetPostDetail,
} from './helpers/api.helper';
import useBahaPostMetadata from './hooks/useBahaPostMetadata';
import { useCallback, useEffect, useState } from 'react';
import BahaPostCommentRenderer from './components/BahaPostCommentContent';
import ConfigFormSection from './ConfigFormSection';
import { BahaPostCommentsPagesList } from './components/BahaPostCommentDiv';
import { LS_KEY_POST_LAYOUT_OPTIONS } from './constant';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import { variants } from 'classname-variants';
import { tw } from 'classname-variants/react';
import PostLayout, {
	POST_LAYOUT_OPTIONS_DEFAULT_VALUES,
	PostLayoutOptions,
} from './layouts/post.layout';

const fetchComments: QueryFunction<
	Awaited<ReturnType<typeof apiGetCommentsInPaginations>>,
	[string, ReturnType<typeof useBahaPostMetadata> | null, string],
	number | 'all' | null
> = async ({ queryKey, pageParam }) =>
	apiGetCommentsInPaginations(
		queryKey[1]?.gsn as string,
		queryKey[1]?.sn as string,
		pageParam
	);

const cn = variants({
	base: tw`tw-mb-8 tw-mx-auto`,
	variants: {
		bgColor: {
			none: tw``,
			striped: tw`[&_.bhgtv3-pclist]:even:tw-bg-neutral-100`,
		},
		fontSize: {
			small: tw`[&_.bhgtv3-pclist]:tw-text-[12px]`,
			medium: tw`[&_.bhgtv3-pclist]:tw-text-[15px]`,
			large: tw`[&_.bhgtv3-pclist]:tw-text-[18px]`,
		},
		avatarSize: {
			small: tw`[&_.bhgtv3-pc-avatar]:tw-w-7 [&_.bhgtv3-pc-avatar]:tw-h-7`,
			medium: tw`[&_.bhgtv3-pc-avatar]:tw-w-9 [&_.bhgtv3-pc-avatar]:tw-h-9`,
			large: tw`[&_.bhgtv3-pc-avatar]:tw-w-12 [&_.bhgtv3-pc-avatar]:tw-h-12`,
			hidden: tw`[&_.bhgtv3-pc-avatar]:tw-hidden`,
		},
		avatarShape: {
			circle: tw`[&_.bhgtv3-pc-avatar]:tw-rounded-full`,
			rounded: tw`[&_.bhgtv3-pc-avatar]:tw-rounded-lg`,
			square: tw``,
		},
		mainWidth: {
			unlimited: '',
			guildV2: 'tw-w-[calc(31em+32px)]',
			guildV1: 'tw-w-[calc(37em+32px)]',
		},
	},
	defaultVariants: {
		bgColor: 'striped',
		fontSize: 'medium',
		avatarSize: 'medium',
		avatarShape: 'circle',
		mainWidth: 'guildV1',
	},
});

function App() {
	const postMetadata = useBahaPostMetadata();
	const queryClient = useQueryClient();

	const { data: post } = useQuery({
		queryKey: ['post', postMetadata],
		queryFn: () =>
			apiGetPostDetail(postMetadata?.gsn as string, postMetadata?.sn as string),
		enabled: !!postMetadata,
	});

	const { data: commentPages } = useInfiniteQuery({
		queryKey: ['post', postMetadata, 'comments'],
		queryFn: fetchComments,
		initialPageParam: 0,
		getNextPageParam: (lastPage, _, lastPageParam) =>
			typeof lastPageParam === 'number' && lastPageParam < lastPage.totalPage
				? lastPageParam + 1
				: undefined,
		getPreviousPageParam: (firstPage) =>
			firstPage.nextPage === 0 ? undefined : firstPage.nextPage,
		enabled: false,
	});

	const [postLayoutOptions, setCommentOptions] = useLocalStorage(
		LS_KEY_POST_LAYOUT_OPTIONS,
		POST_LAYOUT_OPTIONS_DEFAULT_VALUES
	);
	const [isOpenConfig, setIsOpenConfig] = useState<boolean>(false);
	const handleClickStartConfig = useCallback(() => {
		setIsOpenConfig(true);
	}, []);

	const handleSubmitConfig = useCallback((values: PostLayoutOptions) => {
		setCommentOptions(values);
		setIsOpenConfig(false);
	}, []);

	useEffect(() => {
		if (postMetadata && typeof commentPages === 'undefined') {
			apiGetAllComments(postMetadata.gsn, postMetadata.sn).then(
				(commentPages) => {
					queryClient.setQueryData(['post', postMetadata, 'comments'], () => ({
						pages: commentPages,
						pageParams: commentPages.map(({ nextPage }) => nextPage + 1),
					}));
				}
			);
		}
	}, [postMetadata, commentPages]);

	return (
		<div>
			<PostLayout options={postLayoutOptions!}>
				{!postMetadata && (
					<div className='tw-p-4 tw-bg-white tw-shadow'>
						<p>插件初始化中…</p>
					</div>
				)}

				{post && (
					<div className='tw-p-4 tw-bg-white tw-shadow tw-space-y-2'>
						<div className='tw-flex tw-items-center tw-gap-x-2'>
							<div className='tw-shrink-0'>
								<img
									className='tw-rounded-full tw-w-10 tw-h-10'
									src={post.publisher.propic}
									alt={post.publisher.id}
								/>
							</div>
							<div className='tw-flex-1 tw-space-y-1'>
								<p className='tw-font-bold'>{post.publisher.name}</p>
								<p className='tw-text-xs tw-text-neutral-400'>{post.time}</p>
							</div>
						</div>
						<div>
							{/* <p className='tw-whitespace-pre-line tw-leading-[1.5]'>
								{post.content}
							</p> */}
							<BahaPostCommentRenderer content={post.content} />
						</div>
					</div>
				)}

				<div className='tw-text-right tw-space-x-2 tw-my-4'>
					{/* <button
						className='btn btn-primary tw-whitespace-nowrap'
						onClick={() =>
							apiGetAllComments(
								postMetadata?.gsn as string,
								postMetadata?.sn as string
							)
						}
					>
						測試commentlist
					</button> */}
					<button
						className='btn btn-primary tw-whitespace-nowrap'
						onClick={handleClickStartConfig}
					>
						插件設定介面
					</button>
				</div>

				<div className='tw-bg-white tw-shadow'>
					<BahaPostCommentsPagesList
						commentsPages={commentPages?.pages ?? []}
						isDesc={postLayoutOptions!?.order === 'desc'}
						ctimeFormat={postLayoutOptions!?.ctime}
					/>
				</div>
			</PostLayout>

			<div className='tw-fixed tw-bottom-0 tw-right-0 tw-z-10'>
				<div className='tw-absolute tw-bottom-6 tw-right-24'></div>
			</div>

			{isOpenConfig && (
				<ConfigFormSection
					defaultOptions={
						postLayoutOptions! ?? POST_LAYOUT_OPTIONS_DEFAULT_VALUES
					}
					onSubmit={handleSubmitConfig}
				/>
			)}
		</div>
	);
}

export default App;
