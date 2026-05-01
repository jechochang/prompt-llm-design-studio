# Prompt LLM Design Studio

公開網站版：AI 建築／室內／景觀圖板 Prompt 生成器。

## 網站內容

這是一個純前端靜態網站，可用於：

- 建築、室內、景觀設計圖板 Prompt 生成
- 抽象參考圖轉譯規則設定
- 圖板分區、材料、風格、生成參數整合
- 輸出完整 Prompt、負面 Prompt、JSON 規格
- 支援繁體中文／英文 UI
- 支援瀏覽器本機歷史生成紀錄

## 檔案結構

```text
index.html
prompt-llm-design02-studio-poster-v2.js
.nojekyll
README.md
.github/workflows/pages.yml
```

## GitHub Pages

本倉庫已加入 GitHub Pages Actions workflow。

若尚未自動發布，請到：

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

完成後網站網址通常為：

```text
https://jechochang.github.io/prompt-llm-design-studio/
```

## Deployment

The site is a static HTML + JavaScript application. No backend, database, or build step is required.
