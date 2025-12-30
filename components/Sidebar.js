import { h } from 'preact';
import htm from 'htm';

const html = htm.bind(h);

export const Sidebar = ({ currentView, setView }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'students', label: 'Students', icon: '👥' },
        { id: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
        { id: 'staff', label: 'Staff', icon: '🛠️' },
        { id: 'marklist', label: 'Marklist', icon: '🏆' },
        { id: 'assessments', label: 'Assessments', icon: '📝' },
        { id: 'senior-school', label: 'Senior School', icon: '🎓' },
        { id: 'result-analysis', label: 'Result Analysis', icon: '📈' },
        { id: 'fees', label: 'Finance', icon: '💰' },
        { id: 'fees-register', label: 'Fees Register', icon: '📋' },
        { id: 'fee-reminder', label: 'Fee Reminder', icon: '🔔' },
        { id: 'transport', label: 'Transport', icon: '🚌' },
        { id: 'library', label: 'Library', icon: '📚' },
        { id: 'payroll', label: 'Payroll', icon: '🏦' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return html`
        <div class="contents no-print">
            <aside class="hidden md:flex flex-col w-64 bg-slate-900 text-white h-full overflow-hidden shrink-0">
                <nav class="flex-1 space-y-1 p-4 pt-2 overflow-y-auto no-scrollbar">
                    ${menuItems.map(item => html`
                        <button
                            key=${item.id}
                            onClick=${() => setView(item.id)}
                            class=${`w-full text-left px-4 py-3 rounded-xl transition-all ${
                                currentView === item.id ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            <span class="mr-3">${item.icon}</span> ${item.label}
                        </button>
                    `)}
                </nav>
            </aside>

            <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex overflow-x-auto no-scrollbar p-2 pb-safe z-50 gap-2 items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                ${menuItems.map(item => html`
                    <button
                        key=${item.id}
                        onClick=${() => setView(item.id)}
                        class=${`flex flex-col items-center justify-center p-3 px-5 rounded-2xl transition-all flex-none min-w-[70px] ${
                            currentView === item.id 
                                ? 'text-white bg-primary shadow-md shadow-blue-200 scale-105' 
                                : 'text-slate-400 bg-slate-50/50 active:bg-slate-100'
                        }`}
                    >
                        <span class="text-lg mb-1">${item.icon}</span>
                        <span class="text-[8px] font-black uppercase tracking-wider">${item.label.split(' ')[0]}</span>
                    </button>
                `)}
            </nav>
        </div>
    `;
};