import React from 'react';
import './App.css';
import { useCallback, useState } from 'react';
import BahaPostCommentRenderer from './components/BahaPostCommentContent';
import ConfigFormSection from './widgets/ConfigFormSection';
import BahaPostCommentDiv, {
	BahaPostCommentsPagesList,
} from './components/BahaPostCommentDiv';
import { LS_KEY_POST_LAYOUT_OPTIONS, LS_KEY_REFRESH_OPTIONS } from './constant';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import PostLayout, {
	POST_LAYOUT_OPTIONS_DEFAULT_VALUES,
	PostLayoutOptions,
} from './layouts/post.layout';
import RefreshConfigDialog, {
	REFERSH_CONFIG_DEFAULT_VALUES,
	renderRefreshConfig,
} from './widgets/RefreshConfigDialog';
import useBahaPostAndComments from './hooks/useBahaPostAndComments';
import BahaPostCommentTextarea from './components/BahaPostCommentTextarea';
import useMe from './hooks/useMe';
import BahaPostCommentContent from './components/BahaPostCommentContent';

type TRefreshConfig = {
	enableRefresh: 'on' | boolean;
	refreshInterval: number;
	refreshDesktopNotification: '0' | '1';
	refreshSound: '0' | '1' | '2' | '3';
	slowRefreshIfInactive: '0' | '1';
};

function App() {
	/**
	 * Plugin Config related.
	 */
	const [postLayoutOptions, setCommentOptions] = useLocalStorage(
		LS_KEY_POST_LAYOUT_OPTIONS,
		POST_LAYOUT_OPTIONS_DEFAULT_VALUES
	);
	const [isOpenConfig, setIsOpenConfig] = useState<boolean>(false);
	const handleClickStartConfig = useCallback(() => {
		setIsOpenConfig(true);
	}, []);

	const handleSubmitConfig = useCallback(
		(values: PostLayoutOptions) => {
			setCommentOptions(values);
			setIsOpenConfig(false);
		},
		[setCommentOptions]
	);

	/**
	 * Refresh Config related.
	 */
	const [refreshConfig, setRefreshConfig] = useLocalStorage<TRefreshConfig>(
		LS_KEY_REFRESH_OPTIONS,
		REFERSH_CONFIG_DEFAULT_VALUES
	);
	const [isOpenRefreshConfig, setIsOpenRefreshConfig] =
		useState<boolean>(false);

	const handleClickStartRefreshConfig = useCallback(() => {
		setIsOpenRefreshConfig((prev) => !prev);
	}, []);

	const handleSubmitRefreshConfig = useCallback(
		(newValue: TRefreshConfig) => {
			setRefreshConfig(newValue);
			setIsOpenRefreshConfig(false);
		},
		[setRefreshConfig]
	);

	/**
	 * User, Post and Comments
	 */
	const me = useMe();
	const {
		post,
		postMetadata,
		commentPages,
		isLoading,
		createComment,
		pendingNewComments,
	} = useBahaPostAndComments({
		refreshInterval: refreshConfig?.enableRefresh
			? refreshConfig.refreshInterval
			: 0,
	});

	/**
	 * Textarea related.
	 */
	const handlePressEnterOnTextarea = useCallback(
		(event: KeyboardEvent, text: string) => {
			if (!postMetadata) {
				return false;
			}

			if (event.shiftKey) {
				return false;
			}

			event.preventDefault();
			event.stopImmediatePropagation();

			createComment(text);

			return true;
		},
		[createComment, postMetadata]
	);

	return (
		<div>
			<PostLayout options={postLayoutOptions!}>
				{isLoading && (
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

				<div className='tw-my-4 tw-flex tw-justify-between tw-items-center'>
					<div className='tw-relative'>
						<div className='tw-pl-2'>
							<a onClick={handleClickStartRefreshConfig} className='link-baha'>
								自動更新
								<span className='material-icons tw-w-4 tw-h-4 tw-text-[1em] tw-align-text-bottom'>
									settings
								</span>
							</a>
							: <strong>{renderRefreshConfig(refreshConfig)}</strong>
						</div>

						<RefreshConfigDialog
							value={refreshConfig}
							open={isOpenRefreshConfig}
							onSubmit={handleSubmitRefreshConfig}
						/>
					</div>
					<div>
						<button
							className='btn btn-primary tw-whitespace-nowrap'
							onClick={handleClickStartConfig}
						>
							<i className='material-icons tw-align-middle tw-w-2 tw-text-[1em]'>
								settings
							</i>{' '}
							插件設定介面
						</button>
					</div>
				</div>

				<div className='tw-bg-white tw-shadow'>
					<div className='bhgtv3-pclist'>
						<BahaPostCommentDiv
							avatar={
								<img className='bhgtv3-pc-avatar' src={me.avatar} alt={me.id} />
							}
							title={me.nickname}
						>
							<BahaPostCommentTextarea
								id='baha-post-comment-textarea-master'
								onPressEnter={handlePressEnterOnTextarea}
							/>
						</BahaPostCommentDiv>
					</div>

					{pendingNewComments.map((comment) => (
						<div key={comment.id} className='bhgtv3-pclist tw-opacity-50'>
							<BahaPostCommentDiv
								avatar={
									<img
										className='bhgtv3-pc-avatar'
										src={me.avatar}
										alt={me.id}
									/>
								}
								title={me.nickname}
							>
								<BahaPostCommentContent content={comment.text as string} />
							</BahaPostCommentDiv>
						</div>
					))}

					<BahaPostCommentsPagesList
						commentsPages={commentPages}
						isDesc={postLayoutOptions?.order === 'desc'}
						ctimeFormat={postLayoutOptions?.ctime}
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
