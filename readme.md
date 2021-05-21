## 巴哈公會 2.0 哈拉插件

### 版本號

0.2.0 (2021-05-21)

### 安裝說明 (適用於 Chrome/Firefox)

1. 下載並安裝 **Tampermonkey 瀏覽器插件**

- Chrome 版本下載連結: [https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=zh-TW](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=zh-TW)
- Firebox 版本下載連結: [https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

2. 打開 Tampermonkey 的控制台
3. 點擊上方的分頁「匯入匯出工具」，在「自 URL 安裝」的文字框中，填入 `https://raw.githubusercontent.com/SilWolf/bahamut-guild-v2-toolkit/main/index.js` ，然後點擊「安裝」。
   ![](https://i.imgur.com/GXLzzkp.png)
4. 完成安裝步驟後，點擊上方的分頁「已安裝的使用者腳本」，如果見到了 `Bahamut Guild V2 Toolkits` 就代表安裝成功。沒有見到的話，重新載入一下此頁面。
   ![](https://i.imgur.com/LP5dQid.png)

### 功能 (目前版本 v0.2.0)

絕大部分可開關的功能和設置，均在輸入框下的「插件設定」中。

#### 自動更新 (v0.1.0+)

在若干秒數後自動更新。適用於公會串的內頁 (`post_detail.php`) 。

- 插件會讀取最新的留言，並插進串尾。與一般的 F5 更新相比，這過程是自動的且更流暢
- 如果插件偵察到曾有回覆被刪除，就會自動刷新整串，過程中可能會有輕微的卡頓
- 更新間隔最少 1 秒、最長 9999 秒

#### 設為預設值 (v0.2.0+)

將設定儲存為預設值，並套用至所有對串中。

#### 自動更新的桌面通知及聲音 (v0.2.0+)

當串有更新時發出桌面通知。須配合自動更新一同使用。

#### 哈拉串顛倒 (v0.2.0+)

倒轉哈拉串，使最新訊息和輸入框在最上方。

### 待辦

- [x] 設為預設值
- [x] 自動更新的桌面通知及聲音
- [ ] 標題顯示通知數目
- [ ] 標題顯示串有新訊息
- [x] 哈拉串顛倒
- [ ] 快速輸入內容
- [ ] 預先回覆
- [ ] 提及我高亮
- [ ] 新訊息高亮
- [ ] 倒數器
- [ ] 一般介面/黑暗介面模式
- [ ] 歡迎更多意見～！

### 協議

MIT
