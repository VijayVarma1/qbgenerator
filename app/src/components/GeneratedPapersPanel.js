// src/components/GeneratedPapersPanel.js
import React from 'react';
import html2pdf from 'html2pdf.js';

function GeneratedPapersPanel({ papers }) {
    const exportPaperPDF = (paper) => {
        const content = `
            <h2>Question Paper (${paper.code})</h2>
            ${paper.questions.map((q, i) => `<p><b>Q${i + 1} (${q.type}):</b> ${q.text}</p>`).join('')}
            <hr/>
            <h2>Answer Key</h2>
            ${paper.questions.map((q, i) => `<p><b>Q${i + 1}:</b> ${q.answer}</p>`).join('')}
        `;

        html2pdf().from(content).set({
            margin: 0.5,
            filename: `${paper.code}.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4' },
        }).save();
    };

    return (
        <div style={{ marginTop: '2rem', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>📄 Generated Question Papers</h3>
            {papers.length === 0 ? (
                <p>No papers generated.</p>
            ) : (
                papers.map(paper => (
                    <div key={paper.code} style={{ marginBottom: '15px' }}>
                        <strong>{paper.code}</strong> — {paper.questions.length} questions
                        <button onClick={() => exportPaperPDF(paper)} style={{ marginLeft: '10px' }}>
                            📄 Export
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

export default GeneratedPapersPanel;
