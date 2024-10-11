import { useForm } from 'react-hook-form';
import { BahaPostCommentsListingDiv } from '../components/BahaPostCommentDiv';
import React, { FormEvent, useCallback } from 'react';
import { TBahaComment, TBahaCommentConfig } from '../types';

const COMMENTS_SAMPLE: TBahaComment[] = [
	{
		text: '路過的平民看了青年一眼，開始交頭接耳：「這人好眼熟，是不是四災電影的角色啊，還是那位導演?」\n\n路過的龍套冒險者還一臉就是『呵呵，抽到破產了嗎~』，顯然也是歐洲人，令人欠揍。',
		id: '14138825',
		image: [],
		mentions: [],
		tags: [],
		time: '3小時 編輯',
		ctime: '2024-04-18 11:00:36',
		name: '小元',
		userid: 'a29719811',
		propic:
			'https://avatar2.bahamut.com.tw/avataruserpic/a/2/a29719811/a29719811_s.png?v=202404181447',
		editable: false,
		deletable: false,
		position: 1,
	},
	{
		text: '是的，他根本沒有理會。\n雷打不動窮鬼，就算現在有個鬼來纏上他。\n\n他也只會撒手一擺問說：\n\n「你死前沒半顆鑽石，太可悲了吧。」\n\n諸如此類的反向驅鬼法。',
		id: '14138842',
		image: [],
		mentions: [],
		tags: [],
		time: '3小時',
		ctime: '2024-04-18 11:05:00',
		name: '賽菲洛斯',
		userid: 'robinhoods91',
		propic:
			'https://avatar2.bahamut.com.tw/avataruserpic/r/o/robinhoods91/robinhoods91_s.png?v=202404181447',
		editable: false,
		deletable: false,
		position: 2,
	},
	{
		text: '　\n「你在幹什麼……」\n　\n一個政府再怎麼投入經費關注並改善公民福祉，\n依然多少還是會存在階級貧富問題，這很正常。\n\n只是蔥花蛋糕萬萬沒想到，會有一天看見自己還算朋友的朋友正坐在廣場上乞討。\n他並不認為同為冒險者的羅賓會缺錢缺到得乞討，故當前碗裡只收獲綠貓鄙視感。',
		id: '14138868',
		image: [],
		mentions: [],
		tags: [],
		time: '3小時',
		ctime: '2024-04-18 11:12:35',
		name: '球羊',
		userid: 'viviLOVE703',
		propic:
			'https://avatar2.bahamut.com.tw/avataruserpic/v/i/vivilove703/vivilove703_s.png?v=202404181447',
		editable: false,
		deletable: false,
		position: 3,
	},
];

