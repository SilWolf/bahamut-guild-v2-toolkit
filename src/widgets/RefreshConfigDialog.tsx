import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import UISwitch from '../components/ui/UISwitch';

export type TRefreshConfig = {
	enableRefresh: 'on' | boolean;
	refreshInterval: number;
	refreshDesktopNotification: '0' | '1';
	refreshSound: '0' | '1' | '2' | '3';
	slowRefreshIfInactive: '0' | '1';
};

export const REFERSH_CONFIG_DEFAULT_VALUES: TRefreshConfig = {
	enableRefresh: false,
	refreshInterval: 10000,
	refreshDesktopNotification: '1',
	refreshSound: '1',
	slowRefreshIfInactive: '1',
};

export default function RefreshConfigDialog({
	value,
	open,
	onSubmit,
}: {
	value: TRefreshConfig | undefined;
	open: boolean;
	onSubmit: (newValue: TRefreshConfig) => void;
}) {
	const { register, watch, handleSubmit } = useForm<TRefreshConfig>({
		defaultValues: value ?? REFERSH_CONFIG_DEFAULT_VALUES,
	});

	const handleSubmitRefreshConfig = useMemo(
		() => handleSubmit(onSubmit),
		[handleSubmit, onSubmit]
	);

	if (!open) {
		return <></>;
	}

	return (
		<>
			<div className='tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-20 tw-z-[9990]'></div>
			<div className='tw-z-[9999] tw-absolute tw-top-[1.5em] tw-bg-bg1 tw-shadow-lg tw-p-3 tw-rounded tw-whitespace-nowrap'>
				<form className='tw-space-y-6' onSubmit={handleSubmitRefreshConfig}>
					<div className='tw-mt-4'>
						<UISwitch label='啟用自動刷新' {...register('enableRefresh')} />
					</div>

					{watch('enableRefresh') === true && (
						<>
							<hr />

							<div>
								<div>
									刷新頻率:{' '}
									<select
										{...register('refreshInterval', { valueAsNumber: true })}
									>
										<option value='3000'>3秒 (*)</option>
										<option value='10000'>10秒</option>
										<option value='30000'>30秒</option>
										<option value='60000'>1分鐘</option>
									</select>
								</div>
								<div className='tw-opacity-70'>
									(*) 為減少刷新失敗的可能性，對急速刷新的人數設限。
									<br />
									你需符合以下情況才能以3秒刷新：
									<ul className='tw-p-4'>
										<li>- 你是串主，或你是參與者(最近10分鐘內回覆過最少3次)</li>
										<li>- 此串總參與人數在10人以下</li>
									</ul>
									不符合情況下，插件會改為以每10秒刷新。
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
									<span>
										<a href='#' className='link-baha tw-ml-1'>
											<i className='material-icons tw-text-[1.15em] tw-align-text-bottom'>
												music_note
											</i>
											試聽
										</a>
									</span>
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
								<div className='tw-opacity-70'>
									* 當一定時間後仍沒有新回覆，就會改為1分鐘刷新一次。
								</div>
							</div>
						</>
					)}

					<div className='text-right tw-space-x-1'>
						<button className='btn-baha-primary' type='submit'>
							儲存
						</button>
					</div>
				</form>
			</div>
		</>
	);
}

export function renderRefreshConfig(config: TRefreshConfig | undefined) {
	if (!config) {
		return '未啟用';
	}

	const texts = [];

	if (config.enableRefresh !== true) {
		return '未啟用';
	}
	texts.push(`${Math.round(config.refreshInterval / 1000)}秒`);

	if (config.refreshDesktopNotification === '1') {
		texts.push('桌面通知');
	}

	if (config.refreshSound !== '0') {
		texts.push('音效');
	}

	return texts.join(', ');
}
