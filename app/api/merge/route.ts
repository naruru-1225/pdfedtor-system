import { NextRequest, NextResponse } from "next/server";
import { appendPDFs, overlayPDFs, alternatePDFs } from "@/app/utils/pdfUtils";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfA = formData.get("pdfA") as File;
    const pdfB = formData.get("pdfB") as File;
    const mergeType = formData.get("mergeType") as string;
    const overlayDirection = formData.get("overlayDirection") as
      | "horizontal"
      | "vertical";

    if (!pdfA || !pdfB) {
      return NextResponse.json(
        { error: "PDFファイルが指定されていません" },
        { status: 400 }
      );
    }

    const pdfABytes = new Uint8Array(await pdfA.arrayBuffer());
    const pdfBBytes = new Uint8Array(await pdfB.arrayBuffer());

    let resultBytes: Uint8Array;

    switch (mergeType) {
      case "append":
        resultBytes = await appendPDFs(pdfABytes, pdfBBytes);
        break;
      case "overlay":
        resultBytes = await overlayPDFs(
          pdfABytes,
          pdfBBytes,
          overlayDirection || "horizontal"
        );
        break;
      case "alternate":
        resultBytes = await alternatePDFs(pdfABytes, pdfBBytes);
        break;
      default:
        return NextResponse.json(
          { error: "無効な統合タイプです" },
          { status: 400 }
        );
    }

    return new NextResponse(Buffer.from(resultBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="merged.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF統合エラー:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "PDF統合に失敗しました" },
      { status: 500 }
    );
  }
}
