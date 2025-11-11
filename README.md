# PDF Editor

Next.jsで構築されたシンプルなPDF編集ツールです。LAN環境での使用を想定しています。

## 機能

### PDF統合
2つのPDFファイルを統合する3つの方法:
1. **末尾に結合** - PDF_Aの末尾にPDF_Bを追加
2. **内容を重ねて結合** - PDF_AとPDF_Bを横方向または縦方向に並べる
3. **交互に結合** - PDF_AとPDF_Bのページを1ページずつ交互に配置

### PDF分割
PDFファイルを分割する3つの方法:
1. **ページ範囲で分割** - 任意のページ範囲で複数のファイルに分割 (例: 1-3,4-8,9-13)
2. **内容を半分に分割** - 各ページを横方向または縦方向に半分に分割
3. **奇数・偶数ページで分割** - 奇数ページと偶数ページを別ファイルに分割

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番環境での起動
npm start
```

## 技術スタック

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- pdf-lib (PDF処理)
- JSZip (ZIP作成)

## 使用方法

1. ブラウザで `http://localhost:3000` にアクセス
2. 「統合」または「分割」タブを選択
3. PDFファイルをアップロード
4. 処理方法を選択
5. 「統合を実行」または「分割を実行」ボタンをクリック
6. 処理されたファイルが自動的にダウンロードされます

## 注意事項

- このアプリケーションはLAN環境での使用を想定しています
- 大きなPDFファイルの処理には時間がかかる場合があります
- すべての処理はブラウザとサーバー間で行われ、データは保存されません

## PDF最適化

出力されるPDFファイルには以下の最適化が適用されています：

- **ファイルサイズの最適化**: 不要なオブジェクトストリームを削除
- **メタデータの最適化**: 更新不要なメタデータを除外
- **暗号化の柔軟な処理**: 暗号化されたPDFも処理可能
- **効率的なページコピー**: メモリ使用量を抑えた処理

これらの最適化により、元のPDFファイルと比較してファイルサイズが大幅に削減される場合があります。


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
