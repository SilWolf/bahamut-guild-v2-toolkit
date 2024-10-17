import React, { ChangeEvent, useCallback, useEffect, useRef } from 'react';
import {
	TBahaComment,
	TBGTV3Config,
	TBGTV3ConfigForCommentV1,
	TBGTV3ConfigForUsersV1,
	TBGTV3ConfigForUsersV1Value,
} from '../../types';

import styles from './index.module.css';
import { generateColorSchemaFromUrl } from '../../utils/color.util';

const FIELDS: {
	field: keyof TBGTV3Config['comment'];
	label: string;
	options: { label: string; value: string }[];
}[] = [
	{
		field: 'mainWidth',
		label: '寬度',
		options: [
			{ value: 'unlimited', label: '不限' },
			{ value: 'guildV2', label: '31全型字 - 巴哈公會2.0' },
			{ value: 'guildV1', label: '37全型字 - 飛鳥完美排版' },
		],
	},
	{
		field: 'order',
		label: '留言排序',
		options: [
			{ value: 'asc', label: '正序(由最舊到最新)' },
			{ value: 'desc', label: '倒序(由最新到最舊)' },
		],
	},
	{
		field: 'nameColor',
		label: '名稱顏色',
		options: [
			{ value: 'none', label: '正常' },
			{ value: 'userColor', label: '依玩家顏色' },
		],
	},
	{
		field: 'bgColor',
		label: '背景顏色',
		options: [
			{ value: 'none', label: '無' },
			{ value: 'striped', label: '黑白相間' },
			{ value: 'userColor', label: '依玩家顏色' },
		],
	},
	{
		field: 'avatarSize',
		label: '頭像大小',
		options: [
			{ value: 'small', label: '小(28*28px)' },
			{ value: 'medium', label: '預設(36*36px)' },
			{ value: 'large', label: '大(48*48px)' },
			{ value: 'hidden', label: '隱藏' },
		],
	},
	{
		field: 'avatarShape',
		label: '頭像形狀',
		options: [
			{ value: 'circle', label: '圓形' },
			{ value: 'rounded', label: '圓角' },
			{ value: 'square', label: '方形' },
		],
	},
	{
		field: 'fontSize',
		label: '文字大小',
		options: [
			{ value: 'small', label: '小 (12px)' },
			{ value: 'medium', label: '預設 (15px)' },
			{ value: 'large', label: '大 (18px)' },
		],
	},
	{
		field: 'ctime',
		label: '時間格式',
		options: [
			{ value: 'full', label: '2024年01月01日 23:59:59' },
			{ value: 'short', label: '01-01 23:59' },
			{ value: 'relative', label: '1分鐘前' },
			{ value: 'hidden', label: '隱藏' },
		],
	},
];

function FieldSelect({
	value,
	onChangeValue,
	field,
}: {
	field: typeof FIELDS[number];
	value: string;
	onChangeValue: (field: string, value: string) => void;
}) {
	const handleChange = useCallback(
		(e: ChangeEvent<HTMLSelectElement>) => {
			const ele = e.currentTarget as HTMLSelectElement;
			onChangeValue(ele.name, ele.value);
		},
		[onChangeValue]
	);

	return (
		<div className='cd-field'>
			<div className='cd-field-label'>{field.label}</div>
			<div className='cd-field-select'>
				<select
					value={value}
					onChange={handleChange}
					name={field.field}
					id={field.field}
				>
					{field.options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}

export function BGTV3ConfigForCommentDiv({
	commentConfig,
	onChangeValue,
}: {
	commentConfig: TBGTV3ConfigForCommentV1;
	onChangeValue: React.Dispatch<
		React.SetStateAction<TBGTV3ConfigForCommentV1 | undefined>
	>;
}) {
	const handleChangeValue = useCallback(
		(field: string, value: string) => {
			onChangeValue(() => ({
				...commentConfig,
				[field]: value,
			}));
		},
		[commentConfig, onChangeValue]
	);

	return (
		<form className='tw-space-y-6'>
			<div className={styles['bgtv3-config-div']}>
				{FIELDS.map((field) => (
					<FieldSelect
						key={field.field}
						field={field}
						value={commentConfig[field.field]}
						onChangeValue={handleChangeValue}
					/>
				))}
			</div>
		</form>
	);
}

export function BGTV3ConfigForUsersDiv({
	usersConfig,
	onChangeValue,
}: {
	usersConfig: TBGTV3ConfigForUsersV1;
	onChangeValue: React.Dispatch<
		React.SetStateAction<TBGTV3ConfigForUsersV1 | undefined>
	>;
}) {
	return <></>;
}

export function BGTV3ConfigForUsersBot({
	comments,
	usersConfig,
	onChangeValue,
}: {
	comments: TBahaComment[];
	usersConfig: TBGTV3ConfigForUsersV1;
	onChangeValue: React.Dispatch<
		React.SetStateAction<TBGTV3ConfigForUsersV1 | undefined>
	>;
}) {
	const lastSeenCommentId = useRef<string>('');

	useEffect(() => {
		const payloadMap: Record<
			string,
			Pick<TBGTV3ConfigForUsersV1Value, 'id' | 'name' | 'avatarSrc'>
		> = {};

		let i = comments.length - 1;
		while (i >= 0 && comments[i].id > lastSeenCommentId.current) {
			if (!usersConfig[comments[i].userid] && !payloadMap[comments[i].userid]) {
				payloadMap[comments[i].userid] = {
					id: comments[i].userid,
					name: comments[i].name,
					avatarSrc: comments[i].propic,
				};
			}

			i--;
		}

		if (Object.values(payloadMap).length > 0) {
			Promise.all(
				Object.values(payloadMap).map(async (payload) => {
					return {
						...payload,
						...(await generateColorSchemaFromUrl(payload.avatarSrc)),
					};
				})
			).then((newUsers) => {
				onChangeValue((prevUserMap) =>
					newUsers.reduce((prev, curr) => {
						prev[curr.id] = curr;
						return prev;
					}, prevUserMap ?? {})
				);
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comments.length]);

	return <></>;
}
