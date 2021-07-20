import { TEvent } from './general.type'
import { TPluginConfiguration } from './plugin.type'

type TCore = {
	useLibrary: (libraryName: string, defaultIfNotFounded?: object) => object
	emit: TEvent
	getConfig: (name: string) => boolean | number | undefined
	setConfig: (name: string, value: boolean | number) => void
}

export default TCore
