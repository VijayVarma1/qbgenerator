// app/src/components/AdminPanel.js
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function AdminPanel({ onFinalize, onGenerate, theme, toggleTheme }) {
    const [excelFile, setExcelFile] = useState(null);
    const [config, setConfig] = useState({
        mcq: 2,
        fill: 2,
        truefalse: 2,
        descriptive: 2,
        numPapers: 3,
    });

    const handleFileChange = (e) => {
        setExcelFile(e.target.files[0]);
    };

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    const handleUpload = () => {
        if (!excelFile) return alert('❌ Please upload a file first');

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const allQuestions = [];

            workbook.SheetNames.forEach((sheetName) => {
                const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                sheet.forEach(row => {
                    if (row.Type && row.Question && row.Answer) {
                        allQuestions.push({
                            type: row.Type.toLowerCase(),
                            text: row.Question,
                            answer: row.Answer,
                            options: row.Options ? row.Options.split(';') : [],
                        });
                    }
                });
            });

            if (allQuestions.length === 0) return alert('❌ No valid questions found');
            onFinalize(allQuestions);
        };
        reader.readAsArrayBuffer(excelFile);
    };

    return (
        <div className="admin-panel card">
            <div className="header">
                <h2>📥 Upload & Configure</h2>
                <button onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</button>
            </div>

            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            <div className="config-grid">
                <label>MCQ <input name="mcq" type="number" value={config.mcq} onChange={handleConfigChange} /></label>
                <label>Fill <input name="fill" type="number" value={config.fill} onChange={handleConfigChange} /></label>
                <label>True/False <input name="truefalse" type="number" value={config.truefalse} onChange={handleConfigChange} /></label>
                <label>Descriptive <input name="descriptive" type="number" value={config.descriptive} onChange={handleConfigChange} /></label>
                <label>Papers <input name="numPapers" type="number" value={config.numPapers} onChange={handleConfigChange} /></label>
            </div>

            <div className="button-row">
                <button onClick={handleUpload}>🚀 Upload</button>
                <button onClick={() => onGenerate(config.numPapers)}>🎲 Generate</button>
            </div>
        </div>
    );
}

export default AdminPanel;
