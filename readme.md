## 巴哈公會 2.0 哈拉插件

### 版本號

0.8.0 (2021-11-13)

### 安裝說明 (適用於 Chrome/Firefox)

1. 下載並安裝 **Tampermonkey 瀏覽器插件**

- Chrome 版本下載連結: [https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=zh-TW](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=zh-TW)
- Firebox 版本下載連結: [https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

#### 自動安裝

2. 點擊以下連結，Tampermonkey 將開啟安裝畫面： [安裝連結](https://raw.githubusercontent.com/SilWolf/bahamut-guild-v2-toolkit/main/dist/bahamut-guild-v2-toolkit.user.js)
3. 點擊安裝即可安裝完畢，進入 Tampermonkey 的控制台，如果見到了 Bahamut Guild V2 Toolkits 就代表安裝成功。

#### 手動安裝

2. 打開 Tampermonkey 的控制台
3. 點擊上方的分頁「匯入匯出工具」，在「自 URL 安裝」的文字框中，填入 `https://raw.githubusercontent.com/SilWolf/bahamut-guild-v2-toolkit/main/bahamut-guild-v2-toolkits.user.js` ，然後點擊「安裝」。
   ![](https://i.imgur.com/GXLzzkp.png)
4. 完成安裝步驟後，點擊上方的分頁「已安裝的使用者腳本」，如果見到了 `Bahamut Guild V2 Toolkits` 就代表安裝成功。沒有見到的話，重新載入一下此頁面。
   ![](https://i.imgur.com/LP5dQid.png)

### 功能 (目前版本 v0.5.0)

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

#### 標題顯示通知數目 (v0.2.0+)

將通知的數量顯示於標題上。

#### 提及我高亮 (v0.3.0+)

將提及我的訊息以紅色閃爍表示，點一下訊息即可消除。

#### 標題閃爍串有新訊息 (v0.3.0+)

在新訊息出現時閃爍標題，點擊頁面即可解除，此功能適用於自動更新與隨附的兩分鐘背景更新。

#### 新訊息高亮 (v0.3.0+)

在自動更新中有新訊息出現時以綠色閃爍表示，點擊頁面即可解除。

#### 一般介面/黑暗介面模式 (v0.3.0+)

修改頁面配色，使其能配合黑暗介面模式。

#### Debug Mode (v0.3.0+)

於公會導覽列新增一個 Debug 按鈕，目前功能為顯示全域變數(GLOBLE_CONFIG)狀態

#### 快速輸入 (v0.5.0+)

以類似 @Mention 的方式快速輸入預設內容

### 開發用指令

```
yarn
yarn dev
yarn build
```

### 待辦

- [x] 設為預設值
- [x] 自動更新的桌面通知及聲音
- [x] 標題顯示通知數目
- [x] 標題顯示串有新訊息
- [x] 哈拉串顛倒
- [x] 快速輸入內容
- [ ] 預先回覆
- [x] 提及我高亮
- [x] 新訊息高亮
- [ ] 倒數器
- [x] 一般介面/黑暗介面模式
- [x] Debug Mode
- [ ] 歡迎更多意見～！

### 協議

MIT
