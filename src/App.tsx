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
import { FormEvent, useCallback, useEffect, useState } from 'react';
import BahaPostCommentRenderer from './components/BahaPostCommentContent';
import ConfigFormSection from './ConfigFormSection';
import { BahaPostCommentsPagesList } from './components/BahaPostCommentDiv';
import { LS_KEY_POST_LAYOUT_OPTIONS, LS_KEY_REFRESH_OPTIONS } from './constant';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import PostLayout, {
	POST_LAYOUT_OPTIONS_DEFAULT_VALUES,
	PostLayoutOptions,
} from './layouts/post.layout';
import { useForm } from 'react-hook-form';

type RefreshOptions = {
	refreshRate: '0' | '3000' | '10000' | '30000' | '60000';
	refreshDesktopNotification: '0' | '1';
	refreshSound: '0' | '1' | '2' | '3';
	slowRefreshIfInactive: '0' | '1';
};

const REFERSH_OPTIONS_DEFAULT_VALUES = {
	refreshRate: '10000',
	refreshDesktopNotification: '1',
	refreshSound: '1',
	slowRefreshIfInactive: '1',
} as const;

const renderRefreshOptions = (options: RefreshOptions) => {
	const texts = [];

	if (options.refreshRate === '0') {
		return '關閉';
	}
	texts.push(`${Math.round(parseInt(options.refreshRate) / 1000)}秒`);

	if (options.refreshDesktopNotification === '1') {
		texts.push('桌面通知');
	}

	if (options.refreshSound !== '0') {
		texts.push('音效');
	}

	return texts.join(', ');
};

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

	const { register } = useForm<RefreshOptions>({
		defaultValues: REFERSH_OPTIONS_DEFAULT_VALUES,
	});
	const [refreshOptions, setRefreshOptions] = useLocalStorage<RefreshOptions>(
		LS_KEY_REFRESH_OPTIONS,
		REFERSH_OPTIONS_DEFAULT_VALUES
	);
	const [isOpenRefreshConfig, setIsOpenRefreshConfig] =
		useState<boolean>(false);
	const handleClickStartRefreshConfig = useCallback(() => {
		setIsOpenRefreshConfig(true);
	}, []);

	const handleSubmitRefreshConfig = useCallback((e: FormEvent) => {
		e.preventDefault();
		const values = Object.fromEntries(
			new FormData(e.currentTarget as HTMLFormElement)
		) as RefreshOptions;

		setRefreshOptions(values);
		setIsOpenRefreshConfig(false);
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
					<div className='bhgtv3-post tw-p-4 tw-bg-white tw-shadow tw-space-y-2'>
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
							<BahaPostCommentRenderer content={post.content} />
						</div>
					</div>
				)}

				<div className='tw-my-4 tw-flex tw-justify-between tw-items-end tw-pl-4'>
					<div className='tw-relative'>
						<div>
							自動更新(
							<a
								onClick={handleClickStartRefreshConfig}
								className='tw-cursor-pointer'
							>
								修改
							</a>
							): <strong>{renderRefreshOptions(refreshOptions!)}</strong>
						</div>
						{isOpenRefreshConfig && (
							<div className='tw-absolute tw-top-0 tw-bg-white tw-shadow-lg tw-p-3 tw-rounded tw-whitespace-nowrap'>
								<form
									className='tw-space-y-3'
									onSubmit={handleSubmitRefreshConfig}
								>
									<div>
										<div>
											更新頻率:{' '}
											<select {...register('refreshRate')}>
												<option value='0'>關閉</option>
												<option value='3000'>3秒</option>
												<option value='10000'>10秒</option>
												<option value='30000'>30秒</option>
												<option value='60000'>1分鐘</option>
											</select>
										</div>
										<div className='tw-text-xs tw-text-blue-700'>
											* 只有參與者能選擇最快的頻率
										</div>
									</div>
									<div>
										桌面通知:{' '}
										<select {...register('refreshDesktopNotification')}>
											<option value='0'>關閉</option>
											<option value='1'>開啟</option>
										</select>
									</div>
									<div>
										<div>
											音效:{' '}
											<select {...register('refreshSound')}>
												<option value='0'>關閉</option>
												<option value='1'>音效1</option>
												<option value='2'>音效2</option>
												<option value='3'>音效3</option>
											</select>
										</div>
										<div className='tw-text-xs tw-text-blue-700'>
											(點此試聽)
										</div>
									</div>
									<div>
										<div>
											非活躍時慢速更新:{' '}
											<select {...register('slowRefreshIfInactive')}>
												<option value='1'>開啟(建議)</option>
												<option value='0'>關閉</option>
											</select>
										</div>
										<div className='tw-text-xs tw-text-blue-700'>
											* 當刷新一定次數後仍沒有新回覆，就會改為1分鐘刷新一次。
										</div>
									</div>
									<div className='text-right'>
										<button className='btn-primary' type='submit'>
											儲存
										</button>
									</div>
								</form>
							</div>
						)}
					</div>
					<div>
						<button
							className='btn btn-primary tw-whitespace-nowrap'
							onClick={handleClickStartConfig}
						>
							插件設定介面
						</button>
					</div>
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
