
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Lấy object từ import (xử lý sự khác biệt giữa ESM và CommonJS khi build)
const getDocument = pdfjsLib.getDocument;
const GlobalWorkerOptions = pdfjsLib.GlobalWorkerOptions;

// Cấu hình Worker cho PDF.js
// Lưu ý: Phải khớp phiên bản với import map trong index.html
if (GlobalWorkerOptions) {
    GlobalWorkerOptions.workerSrc = 'https://aistudiocdn.com/pdfjs-dist@4.0.379/build/pdf.worker.mjs';
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Tải tài liệu PDF
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const totalPages = pdf.numPages;

    // Lặp qua từng trang để lấy text
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Nối các đoạn text lại với nhau
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += `--- TRANG ${pageNum} ---\n${pageText}\n\n`;
    }

    if (!fullText.trim()) {
        return "Không tìm thấy văn bản nào trong PDF (Có thể là PDF dạng ảnh scan).";
    }

    return fullText;
  } catch (error) {
    console.error("Lỗi khi đọc file PDF:", error);
    let errorMsg = "Không thể đọc file PDF.";
    if (error instanceof Error) {
        errorMsg += " Chi tiết: " + error.message;
    }
    throw new Error(errorMsg);
  }
};
