"use client";

import { useState } from "react";
import MergeTab from "./components/MergeTab";
import SplitTab from "./components/SplitTab";

type Tab = "merge" | "split";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("merge");

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PDF Editor
          </h1>
          <p className="text-gray-600">
            PDFの統合・分割を簡単に行えます
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* タブナビゲーション */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("merge")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "merge"
                  ? "bg-blue-500 text-white border-b-2 border-blue-500"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              統合
            </button>
            <button
              onClick={() => setActiveTab("split")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "split"
                  ? "bg-blue-500 text-white border-b-2 border-blue-500"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              分割
            </button>
          </div>

          {/* タブコンテンツ */}
          <div className="p-6">
            {activeTab === "merge" ? <MergeTab /> : <SplitTab />}
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>LAN環境専用 - シンプルなPDF編集ツール</p>
        </footer>
      </div>
    </div>
  );
}
