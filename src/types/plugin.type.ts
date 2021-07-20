import TCore from './core.type'

export type TPluginConfiguration = {
	label: string
	key: string
	type: 'boolean' | 'number'
	defaultValue: boolean | number
}

export type TPluginContent = {
	prefix: string
	configurations?: TPluginConfiguration[]
	on?: (eventName: string, payload: Record<string, unknown>) => void
}

type TPlugin = (core: TCore) => TPluginContent

export default TPlugin
