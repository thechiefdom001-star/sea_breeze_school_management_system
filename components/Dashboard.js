import { h } from 'preact';
import htm from 'htm';
import { Storage } from '../lib/storage.js';

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
        const fin = Storage.getStudentFinancials(s, data.payments, settings);
        return sum + fin.totalDue;
    }, 0);
    const totalArrears = expectedFees - totalFeesCollected;
    const feePercentage = expectedFees > 0 ? (totalFeesCollected / expectedFees) * 100 : 0;

    return html`
        <div class="space-y-8 animate-in fade-in duration-500">
            <div class="no-print">
                <h1 class="text-3xl font-extrabold tracking-tight">System Overview</h1>
                <p class="text-slate-500 mt-1">Welcome back to ${settings.schoolName || 'the portal'}.</p>
            </div>

            <!-- Horizontally scrollable panels on mobile -->
            <div class="flex overflow-x-auto no-scrollbar md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                <div class="min-w-[160px] md:min-w-0 flex-1"><${StatCard} title="Students" value=${totalStudents} subtitle="Enrollment" icon="👥" color="blue" /></div>
                <div class="min-w-[160px] md:min-w-0 flex-1"><${StatCard} title="Teachers" value=${totalTeachers} subtitle="Academic" icon="👨‍🏫" color="orange" /></div>
                <div class="min-w-[160px] md:min-w-0 flex-1"><${StatCard} title="Staff" value=${totalStaff} subtitle="Support" icon="🛠️" color="cyan" /></div>
                <div class="min-w-[160px] md:min-w-0 flex-1"><${StatCard} title="Paid" value=${`${settings.currency} ${totalFeesCollected.toLocaleString()}`} subtitle=${`${feePercentage.toFixed(1)}% Target`} icon="💰" color="green" /></div>
                <div class="min-w-[160px] md:min-w-0 flex-1"><${StatCard} title="Arrears" value=${`${settings.currency} ${totalArrears.toLocaleString()}`} subtitle="Outstanding" icon="⚠️" color="red" /></div>
                <div class="min-w-[160px] md:min-w-0 flex-1"><${StatCard} title="Assess" value=${assessments.length} subtitle="CBC Records" icon="📝" color="purple" /></div>
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
    const themes = {
        blue: { bg: 'bg-blue-600', text: 'text-white', sub: 'text-blue-100', iconBg: 'bg-blue-500', stripe: 'rgba(255,255,255,0.05)' },
        green: { bg: 'bg-emerald-600', text: 'text-white', sub: 'text-emerald-100', iconBg: 'bg-emerald-500', stripe: 'rgba(255,255,255,0.05)' },
        purple: { bg: 'bg-purple-600', text: 'text-white', sub: 'text-purple-100', iconBg: 'bg-purple-500', stripe: 'rgba(255,255,255,0.05)' },
        orange: { bg: 'bg-orange-500', text: 'text-white', sub: 'text-orange-100', iconBg: 'bg-orange-400', stripe: 'rgba(255,255,255,0.05)' },
        cyan: { bg: 'bg-cyan-600', text: 'text-white', sub: 'text-cyan-100', iconBg: 'bg-cyan-500', stripe: 'rgba(255,255,255,0.05)' },
        red: { bg: 'bg-rose-600', text: 'text-white', sub: 'text-rose-100', iconBg: 'bg-rose-500', stripe: 'rgba(255,255,255,0.05)' }
    };
    
    const theme = themes[color] || themes.blue;
    
    return html`
        <div 
            class=${`${theme.bg} ${theme.text} p-5 md:p-6 rounded-3xl shadow-lg border-0 hover:scale-[1.02] transition-all relative overflow-hidden group h-full`}
            style=${{
                backgroundImage: `linear-gradient(135deg, transparent 25%, ${theme.stripe} 25%, ${theme.stripe} 50%, transparent 50%, transparent 75%, ${theme.stripe} 75%, ${theme.stripe})`,
                backgroundSize: '20px 20px'
            }}
        >
            <div class=${`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 ${theme.iconBg} shadow-inner`}>
                ${icon}
            </div>
            <h4 class=${`${theme.sub} text-[10px] font-black uppercase tracking-widest`}>${title}</h4>
            <p class="text-xl md:text-2xl font-black mt-1 leading-tight">${value}</p>
            <p class=${`${theme.sub} text-[10px] font-bold mt-1 opacity-80`}>${subtitle}</p>
            
            <!-- Decorative circle -->
            <div class="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
        </div>
    `;
};