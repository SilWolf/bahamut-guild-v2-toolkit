import './App.css';
import {
	QueryFunction,
	useInfiniteQuery,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import {
	apiGetAllComments,
	apiGetComments,
	apiGetPostDetail,
} from './helpers/api.helper';
import useBahaPostMetadata from './hooks/useBahaPostMetadata';
import { useEffect } from 'react';
import BahaPostCommentRenderer from './components/BahaPostCommentRenderer';

const fetchComments: QueryFunction<
	Awaited<ReturnType<typeof apiGetComments>>,
	[string, ReturnType<typeof useBahaPostMetadata> | null, string],
	number | 'all' | null
> = async ({ queryKey, pageParam }) =>
	apiGetComments(
		queryKey[1]?.gsn as string,
		queryKey[1]?.sn as string,
		pageParam
	);

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
			<div className='tw-mb-8'>
				{!postMetadata && (
					<div className='tw-p-4 tw-bg-white tw-shadow'>
						<p>插件初始化中…</p>
					</div>
				)}

				<BahaPostCommentRenderer
					content={`![](https://i.imgur.com/Lq23kgK.png)`}
				/>

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

				<div className='tw-bg-white tw-shadow'>
					{commentPages?.pages.map(({ comments }) => (
						<div>
							{comments.map((comment) => (
								<div className='tw-border-0 tw-border-t tw-border-solid tw-border-neutral-200 tw-px-4 tw-pt-3 tw-pb-4'>
									<div className='tw-flex tw-items-start tw-gap-x-3'>
										<div className='tw-shrink-0'>
											<img
												className='tw-rounded-full tw-w-9 tw-h-9'
												src={comment.propic}
												alt={comment.userid}
											/>
										</div>
										<div className='tw-flex-1 tw-space-y-2'>
											<div className='tw-flex tw-justify-between tw-items-center'>
												<p className='tw-font-bold'>{comment.name}</p>
												<span className='tw-text-xs tw-text-neutral-400'>
													#{comment.position}
												</span>
											</div>
											{/* <p className='tw-whitespace-pre-line'>{comment.text}</p> */}
											<BahaPostCommentRenderer content={comment.text} />
										</div>
									</div>
								</div>
							))}
						</div>
					))}
				</div>
			</div>
			<div className='tw-fixed tw-bottom-0 tw-right-0 tw-z-10'>
				<div className='tw-absolute tw-bottom-6 tw-right-24'>
					<button
						className='btn btn-primary tw-whitespace-nowrap'
						onClick={() =>
							apiGetAllComments(
								postMetadata?.gsn as string,
								postMetadata?.sn as string
							)
						}
					>
						測試commentlist
					</button>
					<button className='btn btn-primary tw-whitespace-nowrap'>
						打開插件介面
					</button>
				</div>
			</div>
		</div>
	);
}

export default App;
