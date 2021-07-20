export type TCoreConstructor = (props: {
	plugins: TPluginConstructor[]
	library: Record<string, TLibrary>
}) => void

export type TCore = {
	getConfig: () => TCoreConfig
	getConfigByNames: (...names: string[]) => TCoreConfig
	mutateConfig: (newValue: TCoreConfig) => void
	getState: () => TCoreState
	getStateByNames: (...names: string[]) => TCoreState
	mutateState: (newValue: TCoreState) => void
	useLibrary: (name: string, defaultLibraryIfNotFound: unknown) => unknown
	emit: (eventName: string, payload: unknown) => void
	log: (message: string, type: 'log' | 'warn' | 'error') => void
	DOM: Record<string, HTMLElement>

	STATE_KEY: Record<string, string>
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

export type TCoreState = Record<string, unknown>
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
