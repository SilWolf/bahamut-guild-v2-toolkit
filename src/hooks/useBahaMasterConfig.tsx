import { useLocalStorage } from 'react-use';
import {
	LS_KEY_BGT_V3_COMMENT_CONFIG,
	LS_KEY_BGT_V3_USERS_CONFIG,
} from '../constant';
import {
	BGT_V3_COMMENT_CONFIG_DEFAULT_VALUE,
	BGT_V3_USERS_CONFIG_DEFAULT_VALUE,
	TBGTV3Config,
} from '../types';
import { useCallback, useMemo } from 'react';

export default function useBGTV3Configs() {
	const [commentConfig, setCommentConfig] = useLocalStorage(
		LS_KEY_BGT_V3_COMMENT_CONFIG,
		BGT_V3_COMMENT_CONFIG_DEFAULT_VALUE
	);
	const [usersConfig, setUsersConfig] = useLocalStorage(
		LS_KEY_BGT_V3_USERS_CONFIG,
		BGT_V3_USERS_CONFIG_DEFAULT_VALUE
	);

	const bgtV3Config: TBGTV3Config = useMemo(
		() => ({
			version: 1,
			comment: commentConfig || BGT_V3_COMMENT_CONFIG_DEFAULT_VALUE,
			users: usersConfig || BGT_V3_USERS_CONFIG_DEFAULT_VALUE,
		}),
		[commentConfig, usersConfig]
	);

	const setBGTV3Config: React.Dispatch<
		React.SetStateAction<TBGTV3Config | undefined>
	> = useCallback(
		(newValueOrFn) => {
			const newValue =
				typeof newValueOrFn === 'function'
					? newValueOrFn(bgtV3Config)
					: newValueOrFn;

			if (!newValue) {
				return;
			}

			setCommentConfig(newValue.comment);
			setUsersConfig(newValue.users);
		},
		[bgtV3Config, setCommentConfig, setUsersConfig]
	);

	return {
		bgtV3Config,
		setBGTV3Config,
		commentConfig,
		usersConfig,
		setCommentConfig,
		setUsersConfig,
	};
}
