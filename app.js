import { h, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import htm from 'htm';
import { Dashboard } from './components/Dashboard.js';
import { Students } from './components/Students.js';
import { Teachers } from './components/Teachers.js';
import { Staff } from './components/Staff.js';
import { Marklist } from './components/Marklist.js';
import { Assessments } from './components/Assessments.js';
import { Fees } from './components/Fees.js';
import { FeesRegister } from './components/FeesRegister.js';
import { FeeReminder } from './components/FeeReminder.js';
import { Transport } from './components/Transport.js';
import { Library } from './components/Library.js';
import { Payroll } from './components/Payroll.js';
import { Settings } from './components/Settings.js';
import { Sidebar } from './components/Sidebar.js';
import { Storage } from './lib/storage.js';

const html = htm.bind(h);

const App = () => {
    const [view, setView] = useState('dashboard');
    const [data, setData] = useState(Storage.load());
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('et_is_admin') === 'true');
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        Storage.save(data);
    }, [data]);

    useEffect(() => {
        // Apply dynamic theme colors
        const root = document.documentElement;
        root.style.setProperty('--primary-color', data.settings.primaryColor || '#2563eb');
        root.style.setProperty('--secondary-color', data.settings.secondaryColor || '#64748b');
        
        if (data.settings.theme === 'dark') {
            document.body.classList.add('bg-slate-950', 'text-slate-100');
            document.body.classList.remove('bg-gray-50', 'text-slate-900');
        } else {
            document.body.classList.remove('bg-slate-950', 'text-slate-100');
            document.body.classList.add('bg-gray-50', 'text-slate-900');
        }
    }, [data.settings.primaryColor, data.settings.secondaryColor, data.settings.theme]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginUsername === 'admin' && loginPassword === 'admin002') {
            setIsAdmin(true);
            localStorage.setItem('et_is_admin', 'true');
            setShowLoginModal(false);
            setLoginUsername('');
            setLoginPassword('');
        } else {
            alert('Invalid Admin Credentials');
        }
    };

    const handleLogout = () => {
        setIsAdmin(false);
        localStorage.removeItem('et_is_admin');
        setView('dashboard');
    };

    const navigate = (v, params = null) => {
        if (params?.studentId) {
            const student = (data.students || []).find(s => s.id === params.studentId);
            setSelectedStudent(student);
        }
        setView(v);
    };

    const renderView = () => {
        switch (view) {
            case 'dashboard': return html`<${Dashboard} data=${data} />`;
            case 'students': return html`<${Students} data=${data} setData=${setData} onSelectStudent=${(id) => navigate('student-detail', { studentId: id })} />`;
            case 'teachers': return html`<${Teachers} data=${data} setData=${setData} />`;
            case 'staff': return html`<${Staff} data=${data} setData=${setData} />`;
            case 'marklist': return html`<${Marklist} data=${data} setData=${setData} />`;
            case 'assessments': return html`<${Assessments} data=${data} setData=${setData} />`;
            case 'fees': return html`<${Fees} data=${data} setData=${setData} />`;
            case 'fees-register': return html`<${FeesRegister} data=${data} />`;
            case 'fee-reminder': return html`<${FeeReminder} data=${data} />`;
            case 'transport': return html`<${Transport} data=${data} setData=${setData} />`;
            case 'library': return html`<${Library} data=${data} setData=${setData} />`;
            case 'payroll': return html`<${Payroll} data=${data} setData=${setData} />`;
            case 'settings': return html`<${Settings} data=${data} setData=${setData} />`;
            case 'student-detail': return html`<${StudentDetail} student=${selectedStudent} data=${data} setData=${setData} onBack=${() => setView('students')} />`;
            default: return html`<${Dashboard} data=${data} />`;
        }
    };

    return html`
        <div class=${`flex flex-col h-screen w-full overflow-hidden ${data.settings.theme === 'dark' ? 'dark text-white' : ''}`}>
            <!-- Dynamic Styles Injection -->
            <style>
                :root {
                    --primary: ${data.settings.primaryColor || '#2563eb'};
                    --secondary: ${data.settings.secondaryColor || '#64748b'};
                }
                .bg-primary { background-color: var(--primary) !important; }
                .text-primary { color: var(--primary) !important; }
                .border-primary { border-color: var(--primary) !important; }
                .focus\:ring-primary:focus { --tw-ring-color: var(--primary) !important; }
                .focus\:border-primary:focus { border-color: var(--primary) !important; }
                
                .bg-secondary { background-color: var(--secondary) !important; }
                .text-secondary { color: var(--secondary) !important; }
                .border-secondary { border-color: var(--secondary) !important; }
                
                /* Override hardcoded blue-600 occurrences for global theme consistency */
                .bg-blue-600 { background-color: var(--primary) !important; }
                .text-blue-600 { color: var(--primary) !important; }
                .border-blue-600 { border-color: var(--primary) !important; }
                .shadow-blue-200 { --tw-shadow-color: var(--primary); shadow: 0 10px 15px -3px var(--primary); }
                
                ${data.settings.theme === 'dark' ? `
                    .bg-white { background-color: #0f172a !important; color: #f1f5f9; }
                    .bg-slate-50 { background-color: #1e293b !important; }
                    .bg-slate-100 { background-color: #334155 !important; }
                    .border-slate-100, .border-slate-50, .border-blue-100 { border-color: #334155 !important; }
                    .text-slate-900 { color: #f8fafc !important; }
                    .text-slate-500, .text-slate-400 { color: #94a3b8 !important; }
                ` : ''}
            </style>

            <!-- Navbar -->
            <header class="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 z-40 no-print">
                <div class="flex items-center gap-3">
                    <img src="${data.settings.schoolLogo}" class="w-8 h-8 object-contain" />
                    <span class="font-black tracking-tight text-lg hidden sm:block">${data.settings.schoolName}</span>
                </div>
                
                <div class="flex items-center gap-4">
                    ${isAdmin ? html`
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase">Admin Mode</span>
                            <button onClick=${handleLogout} class="text-xs font-bold text-red-500 hover:underline uppercase">Logout</button>
                        </div>
                    ` : html`
                        <button onClick=${() => setShowLoginModal(true)} class="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm shadow-blue-200">
                            Admin Login
                        </button>
                    `}
                </div>
            </header>

            <div class="flex flex-1 overflow-hidden">
                <${Sidebar} currentView=${view} setView=${setView} className="no-print" />
                <main class="flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-0">
                    <div class="max-w-6xl mx-auto p-4 md:p-8">
                        ${!isAdmin && ['settings', 'fees', 'fees-register', 'teachers', 'staff', 'payroll'].includes(view) ? html`
                            <div class="flex flex-col items-center justify-center h-96 text-center space-y-4">
                                <span class="text-5xl">🔒</span>
                                <h2 class="text-xl font-bold">Admin Access Required</h2>
                                <p class="text-slate-400 max-w-xs">Please log in as an administrator to access financial records and system settings.</p>
                                <button onClick=${() => setShowLoginModal(true)} class="bg-primary text-white px-6 py-3 rounded-xl font-bold">Login Now</button>
                            </div>
                        ` : renderView()}
                    </div>
                </main>
            </div>

            <!-- Login Modal -->
            ${showLoginModal && html`
                <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div class="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 class="text-2xl font-black mb-2">Administrator Login</h3>
                        <p class="text-slate-400 text-sm mb-6">Enter your security credentials to manage sensitive school data.</p>
                        <form onSubmit=${handleLogin} class="space-y-4">
                            <div class="space-y-1">
                                <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Username</label>
                                <input 
                                    type="text"
                                    placeholder="Admin username"
                                    class="w-full p-4 bg-slate-50 rounded-2xl border-0 focus:ring-2 focus:ring-primary outline-none"
                                    value=${loginUsername}
                                    onInput=${e => setLoginUsername(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div class="space-y-1">
                                <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Password</label>
                                <input 
                                    type="password"
                                    placeholder="Enter password..."
                                    class="w-full p-4 bg-slate-50 rounded-2xl border-0 focus:ring-2 focus:ring-primary outline-none"
                                    value=${loginPassword}
                                    onInput=${e => setLoginPassword(e.target.value)}
                                />
                                <p class="text-[8px] text-slate-400 mt-1 italic">Tip: ask the school administrator</p>
                            </div>
                            <div class="flex gap-3">
                                <button type="button" onClick=${() => setShowLoginModal(false)} class="flex-1 py-4 text-slate-500 font-bold">Cancel</button>
                                <button type="submit" class="flex-1 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-blue-200">Verify</button>
                            </div>
                        </form>
                    </div>
                </div>
            `}
        </div>
    `;
};

const StudentDetail = ({ student, data, setData, onBack }) => {
    if (!student) return html`<div>Student not found</div>`;
    
    const settings = data.settings;
    const assessments = data.assessments.filter(a => a.studentId === student.id);
    const totalMarks = assessments.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
    const totalPoints = assessments.reduce((sum, a) => sum + (Storage.getGradeInfo(a.score || 0).points || 0), 0);

    const payments = data.payments.filter(p => p.studentId === student.id);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    
    const feeStructure = data.settings.feeStructures.find(f => f.grade === student.grade);
    const feeKeys = ['t1', 't2', 't3', 'breakfast', 'lunch', 'trip', 'bookFund', 'caution', 'uniform', 'studentCard', 'remedial'];
    
    // Calculate total due based ONLY on student's selected payable items
    const selectedKeys = student.selectedFees || ['t1', 't2', 't3'];
    const totalDue = feeStructure ? selectedKeys.reduce((sum, key) => sum + (feeStructure[key] || 0), 0) : 0;
    const balance = totalDue - totalPaid;

    const remark = (data.remarks || []).find(r => r.studentId === student.id) || { teacher: '', principal: '' };

    const handleRemarkChange = (field, val) => {
        const otherRemarks = (data.remarks || []).filter(r => r.studentId !== student.id);
        setData({
            ...data,
            remarks: [...otherRemarks, { ...remark, studentId: student.id, [field]: val }]
        });
    };

    return html`
        <div class="space-y-6">
            <button onClick=${onBack} class="text-blue-600 flex items-center gap-1 no-print">
                <span class="text-xl">←</span> Back to Students
            </button>
            
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:border-0 print:shadow-none print:p-0">
                <div class="hidden print:flex flex-col items-center text-center border-b pb-6 mb-6">
                    <img src="${settings.schoolLogo}" class="w-20 h-20 mb-2 object-contain" alt="Logo" />
                    <h1 class="text-3xl font-black uppercase text-slate-900">${settings.schoolName}</h1>
                    <p class="text-xs text-slate-500 font-medium">${settings.schoolAddress}</p>
                    <div class="mt-4 border-t border-slate-200 w-full pt-4">
                        <h2 class="text-lg font-extrabold uppercase tracking-widest text-blue-600">Progressive Student Report</h2>
                    </div>
                </div>

                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 print:border-b-2 print:border-black">
                    <div class="w-full">
                        <h2 class="text-2xl font-black border-b border-slate-100 pb-1 mb-3">${student.name}</h2>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-slate-500 text-xs">
                            <div>
                                <p class="text-[9px] font-bold text-slate-400 uppercase">Grade / Class</p>
                                <p class="font-bold text-slate-900">${student.grade}</p>
                            </div>
                            <div>
                                <p class="text-[9px] font-bold text-slate-400 uppercase">Stream / House</p>
                                <p class="font-bold text-slate-900">${student.stream || 'N/A'}</p>
                            </div>
                            <div>
                                <p class="text-[9px] font-bold text-slate-400 uppercase">Admission No.</p>
                                <p class="font-bold text-slate-900 font-mono">${student.admissionNo}</p>
                            </div>
                            <div>
                                <p class="text-[9px] font-bold text-slate-400 uppercase">Assess/UPI No.</p>
                                <p class="font-bold text-slate-900 font-mono">${student.assessmentNo || student.upiNo || '-'}</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2 no-print">
                        <button onClick=${() => window.print()} class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-200">Print Report Card</button>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-5 print:grid-cols-5 gap-3 mt-8 print:mt-4">
                    <div class="p-3 bg-blue-50 rounded-xl print:p-2">
                        <p class="text-[9px] text-blue-600 font-bold uppercase">Fee Balance</p>
                        <p class="text-lg font-bold print:text-xs">${data.settings.currency} ${balance.toLocaleString()}</p>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-xl print:p-2 border border-slate-100">
                        <p class="text-[9px] text-slate-500 font-bold uppercase">Total Marks</p>
                        <p class="text-lg font-bold print:text-xs">${totalMarks}</p>
                    </div>
                    <div class="p-3 bg-indigo-50 rounded-xl print:p-2">
                        <p class="text-[9px] text-indigo-600 font-bold uppercase">Total Points</p>
                        <p class="text-lg font-bold print:text-xs">${totalPoints}</p>
                    </div>
                    <div class="p-3 bg-green-50 rounded-xl print:p-2">
                        <p class="text-[9px] text-green-600 font-bold uppercase">Overall</p>
                        <p class="text-lg font-bold print:text-xs">ME</p>
                    </div>
                    <div class="p-3 bg-purple-50 rounded-xl print:p-2">
                        <p class="text-[9px] text-purple-600 font-bold uppercase">Attendance</p>
                        <p class="text-lg font-bold print:text-xs">94%</p>
                    </div>
                </div>

                <div class="mt-8 print:mt-6">
                    <h3 class="font-bold text-lg mb-4 print:mb-2 print:text-sm uppercase tracking-tight">Academic Competency Tracker</h3>
                    <div class="border rounded-xl overflow-hidden print:border-black print:rounded-none">
                        <table class="w-full text-left">
                            <thead class="bg-slate-50 print:bg-white border-b print:border-b-2 print:border-black">
                                <tr>
                                    <th class="p-4 text-xs font-bold uppercase">Learning Area</th>
                                    <th class="p-4 text-xs font-bold uppercase text-center">Score (%)</th>
                                    <th class="p-4 text-xs font-bold uppercase text-center">Points</th>
                                    <th class="p-4 text-xs font-bold uppercase text-center">Performance Level</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y print:divide-black">
                                ${Storage.getSubjectsForGrade(student.grade).map(subject => {
                                    const assessment = assessments.find(a => a.subject === subject);
                                    const mark = assessment?.score || '-';
                                    const gradeInfo = assessment ? Storage.getGradeInfo(assessment.score) : null;
                                    const levelCode = assessment?.level || 'N/A';
                                    const points = assessment ? gradeInfo.points : '-';
                                    
                                    return html`
                                        <tr class="print:break-inside-avoid">
                                            <td class="p-4 font-medium print:text-sm">
                                                ${subject}
                                                ${assessment && html`<p class="text-[9px] text-slate-400 font-normal hidden print:block">${gradeInfo.desc}</p>`}
                                            </td>
                                            <td class="p-4 text-center font-bold text-slate-700 print:text-sm">
                                                ${mark}
                                            </td>
                                            <td class="p-4 text-center font-bold text-blue-600 print:text-sm print:text-black">
                                                ${points}
                                            </td>
                                            <td class="p-4 text-center">
                                                <div class="flex flex-col items-center gap-1">
                                                    <span class=${`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                        levelCode.startsWith('EE') ? 'bg-green-100 text-green-700 print:text-black print:bg-white print:border print:border-black' :
                                                        levelCode.startsWith('ME') ? 'bg-blue-100 text-blue-700 print:text-black print:bg-white print:border print:border-black' :
                                                        levelCode.startsWith('AE') ? 'bg-yellow-100 text-yellow-700 print:text-black print:bg-white print:border print:border-black' :
                                                        levelCode.startsWith('BE') ? 'bg-red-100 text-red-700 print:text-black print:bg-white print:border print:border-black' :
                                                        'bg-slate-100 text-slate-500 print:text-slate-300 print:bg-white'
                                                    }`}>
                                                        ${levelCode}
                                                    </span>
                                                    ${assessment && html`<span class="text-[8px] font-bold text-slate-500 uppercase">${gradeInfo.label}</span>`}
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="mt-8 space-y-6 print:mt-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-xs font-bold text-slate-500 uppercase no-print">Class Teacher's Overall Comment</label>
                            <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 print:bg-white print:border-0 print:p-0">
                                <textarea 
                                    class="w-full bg-transparent border-0 focus:ring-0 text-sm italic outline-none no-print min-h-[80px]" 
                                    placeholder="Enter teacher comments..."
                                    value=${remark.teacher}
                                    onInput=${(e) => handleRemarkChange('teacher', e.target.value)}
                                ></textarea>
                                <div class="hidden print:block text-sm border-b-2 border-dotted border-black pb-1 mb-2">
                                    <span class="font-bold uppercase text-[10px] block mb-1">Class Teacher's Remarks:</span>
                                    ${remark.teacher || '____________________________________________________________________________________'}
                                </div>
                                <div class="hidden print:flex justify-between items-end mt-4">
                                    <div class="text-center w-48">
                                        <div class="h-8 mb-1 flex items-end justify-center">
                                            <img src="${settings.schoolLogo}" class="h-full opacity-10 grayscale" />
                                        </div>
                                        <div class="border-t border-black pt-1 text-[9px] font-bold uppercase">Class Teacher's Signature</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="text-xs font-bold text-slate-500 uppercase no-print">Principal's Overall Comment</label>
                            <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 print:bg-white print:border-0 print:p-0">
                                <textarea 
                                    class="w-full bg-transparent border-0 focus:ring-0 text-sm italic outline-none no-print min-h-[80px]" 
                                    placeholder="Enter principal comments..."
                                    value=${remark.principal}
                                    onInput=${(e) => handleRemarkChange('principal', e.target.value)}
                                ></textarea>
                                <div class="hidden print:block text-sm border-b-2 border-dotted border-black pb-1 mb-2">
                                    <span class="font-bold uppercase text-[10px] block mb-1">Principal's Remarks:</span>
                                    ${remark.principal || '____________________________________________________________________________________'}
                                </div>
                                <div class="hidden print:flex justify-between items-end mt-4">
                                    <div class="text-center w-48">
                                        <div class="h-8 mb-1 flex items-end justify-center">
                                            <img src="${settings.schoolLogo}" class="h-full opacity-20 grayscale" />
                                        </div>
                                        <div class="border-t border-black pt-1 text-[9px] font-bold uppercase">Principal's Signature & Stamp</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="pt-6 border-t border-slate-100 print:border-black text-center print:pt-4">
                        <p class="text-[10px] text-slate-400 font-medium italic">End of Term Progressive Report - ${settings.schoolName}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
};

render(html`<${App} />`, document.getElementById('app'));
