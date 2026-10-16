<p align="center"><img src="extension/icon-128.png" width="80" height="80" alt="手把擴充元件圖示"></p>
<h1 align="center">PokéSurvivor Gamepad Extension</h1>
<p align="center"><a href="README.md">English</a> · <a href="README.es.md">Español</a> · <strong>繁體中文</strong></p>

<p align="center">用手把玩 PokéSurvivor，設定適合自己的操作方式。</p>

適用於[原作者遊戲網站](https://pokesurvivor.com/)的非官方 Chrome／Edge 擴充元件，提供自訂按鍵、設定精靈與搖桿校正，由社群獨立維護。

[安裝](#安裝) · [功能](#功能) · [操作](#操作) · [隱私與安全](#隱私與安全) · [開發者指南](docs/dev.zh-Hant.md) · [授權與免責聲明](#授權與免責聲明)

[下載擴充元件 ZIP](https://github.com/Max-FullTek/pokesurvivor-gamepad-extension/releases/latest) · [安裝方式](#安裝)

## 安裝

1. 開啟 [Releases](https://github.com/Max-FullTek/pokesurvivor-gamepad-extension/releases/latest)，在 **Assets** 下載 **PokeSurvivor-Gamepad-v0.6.10.zip**，解壓縮至固定資料夾。GitHub 自動產生的 **Source code (zip)**／**Download ZIP** 是原始碼，需先依[開發者指南建置](docs/dev.zh-Hant.md)。
2. 開啟 `chrome://extensions` 或 `edge://extensions`，啟用「開發人員模式」。
3. 選擇「載入解壓縮擴充功能」，指定解壓縮後含 `manifest.json` 的 `controller-extension` 資料夾。
4. 開啟或重新整理 [PokéSurvivor](https://pokesurvivor.com/)，連接手把並按一下按鈕。
5. 在遊戲「設定 → 操作 → 電腦 → 手把操作 → 手把設定」開啟設定。啟用開關與介面語言位於擴充元件工具列選單。

安裝後請保留解壓縮資料夾。更新時，下載新版並替換同一資料夾的檔案，先在擴充功能頁重新載入元件，再重整遊戲頁面；更新需手動安裝。不使用時可關閉工具列開關，或在瀏覽器停用／移除元件。

## 功能

- 遊戲與選單使用獨立的按鍵配置，提供逐步引導的設定精靈。
- 左右搖桿校正、防飄移範圍調整與移動模式選擇。
- 英文、西班牙文、繁體中文介面；自動模式跟隨遊戲語言，無法判斷時使用英文。
- 工具列開關可停用手把支援，並保留設定。

> 語言選擇只影響本擴充元件。遊戲顯示繁體中文需另裝[繁中翻譯擴充元件](https://github.com/q86865511/pokesurvivor-zh-hant/tree/main/pokesurvivor-zh-ext)，本專案未內附翻譯元件。

## 操作

| 輸入（依 Xbox 按鍵位置） | 預設功能 |
| --- | --- |
| 左搖桿／十字鍵 | 移動；選單導航 |
| A／B／X／Y | 招式 3／2／4／1 |
| 右搖桿 | 四方向選招式 |
| LB／RB | 上一招／下一招 |
| Start | 暫停／返回 |
| 選單內 A／B | 確認／返回 |
| 升級選單內 X | 重抽卡牌 |

點選手把圖上的按鍵即可更改功能，也可使用「設定精靈」。按「儲存」才套用修改；「取消」保留原設定。搖桿推動與搖桿按下分開設定，不使用 Guide／Xbox 系統鍵。

僅支援瀏覽器辨識為 `standard` mapping 的手把，所有支援手把均以 Xbox 按鍵位置示意。在原作者網站，移動會轉成八方向鍵盤輸入，不含類比速度。網站更新可能影響相容性；偵測到指定的原生手把支援標記時，會優先讓原生功能接手。

## 隱私與安全

- 唯一宣告的權限是 `storage`，元件只在原作者遊戲的支援頁面執行。
- 未實作分析追蹤、遙測、遠端腳本載入或背景資料上傳。相關連結只在點擊後開啟。
- 元件讀取手把輸入，並暫時追蹤按住的鍵盤按鍵，避免干擾鍵盤操作。不記錄輸入文字，也不儲存鍵盤歷史。
- 按鍵配置儲存在遊戲網站本機資料中；啟用狀態與介面語言儲存在擴充元件本機資料中。網站可存取自己的設定資料，且內容未加密。
- 工具列選單會查詢目前遊戲分頁的語言。未刻意讀取或修改 Cookie、瀏覽紀錄、帳號憑證或遊戲存檔。

請使用可信來源的版本。依賴掃描無警報不代表安全保證。一般問題可提交至本專案 [Issues](https://github.com/Max-FullTek/pokesurvivor-gamepad-extension/issues)。請勿公開密碼、權杖、存檔、個人路徑或可利用的漏洞細節。若 Repo 提供 **Security → Report a vulnerability**，請使用該私人通報管道；否則先詢問私人聯絡方式，不要先公開漏洞內容。

原始碼建置、測試指令與專案結構請參閱[開發者指南](docs/dev.zh-Hant.md)。

## 授權與免責聲明

**原始碼公開，限依授權作非商業使用。** 程式碼保留上游 [PolyForm Noncommercial 1.0.0 條款](LICENSE-NONCOMMERCIAL.md) 與[授權聲明](LICENSE)。重新散布時需保留適用條款、必要聲明及第三方來源標示；公開原始碼不代表可無限制商業使用。Controllercons 手把圖與改作的 Lucide 圖示使用各自的授權，詳見 [CREDITS.md](CREDITS.md)。保留的上游 LICENSE 另描述歷史授權及本元件未包含的遊戲素材。

本專案為非官方社群作品，與原遊戲作者、Nintendo、Creatures Inc.、GAME FREAK、The Pokémon Company、Microsoft 或其他平台／手把供應商無隸屬、背書或贊助關係。遊戲程式、圖像、名稱與商標權利歸各權利人所有，本專案未授予第三方品牌或遊戲內容的使用授權。

在適用法律允許的範圍內，軟體依「現狀」提供，不保證相容性、可用性、安全性或特定用途適用性。瀏覽器或網站變更可能導致功能中斷。責任限制僅在適用法律與授權條款允許的範圍內生效，不排除法定不得拋棄的權利，也不取代授權義務。

若對權利歸屬或授權有疑慮，請透過 Repo 聯絡維護者，避免公開私人資訊。上述內容為專案說明，不取代完整授權條款；翻譯若與授權條款不一致，以授權原文為準。

## 相關專案

1. [原作者遊戲網站](https://pokesurvivor.com/)
2. [原作者遊戲 Repo — JPTER78](https://github.com/JPTER78/pokesurvivor)
3. [繁體中文翻譯擴充元件](https://github.com/q86865511/pokesurvivor-zh-hant/tree/main/pokesurvivor-zh-ext)
4. [本擴充元件 Repo](https://github.com/Max-FullTek/pokesurvivor-gamepad-extension)
