import React, { useCallback, useState } from 'react';
import { useLocalStorage } from 'react-use';
import { LS_KEY_BGT_V3_DICE_ROLL_CONFIG } from '../../constant';

import styles from './index.module.css';
import UISwitch from '../../components/ui/UISwitch';
import { useForm } from 'react-hook-form';
import {
	postDiceRoll,
	TDiceRollPostBody,
} from '../../helpers/seagullApi.helper';
import useMe from '../../hooks/useMe';
import { TDiceRollConfig } from './index.type';
import useBahaPostAndComments from '../../hooks/useBahaPostAndComments';

export const BGT_V3_DICE_ROLL_CONFIG_DEFAULT_VALUE: TDiceRollConfig = {
	version: 1,
	histories: [],
};

export default function DiceRollDialog({
	insertTextFn,
}: {
	insertTextFn: (newText: string) => void;
}) {
	const me = useMe();
	const { fetchedComments } = useBahaPostAndComments();

	/**
	 * Dice Roll Config
	 */
	const [diceRollConfig, setDiceRollConfig] = useLocalStorage<TDiceRollConfig>(
		LS_KEY_BGT_V3_DICE_ROLL_CONFIG,
		BGT_V3_DICE_ROLL_CONFIG_DEFAULT_VALUE
	);

	/**
	 * Do Rolling
	 */
	const [isRolling, setIsRolling] = useState<boolean>(false);

	// const handleClickGalleryItem = (item: TGalleryItem) =>
	// 	insertTextFn(item.content);

	const {
		register,
		handleSubmit: handleRhfSubmit,
		formState: { errors },
		reset,
		watch,
		setValue,
	} = useForm<
		Omit<TDiceRollPostBody, 'pool' | 'isrepeat'> & {
			pool: string;
			isUnique: boolean;
		}
	>({
		defaultValues: {
			count: 1,
			size: 100,
			addnumber: 0,
			isUnique: true,
		},
	});

	const handleClickQuickRollPlayers = useCallback(() => {
		const playerSet = new Set(
			fetchedComments.map(({ userid, name }) => `[${userid}:${name}]`)
		);
		playerSet.delete(`[${me.id}:${me.nickname}`);

		reset({
			count: 4,
			ispool: true,
			isUnique: true,
			pool: [...playerSet]
				.map((name, index) => `${index + 1}. ${name}`)
				.join('\n'),
			reason: '劇本玩家抽4',
		});
	}, [fetchedComments, me.id, me.nickname, reset]);

	const handleSubmit = useCallback(
		(
			newValue: Omit<TDiceRollPostBody, 'pool' | 'isrepeat'> & {
				pool: string;
				isUnique: boolean;
			}
		) => {
			const postBody: TDiceRollPostBody = {
				user: me.id,
				nickname: me.nickname,
				reason: newValue.reason,
				channel: 'public',
				size: 0,
				addnumber: 0,
				count: newValue.count,
				ispool: false,
				isrepeat: !newValue.isUnique,
				pool: [],
			};

			if (newValue.ispool) {
				postBody.ispool = true;
				const pool = newValue.pool.split('\n');
				postBody.pool = pool;
				postBody.size = pool.length;
			} else {
				postBody.ispool = false;
				postBody.size = newValue.size;
				postBody.addnumber = newValue.addnumber;
			}

			setIsRolling(true);
			postDiceRoll(postBody)
				.then((res) => {
					const newDiceRollConfig = { ...diceRollConfig! };
					newDiceRollConfig.histories = [
						{
							id: res.result.hashcode,
							params: res.requestData,
							result: res.result,
						},
						...diceRollConfig!.histories,
					].slice(0, 5);
					setDiceRollConfig(newDiceRollConfig);
				})
				.finally(() => {
					setIsRolling(false);
				});
		},
		[diceRollConfig, me.id, me.nickname, setDiceRollConfig]
	);

	const handleClickCopyAndPaste = useCallback(
		(e: React.MouseEvent) => {
			const targetId = e.currentTarget.getAttribute('data-id') as string;
			const foundItem = diceRollConfig?.histories.find(
				({ id }) => id === targetId
			);

			if (!foundItem) {
				return;
			}

			const { params, result } = foundItem;

			let text = '';
			if (params.reason) {
				text = `「${params.reason}」： `;
			}

			if (params.ispool) {
				text += `列表${params.pool.length}抽${params.count}`;
			} else {
				text += `${params.count}d${params.size}`;
				if (params.addnumber !== 0) {
					text +=
						(params.addnumber > 0 ? '+' : '') + params.addnumber.toString();
				}
			}

			if (!params.isrepeat) {
				text += ' (不重複)';
			}
			text += ` #${result.hashcode}` + '\n';
			text += '=> ';

			if (params.ispool) {
				text += `[ ${result.record
					.map((i) => params.pool[i - 1])
					.join(', ')} ]`;
			} else {
				text += `[ ${result.record.join(', ')} ] = ${result.total}`;
			}

			insertTextFn(text);
		},
		[diceRollConfig?.histories, insertTextFn]
	);

	const handleClickReuse = useCallback(
		(e: React.MouseEvent) => {
			const targetId = e.currentTarget.getAttribute('data-id') as string;
			const foundItem = diceRollConfig?.histories.find(
				({ id }) => id === targetId
			);

			if (!foundItem) {
				return;
			}

			reset({
				...foundItem.params,
				pool: foundItem.params.pool.join('\n'),
			});
		},
		[diceRollConfig?.histories, reset]
	);

	return (
		<div className={styles['dice-roll-dialog']}>
			<div className='tw-space-y-4'>
				<div className='tw-space-x-2'>
					<span>快速使用: </span>
					<button className='btn-text' onClick={handleClickQuickRollPlayers}>
						劇本抽玩家
					</button>
					<span>|</span>
					<button className='btn-text'>COC檢定</button>
				</div>
				<form className='tw-space-y-4' onSubmit={handleRhfSubmit(handleSubmit)}>
					<div className='tw-grid tw-grid-cols-3 tw-gap-2'>
						<div>
							<label htmlFor='count'>數量</label>
							<input
								type='text'
								className='tw-w-full'
								{...register('count', {
									required: '必填項',
									min: { value: 1, message: '數量範圍1-50' },
									max: { value: 50, message: '數量範圍1-50' },
									valueAsNumber: true,
								})}
							/>
							{errors['count'] && (
								<p className='rhf-error'>{errors['count'].message}</p>
							)}
						</div>
						{!watch('ispool') && (
							<>
								<div>
									<label htmlFor='size'>面數</label>
									<input
										type='text'
										className='tw-w-full'
										{...register('size', {
											min: { value: 1, message: '面數範圍1-100' },
											max: { value: 100, message: '面數範圍1-100' },
											valueAsNumber: true,
										})}
									/>
									{errors['size'] && (
										<p className='rhf-error'>{errors['size'].message}</p>
									)}
									<p>
										<span
											className='tw-text-sm tw-text-baha tw-cursor-pointer'
											onClick={() => setValue('ispool', true)}
										>
											切換清單模式
										</span>
									</p>
								</div>
								<div>
									<label htmlFor='addnumber'>調整值</label>
									<input
										type='text'
										className='tw-w-full'
										{...register('addnumber', {
											min: { value: -65535, message: '調整值太小' },
											max: { value: 65535, message: '調整值太大' },
											valueAsNumber: true,
										})}
									/>
									{errors['addnumber'] && (
										<p className='rhf-error'>{errors['addnumber'].message}</p>
									)}
								</div>
							</>
						)}
						{!!watch('ispool') && (
							<div className='tw-col-span-2'>
								<label htmlFor='size'>列表(一行一個選項)</label>
								<textarea className='tw-w-full' {...register('pool')} />
								<span
									className='tw-text-sm tw-text-baha tw-cursor-pointer'
									onClick={() => setValue('ispool', false)}
								>
									切換骰子模式
								</span>
							</div>
						)}
					</div>

					<div className='tw-col-span-3'>
						<UISwitch label='骰出不會重複的結果' {...register('isUnique')} />
					</div>

					<div className='tw-col-span-3'>
						<label htmlFor='reason'>擲骰理由 (選填)</label>
						<input
							type='text'
							className='tw-w-full'
							{...register('reason', {
								maxLength: { value: 100, message: '不可超過100字' },
							})}
						/>
						{errors['reason'] && (
							<p className='rhf-error'>{errors['reason'].message}</p>
						)}
					</div>

					<div className='tw-flex tw-justify-between tw-items-center'>
						<a
							className='tw-text-sm tw-text-baha'
							href='https://www.isaka.idv.tw/dice/#/'
							target='_blank'
							rel='noreferrer'
						>
							沙鷗擲骰網
							<i className='material-icons tw-text-[1em] tw-align-middle'>
								open_in_new
							</i>
						</a>
						<button
							className='btn btn-primary'
							type='submit'
							disabled={isRolling}
						>
							擲骰
						</button>
					</div>
				</form>

				<hr />

				<div className='tw-flex tw-items-center tw-gap-x-1'>
					<i className='material-icons tw-text-[1.25em]'>history</i> 擲骰記錄
					(最近5筆)
				</div>
				<section className='tw-space-y-1'>
					{diceRollConfig?.histories.map(({ id, params, result }) => (
						<div
							key={id}
							className='tw-text-xs tw-p-2 tw-bg-bg2 tw-bg-opacity-10 tw-rounded tw-flex tw-items-center'
						>
							<div className='tw-flex-1'>
								<p>
									<span>
										{params.reason && `「${params.reason}」：`}
										{!params.ispool
											? `${params.count}d${params.size}${
													params.addnumber > 0 ? '+' : ''
											  }${
													params.addnumber !== 0
														? params.addnumber.toString()
														: ''
											  }`
											: `列表${params.pool.length}抽${params.count}`}
										{!params.isrepeat && ' (不重複)'}
									</span>
									<a
										href={`https://www.isaka.idv.tw/dice-api/dice/${result.hashcode}`}
										target='_blank'
										rel='noreferrer'
									>
										{` #${result.hashcode}`}
									</a>
								</p>
								<p>
									=&gt;{' '}
									{!params.ispool
										? `[ ${result.record.join(', ')} ] = ${result.total}`
										: `[ ${result.record.map(
												(index) => params.pool[index - 1]
										  )} ]`}
								</p>
							</div>
							<div className='tw-space-x-2 tw-text-[0.8rem]'>
								<button
									className='btn-text'
									data-id={id}
									onClick={handleClickCopyAndPaste}
								>
									<i className='material-icons tw-text-[1em] tw-align-middle'>
										content_copy
									</i>
									貼至輸入框
								</button>
								<button
									className='btn-text'
									data-id={id}
									onClick={handleClickReuse}
								>
									<i className='material-icons tw-text-[1em] tw-align-middle'>
										refresh
									</i>
									覆用
								</button>
							</div>
						</div>
					))}
				</section>
			</div>
		</div>
	);

	/**
	 * Control Panel
	 */
}
