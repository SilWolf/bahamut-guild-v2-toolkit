/*******************************************************************************************
 *
 *  BHGV2_PasteUploadImage - 黏貼上傳圖片
 *  複製貼上圖片時自動上傳至 IMGUR 圖床
 *
 *******************************************************************************************/

import { postImgurImage } from '../../helpers/imgur.helper'
import { TPlugin, TPluginConstructor } from '../../types'

const BHGV2_PasteUploadImage: TPluginConstructor = (core) => {
  const _plugin: TPlugin = {
    pluginName: 'BHGV2_PasteUploadImage',
    prefix: 'BHGV2_PasteUploadImage',
    label: '黏貼上傳圖片',
  }

  _plugin.configs = [
    {
      key: `${_plugin.prefix}:isEnablePaste`,
      suffixLabel: '啟用黏貼上傳圖片',
      dataType: 'boolean',
      inputType: 'switch',
      defaultValue: true,
    },
    {
      key: `${_plugin.prefix}:isEnableDragAndDrop`,
      suffixLabel: '啟用拖拉上傳圖片',
      dataType: 'boolean',
      inputType: 'switch',
      defaultValue: true,
    },
  ]

  const handleOnPaste = (e: ClipboardEvent) => {
    if (!e.clipboardData) {
      return
    }

    const files = e.clipboardData.items
      ? Array.from(e.clipboardData.items)
          .map((item) => (item.kind === 'file' ? item.getAsFile() : undefined))
          .filter((item) => !!item)
      : e.clipboardData.files

    if (files.length > 0) {
      e.preventDefault()
      const editorTextarea = e.target as HTMLTextAreaElement
      const uploadPromises: Promise<{ url: string }>[] = []

      for (let i = 0; i < files.length; i++) {
        if (!files[i]) {
          continue
        }

        const file = files[i]
        if (file && file.type.startsWith('image/')) {
          uploadPromises.push(
            new Promise((res, rej) => {
              postImgurImage(file)
                .then(({ link }) => {
                  return res({ url: link })
                })
                .catch((err) => {
                  return rej(err)
                })
            })
          )
        }
      }

      if (uploadPromises.length > 0) {
        editorTextarea.setAttribute('disabled', 'true')
        editorTextarea.setRangeText(
          '[[上傳圖片中...]]',
          editorTextarea.selectionStart,
          editorTextarea.selectionStart,
          'select'
        )

        Promise.allSettled(uploadPromises).then((results) => {
          const urlTexts = results
            .map((result) =>
              result.status === 'fulfilled'
                ? `${result.value.url}\n`
                : undefined
            )
            .filter((url) => !!url)
            .join('')
          editorTextarea.setRangeText(
            urlTexts,
            editorTextarea.selectionStart,
            editorTextarea.selectionEnd,
            'end'
          )
          editorTextarea.removeAttribute('disabled')
        })
      }
    }
  }

  _plugin.onMutateConfig = (newValue) => {
    if (newValue[`${_plugin.prefix}:isEnablePaste`] !== undefined) {
      const editorTextarea = core.DOM.EditorTextarea
      if (editorTextarea) {
        if (newValue[`${_plugin.prefix}:isEnablePaste`] as boolean) {
          editorTextarea.addEventListener('paste', handleOnPaste)
        } else {
          editorTextarea.removeEventListener('paste', handleOnPaste)
        }
      }
    }
  }

  return _plugin
}

export default BHGV2_PasteUploadImage
