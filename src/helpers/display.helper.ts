export const convertCTimeToHumanString = (ctime: string): string => {
	const date = new Date(ctime)
	if (!date) {
		return ctime
	}

	const deltaSeconds = (Date.now() - date.getTime()) / 1000

	if (deltaSeconds < 3600) {
		return `${Math.floor(deltaSeconds / 60)}分鐘`
	} else if (deltaSeconds < 86400) {
		return `${Math.floor(deltaSeconds / 3600)}小時`
	}

	return `${(date.getMonth() + 1).toString().padStart(2, '0')}月${date
		.getDate()
		.toString()
		.padStart(2, '0')}日 ${date.getHours().toString().padStart(2, '0')}:${date
		.getMinutes()
		.toString()
		.padStart(2, '0')}`
}
