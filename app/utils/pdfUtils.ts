import { PDFDocument } from "pdf-lib";

/**
 * PDFを最適化して読み込む
 */
async function loadPDFOptimized(pdfBytes: Uint8Array): Promise<PDFDocument> {
  return await PDFDocument.load(pdfBytes, { 
    ignoreEncryption: true,
    updateMetadata: false 
  });
}

/**
 * PDFを最適化して保存
 */
async function savePDFOptimized(pdf: PDFDocument): Promise<Uint8Array> {
  return await pdf.save({ 
    useObjectStreams: false,
    addDefaultPage: false,
  });
}

/**
 * PDFを末尾に結合
 */
export async function appendPDFs(pdfABytes: Uint8Array, pdfBBytes: Uint8Array): Promise<Uint8Array> {
  const pdfA = await loadPDFOptimized(pdfABytes);
  const pdfB = await loadPDFOptimized(pdfBBytes);

  const mergedPdf = await PDFDocument.create();
  
  // PDF_Aのすべてのページをコピー
  const pagesA = await mergedPdf.copyPages(pdfA, pdfA.getPageIndices());
  pagesA.forEach((page) => mergedPdf.addPage(page));
  
  // PDF_Bのすべてのページをコピー
  const pagesB = await mergedPdf.copyPages(pdfB, pdfB.getPageIndices());
  pagesB.forEach((page) => mergedPdf.addPage(page));

  return await savePDFOptimized(mergedPdf);
}

/**
 * PDFを横方向または縦方向に重ねて結合
 */
export async function overlayPDFs(
  pdfABytes: Uint8Array,
  pdfBBytes: Uint8Array,
  direction: "horizontal" | "vertical"
): Promise<Uint8Array> {
  const pdfA = await loadPDFOptimized(pdfABytes);
  const pdfB = await loadPDFOptimized(pdfBBytes);

  const mergedPdf = await PDFDocument.create();
  
  const maxPages = Math.max(pdfA.getPageCount(), pdfB.getPageCount());

  for (let i = 0; i < maxPages; i++) {
    const pageA = i < pdfA.getPageCount() ? pdfA.getPage(i) : null;
    const pageB = i < pdfB.getPageCount() ? pdfB.getPage(i) : null;

    if (!pageA && pageB) {
      const [copiedPage] = await mergedPdf.copyPages(pdfB, [i]);
      mergedPdf.addPage(copiedPage);
      continue;
    }
    
    if (pageA && !pageB) {
      const [copiedPage] = await mergedPdf.copyPages(pdfA, [i]);
      mergedPdf.addPage(copiedPage);
      continue;
    }

    if (!pageA || !pageB) continue;

    const sizeA = pageA.getSize();
    const sizeB = pageB.getSize();

    let newWidth: number;
    let newHeight: number;

    if (direction === "horizontal") {
      newWidth = sizeA.width + sizeB.width;
      newHeight = Math.max(sizeA.height, sizeB.height);
    } else {
      newWidth = Math.max(sizeA.width, sizeB.width);
      newHeight = sizeA.height + sizeB.height;
    }

    const newPage = mergedPdf.addPage([newWidth, newHeight]);

    const [embeddedPageA] = await mergedPdf.embedPdf(pdfA, [i]);
    const [embeddedPageB] = await mergedPdf.embedPdf(pdfB, [i]);

    if (direction === "horizontal") {
      newPage.drawPage(embeddedPageA, {
        x: 0,
        y: newHeight - sizeA.height,
        width: sizeA.width,
        height: sizeA.height,
      });
      newPage.drawPage(embeddedPageB, {
        x: sizeA.width,
        y: newHeight - sizeB.height,
        width: sizeB.width,
        height: sizeB.height,
      });
    } else {
      newPage.drawPage(embeddedPageA, {
        x: 0,
        y: sizeB.height,
        width: sizeA.width,
        height: sizeA.height,
      });
      newPage.drawPage(embeddedPageB, {
        x: 0,
        y: 0,
        width: sizeB.width,
        height: sizeB.height,
      });
    }
  }

  return await savePDFOptimized(mergedPdf);
}

/**
 * PDFを交互に結合
 */
