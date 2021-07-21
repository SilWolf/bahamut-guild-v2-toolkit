type TNotification = {
	title?: string
	text?: string
	image?: string
	highlight?: string
	silent?: boolean
	timeout?: number
	ondone?: () => {}
	onclick?: () => {}
}

export const createNotification = (options: TNotification) => {
	const _options = {
		silent: false,
		...options,
	}
	GM_notification(_options)
}
