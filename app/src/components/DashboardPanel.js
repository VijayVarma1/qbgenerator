import React, { useState, useMemo, useRef } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50'];

function DashboardPanel({ records }) {
    const [theme, setTheme] = useState('light');
    const [filterType, setFilterType] = useState('all');
    const [timeFilter, setTimeFilter] = useState('all');
    const chartRef = useRef();

    const getFilteredRecords = () => {
        if (timeFilter === 'all') return records;

        const now = new Date();

        return records.filter(record => {
            const date = new Date(record.timestamp);
            if (timeFilter === 'month') {
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            } else if (timeFilter === 'quarter') {
                const quarter = Math.floor((date.getMonth()) / 3);
                const currentQuarter = Math.floor(now.getMonth() / 3);
                return quarter === currentQuarter && date.getFullYear() === now.getFullYear();
            } else if (timeFilter === 'year') {
                return date.getFullYear() === now.getFullYear();
            }
            return true;
        });
    };

    const getChartData = useMemo(() => {
        const counts = { mcq: 0, fill: 0, truefalse: 0, descriptive: 0 };

        getFilteredRecords().forEach(record => {
            record.questions.forEach(q => {
                if (counts[q.type] !== undefined) {
                    counts[q.type]++;
                }
            });
        });

        return Object.keys(counts).map(key => ({
            type: key,
            count: counts[key]
        }));
    }, [records, timeFilter]);

    const exportDashboardAsPDF = () => {
        const element = document.getElementById('dashboard-panel');
        html2pdf().from(element).set({
            margin: 0.5,
            filename: 'dashboard_report.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        }).save();
    };

    const exportDashboardAsImage = async () => {
        const canvas = await html2canvas(chartRef.current);
        const link = document.createElement('a');
        link.download = 'dashboard_chart.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div
            id="dashboard-panel"
            ref={chartRef}
            style={{
                padding: '20px',
                background: theme === 'light' ? '#f9f9f9' : '#1e1e1e',
                color: theme === 'light' ? '#000' : '#fff',
                borderRadius: '8px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>📊 Dashboard</h2>
                <div>
                    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                    </button>
                    <button onClick={exportDashboardAsPDF} style={{ marginLeft: '10px' }}>
                        📄 Export PDF
                    </button>
                    <button onClick={exportDashboardAsImage} style={{ marginLeft: '10px' }}>
                        🖼 Export PNG
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <label>
                    Filter:{" "}
                    <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
                        <option value="all">All Time</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                    </select>
                </label>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '20px', gap: '30px' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h4>Question Types (Bar Chart)</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getChartData}>
                            <XAxis dataKey="type" stroke={theme === 'light' ? '#000' : '#fff'} />
                            <YAxis stroke={theme === 'light' ? '#000' : '#fff'} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h4>Question Types (Pie Chart)</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={getChartData} dataKey="count" nameKey="type" outerRadius={100} label>
                                {getChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default DashboardPanel;
