import { h } from 'preact';
import htm from 'htm';

const html = htm.bind(h);

export const Dashboard = ({ data }) => {
    const students = data?.students || [];
    const payments = data?.payments || [];
    const assessments = data?.assessments || [];
    const settings = data?.settings || { currency: 'KES.', grades: [], feeStructures: [] };

    const totalStudents = students.length;
    const totalTeachers = (data?.teachers || []).length;
    const totalStaff = (data?.staff || []).length;
    const totalFeesCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const expectedFees = students.reduce((sum, s) => {
        const structure = settings.feeStructures?.find(f => f.grade === s.grade);
        const prev = Number(s.previousArrears) || 0;
        if (!structure) return sum + prev;
        const selected = s.selectedFees || ['t1', 't2', 't3'];
        const studentTotal = selected.reduce((sSum, key) => sSum + (structure[key] || 0), 0);
        return sum + studentTotal + prev;
    }, 0);
    const totalArrears = expectedFees - totalFeesCollected;
    const feePercentage = expectedFees > 0 ? (totalFeesCollected / expectedFees) * 100 : 0;

    return html`
        <div class="space-y-8 animate-in fade-in duration-500">
            <div class="no-print">
                <h1 class="text-3xl font-extrabold tracking-tight">System Overview</h1>
                <p class="text-slate-500 mt-1">Welcome back to ${settings.schoolName || 'the portal'}.</p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                <${StatCard} title="Students" value=${totalStudents} subtitle="Enrollment" icon="👥" color="blue" />
                <${StatCard} title="Teachers" value=${totalTeachers} subtitle="Academic" icon="👨‍🏫" color="orange" />
                <${StatCard} title="Staff" value=${totalStaff} subtitle="Support" icon="🛠️" color="cyan" />
                <${StatCard} title="Paid" value=${`${settings.currency} ${totalFeesCollected.toLocaleString()}`} subtitle=${`${feePercentage.toFixed(1)}% Target`} icon="💰" color="green" />
                <${StatCard} title="Arrears" value=${`${settings.currency} ${totalArrears.toLocaleString()}`} subtitle="Outstanding" icon="⚠️" color="red" />
                <${StatCard} title="Assess" value=${assessments.length} subtitle="CBC Records" icon="📝" color="purple" />
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 class="font-bold mb-4 flex items-center gap-2">
                        <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Recent Activity
                    </h3>
                    <div class="space-y-4">
                        ${payments.slice(-3).reverse().map(p => {
                            const student = students.find(s => s.id === p.studentId);
                            return html`
                                <div class="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <div>
                                        <p class="font-medium text-sm">${student?.name || 'Unknown Student'}</p>
                                        <p class="text-xs text-slate-400">Payment Received • ${p.date}</p>
                                    </div>
                                    <span class="text-green-600 font-bold text-sm">+${settings.currency} ${p.amount}</span>
                                </div>
                            `;
                        })}
                        ${payments.length === 0 && html`<p class="text-center text-slate-300 py-4 text-sm">No recent payments</p>`}
                    </div>
                </div>

                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 class="font-bold mb-6 flex items-center gap-2">
                        <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                        Student Enrollment per Grade
                    </h3>
                    <div class="flex items-end justify-between h-48 gap-2 px-2">
                        ${(settings.grades || []).map((grade, index) => {
                            const count = students.filter(s => s.grade === grade).length;
                            const maxCount = Math.max(...settings.grades.map(g => students.filter(s => s.grade === g).length), 1);
                            const heightPct = (count / maxCount) * 100;
                            const colors = ['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400', 'bg-pink-400', 'bg-yellow-400', 'bg-cyan-400', 'bg-indigo-400'];
                            const color = colors[index % colors.length];
                            
                            return html`
                                <div class="flex-1 flex flex-col items-center group relative h-full justify-end">
                                    <div class=${`w-full ${color} rounded-t-md opacity-80 hover:opacity-100 transition-all cursor-pointer relative`} style=${{ height: `${heightPct}%` }}>
                                        ${count > 0 && html`<span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">${count}</span>`}
                                    </div>
                                    <span class="text-[8px] font-bold text-slate-400 mt-2 uppercase rotate-45 origin-left whitespace-nowrap">${grade}</span>
                                </div>
                            `;
                        })}
                    </div>
                    ${totalStudents === 0 && html`<p class="text-center text-slate-300 py-12 text-sm">No enrollment data</p>`}
                </div>
            </div>
        </div>
    `;
};

const StatCard = ({ title, value, subtitle, icon, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
        cyan: 'bg-cyan-50 text-cyan-600',
        red: 'bg-red-50 text-red-600'
    };
    return html`
        <div class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class=${`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${colors[color]}`}>
                ${icon}
            </div>
            <h4 class="text-slate-500 text-sm font-medium">${title}</h4>
            <p class="text-2xl font-bold mt-1">${value}</p>
            <p class="text-slate-400 text-xs mt-1">${subtitle}</p>
        </div>
    `;
};