export async function alternatePDFs(pdfABytes: Uint8Array, pdfBBytes: Uint8Array): Promise<Uint8Array> {
  const pdfA = await loadPDFOptimized(pdfABytes);
  const pdfB = await loadPDFOptimized(pdfBBytes);

  const mergedPdf = await PDFDocument.create();
  
  const maxPages = Math.max(pdfA.getPageCount(), pdfB.getPageCount());

  for (let i = 0; i < maxPages; i++) {
    // PDF_Aからページを追加
    if (i < pdfA.getPageCount()) {
      const [copiedPage] = await mergedPdf.copyPages(pdfA, [i]);
      mergedPdf.addPage(copiedPage);
    }
    
    // PDF_Bからページを追加
    if (i < pdfB.getPageCount()) {
      const [copiedPage] = await mergedPdf.copyPages(pdfB, [i]);
      mergedPdf.addPage(copiedPage);
    }
  }

  return await savePDFOptimized(mergedPdf);
}

/**
 * ページ範囲を解析
 */
export function parsePageRanges(rangesStr: string): number[][] {
  const ranges: number[][] = [];
  const parts = rangesStr.split(",").map((s) => s.trim());

  for (const part of parts) {
    const match = part.match(/^(\d+)-(\d+)$/);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = parseInt(match[2], 10);
      if (start > 0 && end >= start) {
        ranges.push([start - 1, end - 1]); // 0-indexed
      }
    }
  }

  return ranges;
}

/**
 * ページ範囲でPDFを分割
 */
export async function splitPDFByRanges(pdfBytes: Uint8Array, ranges: number[][]): Promise<Uint8Array[]> {
  const pdf = await loadPDFOptimized(pdfBytes);
  const results: Uint8Array[] = [];

  for (const [start, end] of ranges) {
    const newPdf = await PDFDocument.create();
    const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    
    // 範囲チェック
    const validIndices = pageIndices.filter(i => i < pdf.getPageCount());
    
    if (validIndices.length === 0) continue;
    
    const copiedPages = await newPdf.copyPages(pdf, validIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));
    
    results.push(await savePDFOptimized(newPdf));
  }

  return results;
}

/**
 * PDFを内容半分に分割（横方向または縦方向）
 */
export async function splitPDFByContent(
  pdfBytes: Uint8Array,
  direction: "horizontal" | "vertical"
): Promise<Uint8Array[]> {
  const pdf = await loadPDFOptimized(pdfBytes);
  const pdf1 = await PDFDocument.create();
  const pdf2 = await PDFDocument.create();

  for (let i = 0; i < pdf.getPageCount(); i++) {
    const page = pdf.getPage(i);
    const { width, height } = page.getSize();

    if (direction === "horizontal") {
      // 横方向に分割
      const halfWidth = width / 2;

      // 左半分
      const page1 = pdf1.addPage([halfWidth, height]);
      const [embeddedPage] = await pdf1.embedPdf(pdf, [i]);
      page1.drawPage(embeddedPage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });

      // 右半分
      const page2 = pdf2.addPage([halfWidth, height]);
      const [embeddedPage2] = await pdf2.embedPdf(pdf, [i]);
      page2.drawPage(embeddedPage2, {
        x: -halfWidth,
        y: 0,
        width: width,
        height: height,
      });
    } else {
      // 縦方向に分割
      const halfHeight = height / 2;

      // 上半分
      const page1 = pdf1.addPage([width, halfHeight]);
      const [embeddedPage] = await pdf1.embedPdf(pdf, [i]);
      page1.drawPage(embeddedPage, {
        x: 0,
        y: -halfHeight,
        width: width,
        height: height,
      });

      // 下半分
      const page2 = pdf2.addPage([width, halfHeight]);
      const [embeddedPage2] = await pdf2.embedPdf(pdf, [i]);
      page2.drawPage(embeddedPage2, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });
    }
  }

  return [
    await savePDFOptimized(pdf1), 
    await savePDFOptimized(pdf2)
  ];
}

/**
 * PDFを奇数・偶数ページで分割
 */
export async function splitPDFByAlternate(pdfBytes: Uint8Array): Promise<Uint8Array[]> {
  const pdf = await loadPDFOptimized(pdfBytes);
  const oddPdf = await PDFDocument.create();
  const evenPdf = await PDFDocument.create();

  for (let i = 0; i < pdf.getPageCount(); i++) {
    if (i % 2 === 0) {
      // 奇数ページ (0-indexed なので偶数インデックス)
      const [copiedPage] = await oddPdf.copyPages(pdf, [i]);
      oddPdf.addPage(copiedPage);
    } else {
      // 偶数ページ
      const [copiedPage] = await evenPdf.copyPages(pdf, [i]);
      evenPdf.addPage(copiedPage);
    }
  }

  return [
    await savePDFOptimized(oddPdf), 
    await savePDFOptimized(evenPdf)
  ];
}
