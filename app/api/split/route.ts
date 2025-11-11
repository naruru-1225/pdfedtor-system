import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import {
  parsePageRanges,
  splitPDFByRanges,
  splitPDFByContent,
  splitPDFByAlternate,
} from "@/app/utils/pdfUtils";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdf = formData.get("pdf") as File;
    const splitType = formData.get("splitType") as string;
    const pageRanges = formData.get("pageRanges") as string;
    const contentDirection = formData.get("contentDirection") as
      | "horizontal"
      | "vertical";

    if (!pdf) {
      return NextResponse.json(
        { error: "PDFファイルが指定されていません" },
        { status: 400 }
      );
    }

    const pdfBytes = new Uint8Array(await pdf.arrayBuffer());
    let resultPDFs: Uint8Array[] = [];
    let fileNames: string[] = [];

    switch (splitType) {
      case "pages": {
        if (!pageRanges) {
          return NextResponse.json(
            { error: "ページ範囲が指定されていません" },
            { status: 400 }
          );
        }
        const ranges = parsePageRanges(pageRanges);
        if (ranges.length === 0) {
          return NextResponse.json(
            { error: "無効なページ範囲です" },
            { status: 400 }
          );
        }
        resultPDFs = await splitPDFByRanges(pdfBytes, ranges);
        fileNames = ranges.map((r, i) => `pages_${r[0] + 1}-${r[1] + 1}.pdf`);
        break;
      }
      case "content": {
        resultPDFs = await splitPDFByContent(
          pdfBytes,
          contentDirection || "horizontal"
        );
        fileNames = [
          `${contentDirection === "horizontal" ? "left" : "top"}.pdf`,
          `${contentDirection === "horizontal" ? "right" : "bottom"}.pdf`,
        ];
        break;
      }
      case "alternate": {
        resultPDFs = await splitPDFByAlternate(pdfBytes);
        fileNames = ["odd_pages.pdf", "even_pages.pdf"];
        break;
      }
      default:
        return NextResponse.json(
          { error: "無効な分割タイプです" },
          { status: 400 }
        );
    }

    // ZIPファイルを作成
    const zip = new JSZip();
    resultPDFs.forEach((pdfData, index) => {
      zip.file(fileNames[index], pdfData);
    });

    const zipBlob = await zip.generateAsync({ type: "uint8array" });

    return new NextResponse(Buffer.from(zipBlob), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="split_pdfs.zip"`,
      },
    });
  } catch (error) {
    console.error("PDF分割エラー:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "PDF分割に失敗しました" },
      { status: 500 }
    );
  }
}
