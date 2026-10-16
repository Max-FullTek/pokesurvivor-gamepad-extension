# 開發者指南

<p><a href="dev.md">English</a> · <a href="dev.es.md">Español</a> · <strong>繁體中文</strong></p>

[使用者指南](../README.zh-Hant.md)

從原始碼建置、測試與封裝擴充元件。安裝與日常操作請參閱使用者指南。

## 建置與驗證

需要 Node.js 20 以上版本與 npm。

```sh
npm ci
npm test
npm run build
npm run test:built
npm audit
```

輸出為 `dist/controller-extension`。原始碼的 `extension/` 資料夾本身不是完整可載入版本。請依[使用者安裝說明](../README.zh-Hant.md#安裝)載入建置後的資料夾。散布時請壓縮建置後的資料夾；建置指令不會產生 ZIP。`dist/` 與 `node_modules/` 已排除於 Git。

測試使用模擬手把與 DOM 互動，不能取代實體手把驗收。`npm audit` 檢查已知依賴漏洞，不代表安全保證。

## 專案結構

| 路徑 | 用途 |
| --- | --- |
| `extension/` | 網站接合程式、工具列選單、manifest 與圖示 |
| `js/` 與 `css/` | 手把引擎、偏好設定與設定介面 |
| `assets/controllers/` | 內附的手把底圖與授權 |
| `tools/` | 建置與建置版本測試執行程式 |
| `tests/` | 模擬手把與 DOM 互動測試 |

## 實作細節

- 唯一宣告的權限是 `storage`，內容腳本在原作者遊戲的支援頁面，以隔離環境執行。
- 按鍵配置儲存在網站 localStorage 的 `ps.controller.v1`；啟用狀態與語言儲存在 `chrome.storage.local`。網站可存取自己的 localStorage，且內容未加密，請勿放入機密資訊。
- 工具列選單透過擴充元件訊息取得目前分頁的遊戲語言。未刻意讀取或修改 Cookie、瀏覽紀錄、帳號憑證或遊戲存檔。

兩份指南均以英文為主稿，西班牙文與繁體中文依同一內容翻譯。
