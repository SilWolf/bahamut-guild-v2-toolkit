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
      defaultValue: false,
    },
  ]

  const asyncUploadFiles = (
    files: (File | null | undefined)[] | FileList
  ): Promise<string[]> => {
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

    return Promise.allSettled(uploadPromises).then(
      (results) =>
        results
          .map((result) =>
            result.status === 'fulfilled' ? result.value.url : undefined
          )
          .filter((url) => !!url) as string[]
    )
  }

  const handlePaste = (e: ClipboardEvent) => {
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
      const editorTextarea = core.DOM.EditorTextarea as HTMLTextAreaElement

      editorTextarea.setAttribute('disabled', 'true')
      editorTextarea.setRangeText(
        '[[上傳圖片中...]]',
        editorTextarea.selectionStart,
        editorTextarea.selectionStart,
        'select'
      )

      asyncUploadFiles(files).then((urls) => {
        editorTextarea.setRangeText(
          urls.map((url) => `${url}\n`).join(''),
          editorTextarea.selectionStart,
          editorTextarea.selectionEnd,
          'end'
        )
        editorTextarea.removeAttribute('disabled')
      })
    }
  }

  const handleDragOver = (e: MouseEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: DragEvent) => {
    if (!e.dataTransfer) {
      return
    }

    console.log(e)

    const files = e.dataTransfer.items
      ? Array.from(e.dataTransfer.items)
          .map((item) => (item.kind === 'file' ? item.getAsFile() : undefined))
          .filter((item) => !!item)
      : e.dataTransfer.files

    console.log(files)

    if (files.length > 0) {
      e.preventDefault()
      const editorTextarea = core.DOM.EditorTextarea as HTMLTextAreaElement

      editorTextarea.setAttribute('disabled', 'true')
      editorTextarea.setRangeText(
        '[[上傳圖片中...]]',
        editorTextarea.selectionStart,
        editorTextarea.selectionStart,
        'select'
      )

      asyncUploadFiles(files).then((urls) => {
        editorTextarea.setRangeText(
          urls.map((url) => `${url}\n`).join(''),
          editorTextarea.selectionStart,
          editorTextarea.selectionEnd,
          'end'
        )
        editorTextarea.removeAttribute('disabled')
      })
    }
  }

  _plugin.onMutateConfig = (newValue) => {
    if (newValue[`${_plugin.prefix}:isEnablePaste`] !== undefined) {
      const editorTextarea = core.DOM.EditorTextarea
      if (editorTextarea) {
        if (newValue[`${_plugin.prefix}:isEnablePaste`] as boolean) {
          editorTextarea.addEventListener('paste', handlePaste)
          core.toggleEditorTip('黏貼圖片: 上傳', true)
        } else {
          editorTextarea.removeEventListener('paste', handlePaste)
          core.toggleEditorTip('黏貼圖片: 上傳', false)
        }

        if (newValue[`${_plugin.prefix}:isEnableDragAndDrop`] as boolean) {
          editorTextarea.addEventListener('dragover', handleDragOver)
          editorTextarea.addEventListener('drop', handleDrop)
          core.toggleEditorTip('拖拉圖片: 上傳', true)
        } else {
          editorTextarea.removeEventListener('dragover', handleDragOver)
          editorTextarea.removeEventListener('drop', handleDrop)
          core.toggleEditorTip('拖拉圖片: 上傳', false)
        }
      }
    }
  }

  return _plugin
}

export default BHGV2_PasteUploadImage
