import React, { PropsWithChildren, useMemo } from 'react';
import './App.css';
import { useCallback, useState } from 'react';
import BahaPostCommentRenderer from './components/BahaPostCommentContent';
import { LS_KEY_REFRESH_OPTIONS } from './constant';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import RefreshConfigDialog, {
	REFERSH_CONFIG_DEFAULT_VALUES,
	renderRefreshConfig,
	useRefreshSideEffectBot,
} from './widgets/RefreshConfigDialog';
import useBahaPostAndComments from './hooks/useBahaPostAndComments';
import BahaPostCommentTextarea, {
	insertTextFn,
	useCommentEditorRef,
} from './components/BahaPostCommentTextarea';
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
import GalleryDialog from './widgets/GalleryDialog';
import { useBoolean } from 'react-use';
import DiceRollDialog from './widgets/DiceRollDialog';

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
		latestComment,
		pendingMutations,
		isLoading,
		createComment,
	} = useBahaPostAndComments(refreshConfig);

	useRefreshSideEffectBot(latestComment, refreshConfig);

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
	}, [
		latestComment?.id,
		me.avatar,
		me.id,
		me.nickname,
		pendingMutations.length,
	]);

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

	/**
	 * Editor Extra Actions
	 */
	const editorRef = useCommentEditorRef();
	const handleInsertTextToEditor = useCallback(
		(newText: string) => {
			editorRef.current?.update(insertTextFn(newText));
		},
		[editorRef]
	);

	/**
	 * Gallery
	 */
	const [isOpenGallery, setIsOpenGallery] = useState<boolean>(false);
	const handleClickOpenGallery = useCallback(() => {
		setIsOpenGallery((prev) => !prev);
	}, []);

	/** Dice Roll */
	const [isOpenDiceRoll, toggleDiceRoll] = useBoolean(false);

	return (
		<>
			<div className='tw-flex tw-gap-4 tw-items-start'>
				<div
					className='tw-mx-auto tw-relative'
					style={{ width: 'min-content' }}
				>
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
								<a
									onClick={handleClickStartRefreshConfig}
									className='link-baha'
								>
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

					<div className='tw-bg-bg1 tw-shadow tw-mb-4 tw-sticky tw-top-[100px] tw-z-10 tw-pt-2'>
						<BahaPostCommentsListingDivForEditor
							avatarSrc={me.avatar}
							config={bgtV3Config!}
						>
							<BahaPostCommentTextarea
								editorRef={editorRef}
								id='baha-post-comment-textarea-master'
								onPressEnter={handlePressEnterOnTextarea}
							/>

							<div className='tw-mt-2 tw-flex tw-justify-between'>
								<div className='tw-opacity-80 tw-text-xs tw-space-x-2'>
									<span>Enter: 發送</span>
									<span>Shift+Enter: 換行</span>
									<span>黏貼圖片: 上傳</span>
								</div>
								<div className='tw-space-x-2 tw-text-xs'>
									<span
										className='tw-underline tw-cursor-pointer'
										onClick={toggleDiceRoll}
									>
										擲骰
									</span>
									<span
										className='tw-underline tw-cursor-pointer'
										onClick={handleClickOpenGallery}
									>
										素材庫
									</span>
								</div>
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

				<div className='tw-flex-1 tw-sticky tw-top-[100px] tw-max-h-[90vh] tw-overflow-y-scroll hide-scrollbar tw-space-y-4 empty:tw-hidden'>
					<DialogWrapper
						title='插件設定'
						isActive={isOpenBGTV3Config}
						onClose={() => setIsOpenBGTV3Config(false)}
					>
						<BGTV3ConfigForCommentDiv
							commentConfig={commentConfig!}
							onChangeValue={setCommentConfig}
						/>
					</DialogWrapper>

					<DialogWrapper
						title='素材庫'
						isActive={isOpenGallery}
						onClose={() => setIsOpenGallery(false)}
					>
						<GalleryDialog insertTextFn={handleInsertTextToEditor} />
					</DialogWrapper>

					<DialogWrapper
						title='擲骰'
						isActive={isOpenDiceRoll}
						onClose={toggleDiceRoll}
					>
						<DiceRollDialog insertTextFn={handleInsertTextToEditor} />
					</DialogWrapper>
				</div>

				<BGTV3ConfigForUsersBot
					comments={fetchedComments}
					usersConfig={usersConfig!}
					onChangeValue={setUsersConfig}
				/>
			</div>
		</>
	);
}

export default App;

function DialogWrapper({
	title,
	onClose,
	isActive,
	children,
}: PropsWithChildren<{
	title: React.ReactNode;
	onClose: () => void;
	isActive: boolean;
}>) {
	if (!isActive) {
		return undefined;
	}

	return (
		<div className='tw-bg-bg1 tw-rounded tw-p-4 tw-shadow tw-z-[99]'>
			<div className='tw-flex tw-justify-between'>
				<h2 className='tw-text-lg tw-font-bold tw-mb-2'>{title}</h2>
				<span
					className='tw-cursor-pointer tw-underline tw-text-sm'
					onClick={onClose}
				>
					X 關閉
				</span>
			</div>
			<div>{children}</div>
		</div>
	);
}
