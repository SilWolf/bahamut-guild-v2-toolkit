/*******************************************************************************************
 *
 *  BHGV2_SaveTheThread - 保存對串
 *  將對串保存起來
 *
 *******************************************************************************************/

import { TPlugin, TPluginConstructor } from '../../types'

const BHGV2_SaveTheThread: TPluginConstructor = (core) => {
  const _plugin: TPlugin = {
    pluginName: 'BHGV2_SaveTheThread',
    prefix: 'BHGV2_SaveTheThread',
    label: '存串',
  }

  _plugin.actions = [
    {
      key: `${_plugin.prefix}:save`,
      label: '保存此串…',
      onClick: (e) => {
        // 彈出「保存此串…」視窗
        alert('彈出視窗')
      },
    },
  ]

  return _plugin
}

export default BHGV2_SaveTheThread
