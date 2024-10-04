import React from 'react';
import './App.css';
import { useCallback, useState } from 'react';
import BahaPostCommentRenderer from './components/BahaPostCommentContent';
import ConfigFormSection from './widgets/ConfigFormSection';
import { BahaPostCommentsPagesList } from './components/BahaPostCommentDiv';
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

type TRefreshConfig = {
	enableRefresh: 'on' | boolean;
	refreshRate: '0' | '3000' | '10000' | '30000' | '60000';
	refreshDesktopNotification: '0' | '1';
	refreshSound: '0' | '1' | '2' | '3';
	slowRefreshIfInactive: '0' | '1';
};

function App() {
	const { post, commentPages, isLoading } = useBahaPostAndComments();

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
							插件設定介面
						</button>
					</div>
				</div>

				<div className='tw-bg-white tw-shadow'>
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
