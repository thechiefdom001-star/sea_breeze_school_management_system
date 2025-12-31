import { h } from 'preact';
import htm from 'htm';

const html = htm.bind(h);

export const Sidebar = ({ currentView, setView, isCollapsed, isMobileHidden }) => {
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
            <!-- Desktop Sidebar -->
            <aside class=${`hidden md:flex flex-col bg-slate-900 text-white h-full overflow-hidden shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
                <nav class="flex-1 space-y-1 p-4 pt-2 overflow-y-auto no-scrollbar">
                    ${menuItems.map(item => html`
                        <button
                            key=${item.id}
                            onClick=${() => setView(item.id)}
                            title=${isCollapsed ? item.label : ''}
                            class=${`w-full text-left rounded-xl transition-all flex items-center ${isCollapsed ? 'justify-center px-0 py-4' : 'px-4 py-3'} ${
                                currentView === item.id 
                                    ? 'bg-primary text-white shadow-lg shadow-black/20' 
                                    : 'text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            <span class=${isCollapsed ? 'text-xl' : 'mr-3'}>${item.icon}</span> 
                            ${!isCollapsed && html`<span class="font-medium">${item.label}</span>`}
                        </button>
                    `)}
                </nav>
            </aside>

            <!-- Mobile Bottom Navigation -->
            <nav class=${`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex overflow-x-auto no-scrollbar p-2 pb-safe z-50 gap-2 items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-transform duration-300 ${isMobileHidden ? 'translate-y-full' : 'translate-y-0'}`}>
                ${menuItems.map(item => html`
                    <button
                        key=${item.id}
                        onClick=${() => setView(item.id)}
                        class=${`flex flex-col items-center justify-center p-3 px-5 rounded-2xl transition-all flex-none min-w-[70px] ${
                            currentView === item.id 
                                ? 'text-white bg-primary shadow-md shadow-black/10 scale-105' 
                                : 'text-slate-400 bg-slate-50/50 active:bg-slate-100'
                        }`}
                    >
                        <span class="text-lg mb-1">${item.icon}</span>
                        <span class="text-[8px] font-black uppercase tracking-wider">${item.label.split(' ')[0]}</span>
                    </button>
                `)}
            </nav>
            
            <!-- Mobile Toggle Floating Button (Optional hint) -->
            ${isMobileHidden && html`
                <button 
                    onClick=${() => setView(currentView)} 
                    class="md:hidden fixed bottom-6 right-6 w-12 h-12 bg-primary text-white rounded-full shadow-lg z-[60] flex items-center justify-center animate-bounce"
                    title="Show Menu"
                >
                    <span class="text-xl">☰</span>
                </button>
            `}
        </div>
    `;
};