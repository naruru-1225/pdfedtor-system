"use client";

import { useState, DragEvent } from "react";

type MergeType = "append" | "overlay" | "alternate";
type OverlayDirection = "horizontal" | "vertical";

export default function MergeTab() {
  const [pdfA, setPdfA] = useState<File | null>(null);
  const [pdfB, setPdfB] = useState<File | null>(null);
  const [mergeType, setMergeType] = useState<MergeType>("append");
  const [overlayDirection, setOverlayDirection] =
    useState<OverlayDirection>("horizontal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [dragOverA, setDragOverA] = useState(false);
  const [dragOverB, setDragOverB] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>, target: "A" | "B") => {
    e.preventDefault();
    e.stopPropagation();
    if (target === "A") {
      setDragOverA(true);
    } else {
      setDragOverB(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>, target: "A" | "B") => {
    e.preventDefault();
    e.stopPropagation();
    if (target === "A") {
      setDragOverA(false);
    } else {
      setDragOverB(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, target: "A" | "B") => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverA(false);
    setDragOverB(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        if (target === "A") {
          setPdfA(file);
        } else {
          setPdfB(file);
        }
      } else {
        setError("PDFファイルのみアップロード可能です");
      }
    }
  };

  const handleMerge = async () => {
    if (!pdfA || !pdfB) {
      setError("2つのPDFファイルを選択してください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("pdfA", pdfA);
      formData.append("pdfB", pdfB);
      formData.append("mergeType", mergeType);
      if (mergeType === "overlay") {
        formData.append("overlayDirection", overlayDirection);
      }

      const response = await fetch("/api/merge", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "統合に失敗しました");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `merged_${Date.now()}.pdf`;
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
          PDF統合
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          2つのPDFファイルを統合します
        </p>
      </div>

      {/* ファイル選択 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF A (1つ目のPDF)
          </label>
          <div
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, "A")}
            onDragLeave={(e) => handleDragLeave(e, "A")}
            onDrop={(e) => handleDrop(e, "A")}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOverA
                ? "border-blue-500 bg-blue-50"
                : pdfA
                ? "border-green-500 bg-green-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400"
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfA(e.target.files?.[0] || null)}
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
              {pdfA ? (
                <p className="mt-2 text-sm text-green-700 font-medium">
                  ✓ {pdfA.name}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF B (2つ目のPDF)
          </label>
          <div
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, "B")}
            onDragLeave={(e) => handleDragLeave(e, "B")}
            onDrop={(e) => handleDrop(e, "B")}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOverB
                ? "border-blue-500 bg-blue-50"
                : pdfB
                ? "border-green-500 bg-green-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400"
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfB(e.target.files?.[0] || null)}
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
              {pdfB ? (
                <p className="mt-2 text-sm text-green-700 font-medium">
                  ✓ {pdfB.name}
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
      </div>

      {/* 統合方法選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          統合方法
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="mergeType"
              value="append"
              checked={mergeType === "append"}
              onChange={(e) => setMergeType(e.target.value as MergeType)}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <div className="font-medium text-gray-900">
                末尾に結合
              </div>
              <div className="text-sm text-gray-500">
                PDF_Aの末尾にPDF_Bを追加
              </div>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="mergeType"
              value="overlay"
              checked={mergeType === "overlay"}
              onChange={(e) => setMergeType(e.target.value as MergeType)}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <div className="font-medium text-gray-900">
                内容を重ねて結合
              </div>
              <div className="text-sm text-gray-500">
                PDF_AとPDF_Bを横方向または縦方向に並べる
              </div>
            </div>
          </label>

          {mergeType === "overlay" && (
            <div className="ml-7 mt-2 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="overlayDirection"
                  value="horizontal"
                  checked={overlayDirection === "horizontal"}
                  onChange={(e) =>
                    setOverlayDirection(e.target.value as OverlayDirection)
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
                  name="overlayDirection"
                  value="vertical"
                  checked={overlayDirection === "vertical"}
                  onChange={(e) =>
                    setOverlayDirection(e.target.value as OverlayDirection)
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
              name="mergeType"
              value="alternate"
              checked={mergeType === "alternate"}
              onChange={(e) => setMergeType(e.target.value as MergeType)}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <div className="font-medium text-gray-900">
                交互に結合
              </div>
              <div className="text-sm text-gray-500">
                PDF_AとPDF_Bのページを1ページずつ交互に配置
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
        onClick={handleMerge}
        disabled={loading || !pdfA || !pdfB}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        {loading ? "処理中..." : "統合を実行"}
      </button>
    </div>
  );
}
