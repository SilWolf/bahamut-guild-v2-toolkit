import React, { useMemo } from 'react';
import './App.css';
import { useCallback, useState } from 'react';
import BahaPostCommentRenderer from './components/BahaPostCommentContent';
import { LS_KEY_REFRESH_OPTIONS } from './constant';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import RefreshConfigDialog, {
	REFERSH_CONFIG_DEFAULT_VALUES,
	renderRefreshConfig,
} from './widgets/RefreshConfigDialog';
import useBahaPostAndComments from './hooks/useBahaPostAndComments';
import BahaPostCommentTextarea from './components/BahaPostCommentTextarea';
import useMe from './hooks/useMe';
import {
	BahaPostCommentsListingDiv,
	BahaPostCommentsListingDivForEditor,
} from './components/BahaPostCommentDiv';
import { TBahaComment } from './types';
import useBGTV3Configs from './hooks/useBahaMasterConfig';
import {
	BGTV3ConfigForCommentDiv,
	BGTV3ConfigForUsersBot,
	BGTV3ConfigForUsersDiv,
} from './widgets/BGTV3ConfigDiv';

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
	const {
		bgtV3Config,
		commentConfig,
		usersConfig,
		setCommentConfig,
		setUsersConfig,
	} = useBGTV3Configs();
	const [isOpenBGTV3Config, setIsOpenBGTV3Config] = useState<boolean>(false);
	const handleClickToggleConfig = useCallback(() => {
		setIsOpenBGTV3Config((prev) => !prev);

		const rightSideEle = document.querySelector(
			'.main-sidebar_right'
		) as HTMLDivElement;
		if (rightSideEle && !rightSideEle.classList.contains('is-collapsed')) {
			Guild.toggleRightSidebar();
		}
	}, []);

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
		fetchedComments,
		latestCommentId,
		pendingMutations,
		isLoading,
		createComment,
	} = useBahaPostAndComments({
		refreshInterval: refreshConfig?.enableRefresh
			? refreshConfig.refreshInterval
			: 0,
	});

	const comments = useMemo(() => {
		return [
			...fetchedComments,
			...pendingMutations.map(
				(mutation, pi): TBahaComment => ({
					...(mutation.variables as { id: string; text: string }),
					name: me.nickname,
					userid: me.id,
					propic: me.avatar,
					position: fetchedComments.length + pi + 1,
					_isPending: true,
				})
			),
		];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [latestCommentId, me.avatar, me.id, me.nickname, pendingMutations.length]);

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

			if (!text) {
				return true;
			}

			createComment(text);

			return true;
		},
		[createComment, postMetadata]
	);

	return (
		<div className='tw-flex tw-gap-4 tw-items-start'>
			<div className='tw-mx-auto' style={{ width: 'min-content' }}>
				{isLoading && (
					<div className='tw-p-4 tw-bg-bg1 tw-shadow'>
						<p>插件初始化中…</p>
					</div>
				)}

				{post && (
					<div className='bhgtv3-post tw-p-4 tw-bg-bg1 tw-shadow tw-space-y-2'>
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

				<div className='tw-self-stretch tw-my-4 tw-flex tw-justify-between tw-items-center'>
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
							onClick={handleClickToggleConfig}
						>
							<i className='material-icons tw-align-middle tw-w-2 tw-text-[1em]'>
								settings
							</i>{' '}
							插件設定
						</button>
					</div>
				</div>

				<div className='tw-bg-bg1 tw-shadow tw-mb-4'>
					<BahaPostCommentsListingDivForEditor
						avatarSrc={me.avatar}
						config={bgtV3Config!}
					>
						<BahaPostCommentTextarea
							id='baha-post-comment-textarea-master'
							onPressEnter={handlePressEnterOnTextarea}
						/>
						<div className='tw-opacity-80 tw-text-xs tw-mt-2 tw-space-x-2'>
							<span>Enter: 發送</span>
							<span>Shift+Enter: 換行</span>
							<span>黏貼圖片: 上傳</span>
						</div>
					</BahaPostCommentsListingDivForEditor>
				</div>

				<div className='tw-bg-bg1 tw-shadow'>
					<BahaPostCommentsListingDiv
						comments={comments}
						config={bgtV3Config!}
					/>
				</div>

				<div className='tw-fixed tw-bottom-0 tw-right-0 tw-z-10'>
					<div className='tw-absolute tw-bottom-6 tw-right-24'></div>
				</div>
			</div>

			{isOpenBGTV3Config && (
				<div className='tw-flex-1 tw-bg-bg1 tw-sticky tw-top-[100px] tw-h-[calc(100vh-116px)] tw-overflow-y-scroll'>
					<BGTV3ConfigForCommentDiv
						commentConfig={commentConfig!}
						onChangeValue={setCommentConfig}
					/>
					<BGTV3ConfigForUsersDiv
						usersConfig={usersConfig!}
						onChangeValue={setUsersConfig}
					/>
				</div>
			)}

			<BGTV3ConfigForUsersBot
				comments={fetchedComments}
				usersConfig={usersConfig!}
				onChangeValue={setUsersConfig}
			/>
		</div>
	);
}

export default App;
