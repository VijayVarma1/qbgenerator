import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// FIX: Tell pdfjs where the worker is located
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        for (let i = 0; i < pdf.numPages; i++) {
            const page = await pdf.getPage(i + 1);
            const content = await page.getTextContent();
            const text = content.items.map(item => item.str).join(' ');
            fullText += text + '\n';
        }

        return fullText;
    }

    if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    }

    if (extension === 'doc') {
        throw new Error('Legacy .doc files are not supported. Please convert to .docx.');
    }

    throw new Error('Unsupported file type.');
}
