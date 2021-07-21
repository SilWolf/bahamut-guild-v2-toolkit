export type TCoreConstructor = (props: {
	plugins: TPluginConstructor[]
	library: Record<string, TLibrary>
}) => TCore

export type TCore = {
	getConfig: () => TCoreConfig
	getConfigByNames: (...names: string[]) => TCoreConfig
	mutateConfig: (newValue: TCoreConfig) => void
	getState: () => TCoreState
	getStateByNames: (...names: TCoreStateKey[]) => TCoreState
	mutateState: (newValue: TCoreState) => void
	commentsMap: Record<string, TCoreStateComment>
	useLibrary: (name: string, defaultLibraryIfNotFound: unknown) => unknown
	emit: (eventName: string, payload: unknown) => void
	log: (message: string, type: 'log' | 'warn' | 'error') => void
	DOM: Record<string, HTMLElement>
}

export type TPluginConstructor = (core: TCore) => TPlugin

export type TPlugin = {
	pluginName: string
	prefix: string
	configs?: TPluginConfig[]
	configLayout?: string[][]
	onEvent?: (eventName: string, payload: unknown) => void
	onMutateState?: (newValue: TCoreState) => void
	onMutateConfig?: (newValue: TCoreConfig) => void
	css?: string[]
}

export type TCoreState = {
	gsn?: number
	sn?: number
	postApi?: string
	commentListApi?: string
	latestComments?: TCoreStateComment[]
	isInit?: boolean
	commentsCount?: number
	userInfo?: any
}
export type TCoreStateKey = keyof TCoreState
export type TCoreStateComment = {
	id: string
	payload?: TComment
	element?: Element | undefined
}

export type TCoreConfig = Record<string, TPluginConfigValue>

export type TPluginConfig = {
	key: string
	prefixLabel?: string
	suffixLabel?: string
	dataType: TPluginConfigDataType
	inputType: TPluginConfigInputType
	defaultValue: TPluginConfigValue
}
export type TPluginConfigDataType = 'boolean' | 'number' | 'text'
export type TPluginConfigInputType = 'switch' | 'checkbox' | 'number' | 'text'
export type TPluginConfigValue = boolean | number | string | undefined

export type TLibrary = unknown

export type TCommentsListApiResponse = {
	data: {
		commentCount: number
		comments: TComment[]
		nextPage: number
		publisher: {
			name: string
			id: string
		}
		to: {
			name: string
			id: string
			gsn: number
			privateType: number
		}
		totalPage: number
	}
}

export type TComment = {
	text: string
	id: string
	children: number
	likeCount: number
	dislikeCount: number
	isLike: number
	commentCount: string
	image: unknown[]
	mentions: TCommentMention[]
	tags: unknown[]
	time: string
	ctime: string
	name: string
	userid: string
	canCheckIn: number
	fansAvatar: string
	propic: string
	type: number
	editable: boolean
	deletable: boolean
	urlPreview: {
		urlLink: string
	}
	contentImages: string[]
	position: number
}

export type TCommentMention = {
	id: string
	offset: string
	length: string
}
