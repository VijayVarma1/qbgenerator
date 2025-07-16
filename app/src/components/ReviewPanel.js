import React, { useState } from 'react';

const ReviewPanel = ({ questions, onApprove }) => {
    const [editedQuestions, setEditedQuestions] = useState([...questions]);

    const handleChange = (index, field, value) => {
        const updated = [...editedQuestions];
        updated[index][field] = value;
        setEditedQuestions(updated);
    };

    const handleDelete = (index) => {
        const updated = [...editedQuestions];
        updated.splice(index, 1);
        setEditedQuestions(updated);
    };

    const handleFinalize = () => {
        const approved = editedQuestions.filter(q => q.text.trim() !== '');
        onApprove(approved);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>📝 Review & Finalize Questions</h2>
            {editedQuestions.map((q, idx) => (
                <div key={idx} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px' }}>
                    <input
                        style={{ width: '100%', fontSize: '16px' }}
                        value={q.text}
                        onChange={(e) => handleChange(idx, 'text', e.target.value)}
                    />
                    {q.options && (
                        <ul>
                            {q.options.map((opt, i) => (
                                <li key={i}>
                                    <input
                                        value={opt}
                                        onChange={(e) => {
                                            const updatedOptions = [...q.options];
                                            updatedOptions[i] = e.target.value;
                                            handleChange(idx, 'options', updatedOptions);
                                        }}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                    {q.answer !== undefined && (
                        <p>
                            <strong>Answer:</strong>{' '}
                            <input
                                value={q.answer}
                                onChange={(e) => handleChange(idx, 'answer', e.target.value)}
                            />
                        </p>
                    )}
                    <button onClick={() => handleDelete(idx)}>❌ Delete</button>
                </div>
            ))}

            <button onClick={handleFinalize} style={{ marginTop: '20px', fontWeight: 'bold' }}>
                ✅ Finalize Question Bank
            </button>
        </div>
    );
};

export default ReviewPanel;
