import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Cấu hình Worker cho PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://aistudiocdn.com/pdfjs-dist@4.0.379/build/pdf.worker.mjs';

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Tải tài liệu PDF
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
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

    return fullText;
  } catch (error) {
    console.error("Lỗi khi đọc file PDF:", error);
    throw new Error("Không thể đọc file PDF. Vui lòng đảm bảo file không bị hỏng hoặc có mật khẩu.");
  }
};