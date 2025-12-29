import { h } from 'preact';
import { useState, useMemo } from 'preact/hooks';
import htm from 'htm';

const html = htm.bind(h);

export const FeeReminder = ({ data }) => {
    const [filterGrade, setFilterGrade] = useState('ALL');
    const [selectedStudentId, setSelectedStudentId] = useState('ALL');
    const [selectedTerm, setSelectedTerm] = useState('ALL');

    const students = data.students || [];
    const payments = data.payments || [];
    const settings = data.settings || {};

    const feeColumns = [
        { key: 'admission', label: 'Admission' },
        { key: 'diary', label: 'Diary' },
        { key: 'development', label: 'Development' },
        { key: 't1', label: 'Term 1' },
        { key: 't2', label: 'Term 2' },
        { key: 't3', label: 'Term 3' },
        { key: 'boarding', label: 'Boarding' },
        { key: 'breakfast', label: 'Breakfast' },
        { key: 'lunch', label: 'Lunch' },
        { key: 'trip', label: 'Trip' },
        { key: 'bookFund', label: 'Book Fund' },
        { key: 'caution', label: 'Caution' },
        { key: 'uniform', label: 'Uniform' },
        { key: 'studentCard', label: 'ID Card' },
        { key: 'remedial', label: 'Remedials' },
        { key: 'assessmentFee', label: 'Assessment Fee' },
        { key: 'projectFee', label: 'Project Fee' }
    ];

    const calculateArrears = (student, termFilter = 'ALL') => {
        const feeStructure = settings.feeStructures?.find(f => f.grade === student.grade);
        if (!feeStructure) return { items: [], totalDue: 0, totalPaid: 0, balance: 0 };

        const selectedKeys = student.selectedFees || ['t1', 't2', 't3'];
        
        const allItems = feeColumns
            .filter(col => selectedKeys.includes(col.key))
            .map(col => {
                const due = Number(feeStructure[col.key]) || 0;
                const paid = payments
                    .filter(p => p.studentId === student.id)
                    .reduce((sum, p) => sum + (Number(p.items?.[col.key]) || 0), 0);
                
                return { label: col.label, due, paid, balance: due - paid, key: col.key };
            })
            .filter(item => item.due > 0 || item.paid > 0);

        if (Number(student.previousArrears) > 0) {
            allItems.unshift({ 
                label: 'Arrears Brought Forward', 
                due: Number(student.previousArrears), 
                paid: 0, 
                balance: Number(student.previousArrears),
                key: 'prev'
            });
        }

        // Apply term filtering to the item list
        const filteredItems = allItems.filter(item => {
            if (termFilter === 'ALL') return true;
            const termKey = termFilter.toLowerCase();
            // Show item if it's Arrears, not a tuition term (shared/annual), or specifically the selected term
            return item.key === 'prev' || !['t1', 't2', 't3'].includes(item.key) || item.key === termKey;
        });

        const totalDue = filteredItems.reduce((sum, i) => sum + i.due, 0);
        const totalPaid = filteredItems.reduce((sum, i) => sum + i.paid, 0);
        const balance = filteredItems.reduce((sum, i) => sum + i.balance, 0);
        
        return {
            items: filteredItems,
            totalDue,
            totalPaid,
            balance
        };
    };

    const filteredStudents = students.filter(s => {
        const matchGrade = filterGrade === 'ALL' || s.grade === filterGrade;
        const matchStudent = selectedStudentId === 'ALL' || s.id === selectedStudentId;
        // Check if student has balance in the context of the selected term or overall
        const finance = calculateArrears(s, selectedTerm);
        return matchGrade && matchStudent && finance.balance > 0;
    });

    return html`
        <div class="space-y-6">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div>
                    <h2 class="text-2xl font-bold">Fee Reminders</h2>
                    <p class="text-slate-500">Generate and print fee balance notices for parents</p>
                </div>
                <button onClick=${() => window.print()} class="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200">
                    Print All Reminders
                </button>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Term Filter</label>
                    <select 
                        class="w-full p-2 bg-slate-50 rounded-lg text-sm border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                        value=${selectedTerm}
                        onChange=${e => setSelectedTerm(e.target.value)}
                    >
                        <option value="ALL">Whole Year</option>
                        <option value="T1">Term 1</option>
                        <option value="T2">Term 2</option>
                        <option value="T3">Term 3</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Grade</label>
                    <select 
                        class="w-full p-2 bg-slate-50 rounded-lg text-sm border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                        value=${filterGrade}
                        onChange=${e => { setFilterGrade(e.target.value); setSelectedStudentId('ALL'); }}
                    >
                        <option value="ALL">All Grades</option>
                        ${settings.grades?.map(g => html`<option value=${g}>${g}</option>`)}
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Specific Student</label>
                    <select 
                        class="w-full p-2 bg-slate-50 rounded-lg text-sm border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                        value=${selectedStudentId}
                        onChange=${e => setSelectedStudentId(e.target.value)}
                    >
                        <option value="ALL">All Students with Arrears</option>
                        ${students.filter(s => filterGrade === 'ALL' || s.grade === filterGrade).map(s => html`
                            <option value=${s.id}>${s.name} (${s.admissionNo})</option>
                        `)}
                    </select>
                </div>
            </div>

            <div class="space-y-8 print:space-y-0 print:grid print:grid-cols-1">
                <style>
                    @media print {
                        .reminder-card {
                            min-height: 13.8cm; /* Ensures roughly 2 per A4 page */
                            padding: 1cm !important;
                            border-bottom: 1px dashed #ccc !important;
                            page-break-inside: avoid;
                            display: flex;
                            flex-direction: column;
                        }
                        .reminder-card:nth-child(2n) {
                            border-bottom: none !important;
                        }
                        /* Ensure the whole document is visible */
                        body, .h-screen, #app { height: auto !important; overflow: visible !important; }
                    }
                </style>
                ${filteredStudents.map(student => {
                    const finance = calculateArrears(student, selectedTerm);
                    return html`
                        <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm print:shadow-none print:border-0 print:p-0 print:mb-0 page-break reminder-card">
                            <!-- Header -->
                            <div class="flex flex-col items-center text-center border-b-2 border-slate-900 pb-4 mb-4">
                                <img src="${settings.schoolLogo}" class="w-20 h-20 mb-2 object-contain" />
                                <h1 class="text-2xl font-black uppercase">${settings.schoolName}</h1>
                                <p class="text-[10px] font-bold text-slate-500">${settings.schoolAddress}</p>
                                <div class="mt-4 bg-slate-900 text-white px-4 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                                    Fee Balance Reminder ${selectedTerm !== 'ALL' ? `- ${selectedTerm}` : ''}
                                </div>
                            </div>

                            <!-- Student Info -->
                            <div class="grid grid-cols-2 gap-8 mb-8">
                                <div class="space-y-1">
                                    <p class="text-[10px] font-black text-slate-400 uppercase">Attention to Parent/Guardian of:</p>
                                    <p class="text-lg font-black">${student.name}</p>
                                    <p class="text-xs font-bold text-slate-600">${student.grade} - ${student.stream || 'No Stream'}</p>
                                    <p class="text-xs font-mono text-slate-500">Adm No: ${student.admissionNo}</p>
                                </div>
                                <div class="text-right space-y-1">
                                    <p class="text-[10px] font-black text-slate-400 uppercase">Date of Notice</p>
                                    <p class="text-sm font-bold">${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <p class="text-sm text-slate-700 mb-6">
                                Dear Parent, this is to kindly remind you of the outstanding school fee balance for the current academic period. 
                                Below is a detailed breakdown of your account status:
                            </p>

                            <!-- Breakdown Table -->
                            <div class="border-2 border-slate-900 rounded-lg overflow-hidden mb-6">
                                <table class="w-full text-sm">
                                    <thead class="bg-slate-900 text-white">
                                        <tr>
                                            <th class="p-3 text-left uppercase text-[10px] font-black">Fee Item Description</th>
                                            <th class="p-3 text-right uppercase text-[10px] font-black">Total Due</th>
                                            <th class="p-3 text-right uppercase text-[10px] font-black">Paid to Date</th>
                                            <th class="p-3 text-right uppercase text-[10px] font-black">Outstanding</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-200">
                                        ${finance.items.map(item => html`
                                            <tr>
                                                <td class="p-2 font-bold text-xs">${item.label}</td>
                                                <td class="p-2 text-right font-mono text-xs">${item.due.toLocaleString()}</td>
                                                <td class="p-2 text-right font-mono text-green-600 text-xs">${item.paid.toLocaleString()}</td>
                                                <td class="p-2 text-right font-black text-xs ${item.balance > 0 ? 'text-red-600' : 'text-slate-400'}">
                                                    ${item.balance.toLocaleString()}
                                                </td>
                                            </tr>
                                        `)}
                                    </tbody>
                                    <tfoot class="bg-slate-50 border-t-2 border-slate-900">
                                        <tr>
                                            <td class="p-4 font-black uppercase text-xs">Total Arrears Payable</td>
                                            <td class="p-4 text-right font-bold">${finance.totalDue.toLocaleString()}</td>
                                            <td class="p-4 text-right font-bold text-green-600">${finance.totalPaid.toLocaleString()}</td>
                                            <td class="p-4 text-right font-black text-xl text-red-600">
                                                ${settings.currency} ${finance.balance.toLocaleString()}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <!-- Footer/Sign-off -->
                            <div class="space-y-6 pt-4">
                                <p class="text-xs text-slate-600 italic">
                                    Please clear the outstanding balance of <b>${settings.currency} ${finance.balance.toLocaleString()}</b> as soon as possible to ensure 
                                    uninterrupted learning for the student. If payment has been made recently, kindly disregard this notice.
                                </p>
                                
                                <div class="flex justify-between items-end pt-4 print:pt-2">
                                    <div class="text-center w-48">
                                        <div class="h-8 border-b border-slate-900 mb-1"></div>
                                        <p class="text-[9px] font-black uppercase text-slate-500">Accounts Dept</p>
                                    </div>
                                    <div class="text-center w-48 flex flex-col items-center">
                                        <div class="w-12 h-12 opacity-20 grayscale">
                                            <img src="${settings.schoolLogo}" class="w-full h-full object-contain" />
                                        </div>
                                        <p class="text-[9px] font-black uppercase text-slate-500">Stamp</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                })}

                ${filteredStudents.length === 0 && html`
                    <div class="bg-white p-20 rounded-2xl border border-dashed border-slate-200 text-center">
                        <span class="text-5xl mb-4 block">✅</span>
                        <h3 class="text-lg font-bold text-slate-700">No Arrears Found</h3>
                        <p class="text-slate-400">All students in the selected filter have cleared their fees.</p>
                    </div>
                `}
            </div>
        </div>
    `;
};