const ConfigFormSection = ({
	defaultConfig,
	onSubmit,
}: {
	defaultConfig: TBahaCommentConfig;
	onSubmit: (values: TBahaCommentConfig) => void;
}) => {
	const { register, watch } = useForm<TBahaCommentConfig>({
		defaultValues: defaultConfig,
	});

	const handleSubmit = useCallback(
		(e: FormEvent) => {
			e.preventDefault();
			const values = Object.fromEntries(
				new FormData(e.currentTarget as HTMLFormElement)
			) as unknown as TBahaCommentConfig;

			onSubmit(values);
		},
		[onSubmit]
	);

	return (
		<div className='tw-fixed tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-bg-black tw-bg-opacity-70 tw-z-[9999]'>
			<div className='tw-container tw-max-w-screen-md tw-mx-auto tw-py-12'>
				<div className='tw-bg-white tw-rounded-2xl tw-p-8'>
					<form className='tw-space-y-6' onSubmit={handleSubmit}>
						<h2 className='tw-text-xl tw-font-bold'>外觀設定</h2>

						<div className='tw-border tw-border-solid tw-border-neutral-400 tw-aspect-video tw-overflow-y-scroll tw-relative tw-rounded tw-flex tw-justify-center tw-pt-2'>
							<div className='tw-origin-top'>
								<BahaPostCommentsListingDiv
									comments={COMMENTS_SAMPLE}
									config={watch()}
								/>
							</div>
						</div>

						<div>
							<div className='tw-grid tw-grid-cols-2 tw-gap-4'>
								<div className='tw-flex tw-justify-start tw-gap-x-2'>
									<span>字體</span>
									<span>
										<select>
											<option value='guildV2'>巴哈公會2.0</option>
											<option value='guildV1'>舊巴哈公會</option>
										</select>
									</span>
								</div>

								<div className='tw-flex tw-justify-start tw-gap-x-2'>
									<span>字體大小</span>
									<span>
										<select {...register('fontSize')}>
											<option value='small'>小</option>
											<option value='medium'>中</option>
											<option value='large'>大</option>
										</select>
									</span>
								</div>

								<div className='tw-flex tw-justify-start tw-gap-x-2'>
									<span>寬度</span>
									<span>
										<select {...register('mainWidth')}>
											<option value='unlimited'>不限</option>
											<option value='guildV2'>31全型字（巴哈公會2.0）</option>
											<option value='guildV1'>37全型字（飛鳥完美排版）</option>
										</select>
									</span>
								</div>

								<div className='tw-flex tw-justify-start tw-gap-x-2'>
									<span>頭像大小</span>
									<span>
										<select {...register('avatarSize')}>
											<option value='small'>小(28*28px)</option>
											<option value='medium'>中(36*36px)</option>
											<option value='large'>大(48*48px)</option>
											<option value='hidden'>隱藏</option>
										</select>
									</span>
								</div>

								<div className='tw-flex tw-justify-start tw-gap-x-2'>
									<span>頭像形狀</span>
									<span>
										<select {...register('avatarShape')}>
											<option value='circle'>圓形</option>
											<option value='rounded'>圓角</option>
											<option value='square'>方形</option>
										</select>
									</span>
								</div>

								<div className='tw-flex tw-justify-start tw-gap-x-2'>
									<span>頭像邊框顏色</span>
									<span>
										<select {...register('avatarRingColor')}>
											<option value='none'>無</option>
											<option value='#990000'>依玩家顏色</option>
										</select>
									</span>
								</div>

								<div className='tw-flex tw-justify-start tw-gap-x-2'>
									<span>玩家名稱顏色</span>
									<span>
										<select {...register('nameColor')}>
											<option value='none'>純色</option>
											<option value='playerColor'>依玩家顏色</option>
										</select>
									</span>
								</div>

								<div className='tw-flex tw-justify-start tw-gap-x-2'>
									<span>背景顏色</span>
									<span>
										<select {...register('bgColor')}>
											<option value='none'>純色</option>
											<option value='striped'>灰色相間</option>
											<option value='playerColor'>依玩家顏色</option>
										</select>
									</span>
								</div>

								<div className='tw-flex tw-justify-start tw-gap-x-2'>
									<span>留言順序</span>
									<span>
										<select {...register('order')}>
											<option value='asc'>順序</option>
											<option value='desc'>倒序</option>
										</select>
									</span>
								</div>

								<div className='tw-flex tw-justify-start tw-gap-x-2'>
									<span>留言時間</span>
									<span>
										<select {...register('ctime')}>
											<option value='full'>YYYY年MM月DD日 HH:mm:ss</option>
											<option value='short'>MM-DD HH:mm</option>
											<option value='relative'>D分鐘前</option>
											<option value='hidden'>隱藏</option>
										</select>
									</span>
								</div>

								<div className='tw-flex tw-justify-start tw-gap-x-2'>
									<span>讚/噓按鈕</span>
									<span>
										<select {...register('gpbpButtons')}>
											<option value='visible'>顯示</option>
											<option value='hidden'>隱藏</option>
										</select>
									</span>
								</div>
							</div>
						</div>

						<div className='tw-text-right tw-space-x-1'>
							<button className='btn btn-primary' type='submit'>
								儲存設定
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ConfigFormSection;
