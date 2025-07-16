import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';

function RecordPanel({ records }) {
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filterRecords = () => {
        return records.filter(record => {
            const recordDate = new Date(record.timestamp);
            const fromDate = dateFrom ? new Date(dateFrom) : null;
            const toDate = dateTo ? new Date(dateTo) : null;

            const matchesType = typeFilter === 'all' || record.questions.some(q => q.type === typeFilter);
            const matchesDate = (!fromDate || recordDate >= fromDate) && (!toDate || recordDate <= toDate);

            return matchesType && matchesDate;
        });
    };

    const exportAsPDF = (record) => {
        const content = `
            <h2>Question Paper</h2>
            ${record.questions.map((q, i) => {
            if (q.type === 'mcq') {
                return `
                        <p><b>Q${i + 1} (${q.type}):</b> ${q.text}</p>
                        <ul>${q.options.map(opt => `<li>${opt}${opt === q.answer ? ' ✔' : ''}</li>`).join('')}</ul>
                    `;
            } else {
                return `<p><b>Q${i + 1} (${q.type}):</b> ${q.text}<br/><b>Answer:</b> ${q.answer}</p>`;
            }
        }).join('')}
            <hr/>
            <h2>Answer Key</h2>
            ${record.questions.map((q, i) => `<p><b>Q${i + 1}:</b> ${q.answer}</p>`).join('')}
        `;

        const opt = {
            margin: 0.5,
            filename: `${record.id}_Question_Paper.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(content).set(opt).save();
    };

    const exportAllAsZip = async () => {
        const zip = new JSZip();

        filterRecords().forEach((record) => {
            const qText = record.questions.map((q, i) => `Q${i + 1} (${q.type}): ${q.text}`).join('\n');
            const aText = record.questions.map((q, i) => `Q${i + 1}: ${q.answer}`).join('\n');

            zip.file(`${record.id}_Question_Paper.txt`, qText);
            zip.file(`${record.id}_Answer_Key.txt`, aText);
        });

        const blob = await zip.generateAsync({ type: 'blob' });
        saveAs(blob, 'Question_Bank_Export.zip');
    };

    return (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f8f8', borderRadius: '8px' }}>
            <h2>📁 Question Bank History</h2>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <label>
                    From: <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </label>
                <label>
                    To: <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </label>
                <label>
                    Type:
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                        <option value="all">All</option>
                        <option value="mcq">MCQ</option>
                        <option value="fill">Fill in the Blanks</option>
                        <option value="truefalse">True/False</option>
                        <option value="descriptive">Descriptive</option>
                    </select>
                </label>
                <button onClick={exportAllAsZip}>📦 Export All (ZIP)</button>
            </div>

            {filterRecords().length === 0 ? (
                <p>No matching records found.</p>
            ) : (
                filterRecords().map((record, index) => (
                    <div key={index} style={{ marginBottom: '15px', padding: '15px', background: '#fff', border: '1px solid #ccc', borderRadius: '6px' }}>
                        <h4>📄 Record ID: {record.id}</h4>
                        <p><b>File:</b> {record.fileName}</p>
                        <p><b>Timestamp:</b> {record.timestamp}</p>
                        <p><b>Total Questions:</b> {record.questions.length}</p>
                        <button onClick={() => exportAsPDF(record)} style={{ marginBottom: '10px' }}>📄 Export as PDF</button>

                        {record.questions.map((q, i) => (
                            <div key={i} style={{ marginBottom: '8px', padding: '10px', backgroundColor: '#f3f3f3', borderRadius: '4px' }}>
                                <p><b>Q{i + 1} ({q.type}):</b> {q.text}</p>
                                {q.type === 'mcq' ? (
                                    <ul style={{ paddingLeft: '20px' }}>
                                        {q.options.map((opt, idx) => (
                                            <li key={idx}>
                                                {opt} {opt === q.answer ? '✔️' : ''}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p><b>Answer:</b> {q.answer}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
}

export default RecordPanel;
