import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime';
import { nanoid } from 'nanoid';

dayjs.extend(dayjsRelativeTime);
dayjs.locale('zh-tw');

export const renderTime = (
	time: string,
	format: 'full' | 'short' | 'relative' | 'hidden' | undefined
) => {
	/**
	 * Assume time = YYYY-MM-DD HH:mm:ss
	 */

	if (format === 'full') {
		return time;
	}

	const date = dayjs(time);
	switch (format) {
		case 'short':
			return date.format('MM-DD HH:mm');
		case 'relative':
			return date.fromNow();
		case 'hidden':
			return '';
	}

	return time;
};

export const generateRandomId = () => nanoid(12);
