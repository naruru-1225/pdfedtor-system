"use client";

import { useState, DragEvent } from "react";

type SplitType = "pages" | "content" | "alternate";
type ContentDirection = "horizontal" | "vertical";

export default function SplitTab() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [splitType, setSplitType] = useState<SplitType>("pages");
  const [pageRanges, setPageRanges] = useState<string>("");
  const [contentDirection, setContentDirection] =
    useState<ContentDirection>("horizontal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setPdf(file);
      } else {
        setError("PDFファイルのみアップロード可能です");
      }
    }
  };

  const handleSplit = async () => {
    if (!pdf) {
      setError("PDFファイルを選択してください");
      return;
    }

    if (splitType === "pages" && !pageRanges.trim()) {
      setError("ページ範囲を指定してください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("pdf", pdf);
      formData.append("splitType", splitType);
      if (splitType === "pages") {
        formData.append("pageRanges", pageRanges);
      } else if (splitType === "content") {
        formData.append("contentDirection", contentDirection);
      }

      const response = await fetch("/api/split", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "分割に失敗しました");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `split_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          PDF分割
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          PDFファイルを複数のファイルに分割します
        </p>
      </div>

      {/* ファイル選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          PDFファイル
        </label>
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : pdf
              ? "border-green-500 bg-green-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setPdf(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="pointer-events-none">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {pdf ? (
              <p className="mt-2 text-sm text-green-700 font-medium">
                ✓ {pdf.name}
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-gray-600">
                  ドラッグ&ドロップまたはクリックしてファイルを選択
                </p>
                <p className="text-xs text-gray-500">PDF形式のみ</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 分割方法選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          分割方法
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="splitType"
              value="pages"
              checked={splitType === "pages"}
              onChange={(e) => setSplitType(e.target.value as SplitType)}
              className="w-4 h-4 text-blue-600"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                ページ範囲で分割
              </div>
              <div className="text-sm text-gray-500">
                任意のページ範囲で複数のファイルに分割
              </div>
            </div>
          </label>

          {splitType === "pages" && (
            <div className="ml-7 mt-2">
              <input
                type="text"
                value={pageRanges}
                onChange={(e) => setPageRanges(e.target.value)}
                placeholder="例: 1-3,4-8,9-13"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                カンマ区切りでページ範囲を指定 (例: 1-3,4-8,9-13)
              </p>
            </div>
          )}

          <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="splitType"
              value="content"
              checked={splitType === "content"}
              onChange={(e) => setSplitType(e.target.value as SplitType)}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <div className="font-medium text-gray-900">
                内容を半分に分割
              </div>
              <div className="text-sm text-gray-500">
                各ページを横方向または縦方向に半分に分割
              </div>
            </div>
          </label>

          {splitType === "content" && (
            <div className="ml-7 mt-2 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="contentDirection"
                  value="horizontal"
                  checked={contentDirection === "horizontal"}
                  onChange={(e) =>
                    setContentDirection(e.target.value as ContentDirection)
                  }
                  className="w-3 h-3 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">
                  横方向
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="contentDirection"
                  value="vertical"
                  checked={contentDirection === "vertical"}
                  onChange={(e) =>
                    setContentDirection(e.target.value as ContentDirection)
                  }
                  className="w-3 h-3 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">
                  縦方向
                </span>
              </label>
            </div>
          )}

          <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="splitType"
              value="alternate"
              checked={splitType === "alternate"}
              onChange={(e) => setSplitType(e.target.value as SplitType)}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <div className="font-medium text-gray-900">
                奇数・偶数ページで分割
              </div>
              <div className="text-sm text-gray-500">
                奇数ページと偶数ページを別ファイルに分割
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* 実行ボタン */}
      <button
        onClick={handleSplit}
        disabled={loading || !pdf}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        {loading ? "処理中..." : "分割を実行"}
      </button>
    </div>
  );
}
