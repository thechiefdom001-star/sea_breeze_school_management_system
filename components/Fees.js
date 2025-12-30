import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import htm from 'htm';

const html = htm.bind(h);

export const Fees = ({ data, setData }) => {
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('T1');
    const [filterGrade, setFilterGrade] = useState('ALL');
    const [paymentItems, setPaymentItems] = useState({});
    const [receipt, setReceipt] = useState(null);

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
        { key: 'assessmentFee', label: 'Exam Fee' },
        { key: 'projectFee', label: 'Project Fee' }
    ];

    const terms = ['T1', 'T2', 'T3'];

    const student = data.students.find(s => s.id === selectedStudentId);
    const feeStructure = student ? data.settings.feeStructures.find(f => f.grade === student.grade) : null;

    useEffect(() => {
        setPaymentItems({});
    }, [selectedStudentId]);

    const handleItemInput = (key, val) => {
        setPaymentItems({ ...paymentItems, [key]: Number(val) });
    };

    const handlePayment = (e) => {
        e.preventDefault();
        if (!student || !feeStructure) return;

        const totalAmount = Object.values(paymentItems).reduce((sum, v) => sum + (v || 0), 0);
        if (totalAmount <= 0) {
            alert("Please enter payment amount for at least one item.");
            return;
        }

        const newPayment = {
            id: 'PAY-' + Date.now(),
            studentId: selectedStudentId,
            amount: totalAmount,
            items: { ...paymentItems },
            term: selectedTerm,
            date: new Date().toLocaleDateString(),
            receiptNo: 'RCP-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0')
        };

        const existingPayments = (data.payments || []).filter(p => p.studentId === student.id);
        const totalPaidSoFar = existingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        
        // Calculate total due based on student's specific fee profile
        const totalDue = (Number(student.previousArrears) || 0) + feeColumns.reduce((sum, col) => {
            const isSelected = (student.selectedFees || ['t1', 't2', 't3']).includes(col.key);
            return sum + (isSelected ? (feeStructure[col.key] || 0) : 0);
        }, 0);
        
        const balanceAfter = totalDue - (totalPaidSoFar + totalAmount);

        const allPaymentsForStudent = [...existingPayments, newPayment];
        
        setData({ ...data, payments: [...(data.payments || []), newPayment] });
        setReceipt({ 
            ...newPayment, 
            studentName: student.name, 
            grade: student.grade, 
            balance: balanceAfter,
            structure: feeStructure,
            history: allPaymentsForStudent,
            term: selectedTerm
        });
        setPaymentItems({});
    };

    const handleDeletePayment = (paymentId) => {
        if (confirm('Void this transaction? This cannot be undone.')) {
            setData({ ...data, payments: data.payments.filter(p => p.id !== paymentId) });
            if (receipt && receipt.id === paymentId) setReceipt(null);
        }
    };

    const viewReceipt = (p) => {
        const s = data.students.find(st => st.id === p.studentId);
        const fs = s ? data.settings.feeStructures.find(f => f.grade === s.grade) : null;
        
        const studentPayments = (data.payments || []).filter(pay => pay.studentId === s.id);
        const paymentIndex = studentPayments.findIndex(pay => pay.id === p.id);
        const historyUpToNow = studentPayments.slice(0, paymentIndex + 1);
        
        const totalDue = (Number(s?.previousArrears) || 0) + feeColumns.reduce((sum, col) => sum + (fs?.[col.key] || 0), 0);
        const paidUntilNow = historyUpToNow.reduce((sum, pay) => sum + pay.amount, 0);

        setReceipt({
            ...p,
            studentName: s?.name || 'Unknown',
            grade: s?.grade || 'N/A',
            balance: totalDue - paidUntilNow,
            structure: fs,
            history: historyUpToNow
        });
    };

    return html`
        <div class="space-y-6">
            <h2 class="text-2xl font-bold no-print">Fee Management</h2>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 no-print">
                    <h3 class="font-bold mb-4">Record New Payment</h3>
                    <form onSubmit=${handlePayment} class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="space-y-1">
                                <label class="text-xs font-bold text-slate-500 uppercase">Filter Grade</label>
                                <select 
                                    class="w-full p-3 bg-slate-50 rounded-xl outline-none border border-transparent focus:border-primary font-bold text-primary"
                                    value=${filterGrade}
                                    onChange=${(e) => { setFilterGrade(e.target.value); setSelectedStudentId(''); }}
                                >
                                    <option value="ALL">All Grades</option>
                                    ${(data.settings.grades || []).map(g => html`<option value=${g}>${g}</option>`)}
                                </select>
                            </div>
                            <div class="space-y-1 md:col-span-1">
                                <label class="text-xs font-bold text-slate-500 uppercase">Select Student</label>
                                <select 
                                    required
                                    class="w-full p-3 bg-slate-50 rounded-xl outline-none border border-transparent focus:border-primary"
                                    value=${selectedStudentId}
                                    onChange=${(e) => setSelectedStudentId(e.target.value)}
                                >
                                    <option value="">Select Student</option>
                                    ${(data.students || [])
                                        .filter(s => filterGrade === 'ALL' || s.grade === filterGrade)
                                        .map(s => html`
                                            <option value=${s.id}>${s.name} (Adm: ${s.admissionNo})</option>
                                        `)}
                                </select>
                            </div>
                            <div class="space-y-1">
                                <label class="text-xs font-bold text-slate-500 uppercase">Academic Term</label>
                                <select 
                                    class="w-full p-3 bg-slate-50 rounded-xl outline-none border border-transparent focus:border-primary font-bold text-primary"
                                    value=${selectedTerm}
                                    onChange=${(e) => setSelectedTerm(e.target.value)}
                                >
                                    ${terms.map(t => html`<option value=${t}>${t}</option>`)}
                                </select>
                            </div>
                        </div>

                        ${feeStructure && html`
                            <div class="space-y-3">
                                <label class="text-xs font-bold text-slate-500 uppercase block">Fee Breakdown (${data.settings.currency})</label>
                                <div class="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                                    ${feeColumns.map(col => {
                                        // Term Filter logic: 
                                        // 1. Hide other terms tuition
                                        if (col.key === 't1' && selectedTerm !== 'T1') return null;
                                        if (col.key === 't2' && selectedTerm !== 'T2') return null;
                                        if (col.key === 't3' && selectedTerm !== 'T3') return null;

                                        // Filter items based on student's fee profile
                                        const isSelected = (student.selectedFees || ['t1', 't2', 't3', 'admission', 'diary', 'development']).includes(col.key);
                                        const due = feeStructure[col.key] || 0;
                                        
                                        if (!isSelected || due === 0) return null;
                                        
                                        return html`
                                            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <p class="text-[10px] font-bold text-slate-400 uppercase truncate">${col.label}</p>
                                                <p class="text-[10px] text-slate-500 mb-1">Due: ${due}</p>
                                                <input 
                                                    type="number" 
                                                    placeholder="0"
                                                    class="w-full bg-white border border-slate-200 rounded-lg p-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                                    value=${paymentItems[col.key] || ''}
                                                    onInput=${(e) => handleItemInput(col.key, e.target.value)}
                                                />
                                            </div>
                                        `;
                                    })}
                                </div>
                                <div class="pt-4 border-t flex justify-between items-center">
                                    <span class="font-bold text-slate-700">Total to Pay:</span>
                                    <span class="text-xl font-black text-blue-600">${data.settings.currency} ${Object.values(paymentItems).reduce((sum, v) => sum + (v || 0), 0).toLocaleString()}</span>
                                </div>
                            </div>
                        `}

                        <button class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 disabled:opacity-50" disabled=${!selectedStudentId}>
                            Generate Receipt
                        </button>
                    </form>
                </div>

                <div class="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden print:bg-white print:text-black print:shadow-none print:p-0 min-h-[500px]">
                    <div class="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl print:hidden"></div>
                    ${receipt ? html`
                        <div class="relative space-y-6 print:space-y-4">
                            <div class="flex flex-col items-center text-center border-b border-slate-800 print:border-black pb-4">
                                <img src="${data.settings.schoolLogo}" class="w-12 h-12 mb-2 object-contain" alt="Logo" />
                                <h3 class="text-xl font-black uppercase tracking-tight">${data.settings.schoolName}</h3>
                                <p class="text-[10px] text-slate-400 print:text-slate-600">${data.settings.schoolAddress}</p>
                            </div>
                            
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="text-blue-400 print:text-blue-600 font-bold uppercase tracking-widest text-[10px]">Official Payment Receipt - Term ${receipt.term || 'N/A'}</h4>
                                    <p class="text-2xl font-black mt-1">${receipt.receiptNo}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-slate-400 print:text-slate-600 text-xs">${receipt.date}</p>
                                </div>
                            </div>

                            <div class="border-t border-slate-800 print:border-black pt-4 space-y-2">
                                <div class="flex justify-between text-sm">
                                    <span class="text-slate-400 print:text-slate-600">Student:</span>
                                    <span class="font-bold">${receipt.studentName} (${receipt.grade})</span>
                                </div>
                                
                                <div class="mt-4">
                                    <div class="grid grid-cols-4 text-[9px] font-bold text-slate-500 uppercase mb-2 border-b border-slate-800 pb-1 print:border-black">
                                        <span>Item</span>
                                        <span class="text-right">Fee</span>
                                        <span class="text-right">Paid</span>
                                        <span class="text-right">Balance</span>
                                    </div>
                                    <div class="space-y-1">
                                        ${student?.previousArrears > 0 && html`
                                            <div class="grid grid-cols-4 text-[10px] border-b border-slate-800/30 print:border-slate-100 py-1.5 items-center">
                                                <span class="text-slate-400 print:text-slate-500 truncate pr-1">Arrears B/F</span>
                                                <span class="text-right text-slate-300 print:text-slate-400 font-medium">${student.previousArrears.toLocaleString()}</span>
                                                <span class="text-right text-slate-600 print:text-slate-300">-</span>
                                                <span class="text-right font-mono font-bold text-orange-400 print:text-slate-700">${student.previousArrears.toLocaleString()}</span>
                                            </div>
                                        `}
                                        ${feeColumns.map(col => {
                                            const paidNow = receipt.items?.[col.key] || 0;
                                            
                                            // Filter by term if it's a tuition fee
                                            const currentTermKey = receipt.term?.toLowerCase() || '';
                                            const isOtherTerm = ['t1', 't2', 't3'].includes(col.key) && col.key !== currentTermKey;
                                            
                                            // Determine if this item is part of this specific student's profile
                                            const targetStudent = data.students.find(s => s.name === receipt.studentName);
                                            const isSelected = (targetStudent?.selectedFees || ['t1', 't2', 't3']).includes(col.key);
                                            
                                            // Don't show other terms unless there was a payment for them (rare)
                                            if (isOtherTerm && paidNow === 0) return null;

                                            const feeAmount = isSelected ? (receipt.structure?.[col.key] || 0) : 0;
                                            
                                            // Only show if it's selected for the student OR if something was paid anyway (history)
                                            if (feeAmount === 0 && paidNow === 0) return null;

                                            // Calculate cumulative balance for this item up to this receipt
                                            const totalPaidForItem = (receipt.history || []).reduce((sum, p) => sum + (p.items?.[col.key] || 0), 0);
                                            const itemBalance = feeAmount - totalPaidForItem;
                                            
                                            return html`
                                                <div class="grid grid-cols-4 text-[10px] border-b border-slate-800/30 print:border-slate-100 py-1.5 items-center">
                                                    <span class="text-slate-400 print:text-slate-500 truncate pr-1">${col.label}</span>
                                                    <span class="text-right text-slate-300 print:text-slate-400 font-medium">${feeAmount.toLocaleString()}</span>
                                                    <span class=${`text-right font-bold ${paidNow > 0 ? 'text-white print:text-black' : 'text-slate-600 print:text-slate-300'}`}>
                                                        ${paidNow > 0 ? paidNow.toLocaleString() : '-'}
                                                    </span>
                                                    <span class="text-right font-mono font-bold ${itemBalance > 0 ? 'text-orange-400 print:text-slate-700' : 'text-green-400 print:text-green-600'}">
                                                        ${itemBalance.toLocaleString()}
                                                    </span>
                                                </div>
                                            `;
                                        })}
                                    </div>
                                </div>

                                <div class="flex justify-between items-center bg-slate-800 print:bg-slate-100 p-4 rounded-xl mt-6">
                                    <span class="text-slate-400 print:text-slate-600 font-bold uppercase text-xs">Total Amount Paid</span>
                                    <span class="text-2xl font-black text-green-400 print:text-green-700">${data.settings.currency} ${receipt.amount.toLocaleString()}</span>
                                </div>
                                
                                <div class="space-y-1 px-2 pt-2">
                                    <div class="flex justify-between">
                                        <span class="text-slate-400 print:text-slate-500 text-[10px] font-bold uppercase">Term ${receipt.term} Outstanding Balance</span>
                                        <span class="font-black text-xs text-orange-400 print:text-slate-800">${data.settings.currency} ${
                                            // Calculate term-specific balance: (Term Tuition Item Due) - (Total Paid for this specific term)
                                            // Note: receipt.balance is already cumulative but user wants term focus
                                            receipt.balance.toLocaleString()
                                        }</span>
                                    </div>
                                    <div class="flex justify-between border-t border-slate-800/50 print:border-slate-200 pt-1">
                                        <span class="text-slate-500 print:text-slate-400 text-[8px] font-bold uppercase">Overall Account Balance</span>
                                        <span class="font-bold text-[10px] text-slate-400 print:text-slate-500">${data.settings.currency} ${receipt.balance.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="pt-8 text-center hidden print:block">
                                <div class="flex justify-around mb-8">
                                    <div class="text-center border-t border-black w-32 pt-1 text-[8px] font-bold uppercase">Accounts Clerk</div>
                                    <div class="text-center border-t border-black w-32 pt-1 text-[8px] font-bold uppercase">School Stamp</div>
                                </div>
                                <p class="text-[10px] italic">Thank you for your payment.</p>
                            </div>
                            
                            <button onClick=${() => window.print()} class="w-full py-3 bg-blue-600 text-white rounded-xl font-bold no-print shadow-lg shadow-blue-500/30">
                                Print Receipt
                            </button>
                        </div>
                    ` : html`
                        <div class="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                            <span class="text-4xl">🧾</span>
                            <p>Select a student and enter item-wise payments to generate a detailed receipt</p>
                        </div>
                    `}
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-8 no-print">
                <div class="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 class="font-bold">Transaction History</h3>
                    <div class="flex items-center gap-4">
                        <select 
                            class="bg-slate-50 border-0 rounded-lg text-[10px] font-bold uppercase p-2 outline-none focus:ring-1 focus:ring-primary"
                            value=${filterGrade}
                            onChange=${e => setFilterGrade(e.target.value)}
                        >
                            <option value="ALL">All Grades</option>
                            ${data.settings.grades.map(g => html`<option value=${g}>${g}</option>`)}
                        </select>
                        <span class="text-xs text-slate-400">${(data.payments || []).length} Total</span>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                            <tr>
                                <th class="px-6 py-3">Receipt #</th>
                                <th class="px-6 py-3">Student</th>
                                <th class="px-6 py-3">Date</th>
                                <th class="px-6 py-3 text-right">Amount</th>
                                <th class="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            ${(data.payments || [])
                                .filter(p => {
                                    if (filterGrade === 'ALL') return true;
                                    const s = data.students.find(st => st.id === p.studentId);
                                    return s?.grade === filterGrade;
                                })
                                .slice().reverse().map(p => {
                                const s = data.students.find(st => st.id === p.studentId);
                                return html`
                                    <tr key=${p.id} class="hover:bg-slate-50">
                                        <td class="px-6 py-4 font-mono text-xs">${p.receiptNo}</td>
                                        <td class="px-6 py-4 font-medium text-sm">${s?.name || 'Unknown'}</td>
                                        <td class="px-6 py-4 text-xs text-slate-500">${p.date}</td>
                                        <td class="px-6 py-4 text-right font-bold text-slate-700">${data.settings.currency} ${p.amount.toLocaleString()}</td>
                                        <td class="px-6 py-4 text-center">
                                            <div class="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick=${() => viewReceipt(p)}
                                                    class="text-blue-600 text-[10px] font-bold uppercase hover:underline"
                                                >
                                                    View
                                                </button>
                                                <button 
                                                    onClick=${() => handleDeletePayment(p.id)}
                                                    class="text-red-500 text-[10px] font-bold uppercase hover:underline"
                                                >
                                                    Void
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            })}
                        </tbody>
                    </table>
                </div>
                ${(!data.payments || data.payments.length === 0) && html`
                    <div class="p-12 text-center text-slate-300">No transactions recorded yet.</div>
                `}
            </div>
        </div>
    `;
};