import { h } from 'preact';
import { useState } from 'preact/hooks';
import htm from 'htm';

const html = htm.bind(h);

export const Settings = ({ data, setData }) => {
    const [updating, setUpdating] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [pendingImportData, setPendingImportData] = useState(null);
    const [importSelections, setImportSelections] = useState({
        students: true,
        marks: true,
        staff: true,
        finance: true,
        settings: true,
        modules: true
    });
    
    const updateFee = (grade, field, val) => {
        const newStructures = data.settings.feeStructures.map(f => 
            f.grade === grade ? { ...f, [field]: Number(val) } : f
        );
        setData({
            ...data,
            settings: { ...data.settings, feeStructures: newStructures }
        });
    };

    const handleUpdateProfile = () => {
        setUpdating(true);
        setTimeout(() => setUpdating(false), 1500);
    };

    const handleImageUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const url = await window.websim.upload(file);
            setData({
                ...data, 
                settings: { ...data.settings, [field]: url }
            });
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image. Please try again.');
        }
    };

    const feeColumns = [
        { key: 'admission', label: 'Adm' },
        { key: 'diary', label: 'Diary' },
        { key: 'development', label: 'Dev' },
        { key: 't1', label: 'T1' },
        { key: 't2', label: 'T2' },
        { key: 't3', label: 'T3' },
        { key: 'boarding', label: 'Board' },
        { key: 'breakfast', label: 'Brkfast' },
        { key: 'lunch', label: 'Lunch' },
        { key: 'trip', label: 'Trip' },
        { key: 'bookFund', label: 'Books' },
        { key: 'caution', label: 'Caution' },
        { key: 'uniform', label: 'Uniform' },
        { key: 'studentCard', label: 'Card' },
        { key: 'remedial', label: 'Remed' },
        { key: 'assessmentFee', label: 'Exam' },
        { key: 'projectFee', label: 'Project' }
    ];

    const handleExport = () => {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `edutrack_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                setPendingImportData(importedData);
                setShowImportModal(true);
            } catch (err) {
                alert('Invalid backup file.');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    };

    const processImport = () => {
        if (!pendingImportData) return;

        let newData = { ...data };

        if (importSelections.students) {
            newData.students = pendingImportData.students || [];
        }
        if (importSelections.marks) {
            newData.assessments = pendingImportData.assessments || [];
            newData.remarks = pendingImportData.remarks || [];
        }
        if (importSelections.staff) {
            newData.teachers = pendingImportData.teachers || [];
            newData.staff = pendingImportData.staff || [];
        }
        if (importSelections.finance) {
            newData.payments = pendingImportData.payments || [];
            newData.payroll = pendingImportData.payroll || [];
        }
        if (importSelections.settings) {
            newData.settings = { 
                ...pendingImportData.settings,
                // Keep logo if not provided in import
                schoolLogo: pendingImportData.settings?.schoolLogo || data.settings.schoolLogo
            };
        }
        if (importSelections.modules) {
            newData.transport = pendingImportData.transport || { routes: [], assignments: [] };
            newData.library = pendingImportData.library || { books: [], transactions: [] };
        }

        setData(newData);
        setShowImportModal(false);
        setPendingImportData(null);
        alert('Selected data has been imported successfully!');
    };

    return html`
        <div class="space-y-8 pb-20">
            <div class="no-print">
                <h2 class="text-2xl font-bold">School Settings</h2>
                <p class="text-slate-500">Configure school profile, themes, and complex fee structures</p>
            </div>

            <div class="grid grid-cols-1 gap-8">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 class="font-bold mb-6 flex items-center gap-2">
                        <span class="w-4 h-4 bg-blue-500 rounded text-white flex items-center justify-center text-[10px]">🎨</span>
                        Appearance & Branding
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="space-y-1">
                            <label class="text-xs font-bold text-slate-500 uppercase">System Theme</label>
                            <select 
                                class="w-full p-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:border-blue-400"
                                value=${data.settings.theme || 'light'}
                                onChange=${(e) => setData({...data, settings: {...data.settings, theme: e.target.value}})}
                            >
                                <option value="light">☀️ Light Mode</option>
                                <option value="dark">🌙 Dark Mode</option>
                            </select>
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-bold text-slate-500 uppercase">Primary Color</label>
                            <div class="flex gap-2">
                                <input 
                                    type="color"
                                    class="w-12 h-12 p-1 rounded-xl cursor-pointer bg-slate-50 border border-slate-100"
                                    value=${data.settings.primaryColor || '#2563eb'}
                                    onInput=${(e) => setData({...data, settings: {...data.settings, primaryColor: e.target.value}})}
                                />
                                <input 
                                    class="flex-1 p-3 bg-slate-50 rounded-xl outline-none border border-slate-100 text-xs font-mono"
                                    value=${data.settings.primaryColor}
                                    onInput=${(e) => setData({...data, settings: {...data.settings, primaryColor: e.target.value}})}
                                />
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-bold text-slate-500 uppercase">Secondary Color</label>
                            <div class="flex gap-2">
                                <input 
                                    type="color"
                                    class="w-12 h-12 p-1 rounded-xl cursor-pointer bg-slate-50 border border-slate-100"
                                    value=${data.settings.secondaryColor || '#64748b'}
                                    onInput=${(e) => setData({...data, settings: {...data.settings, secondaryColor: e.target.value}})}
                                />
                                <input 
                                    class="flex-1 p-3 bg-slate-50 rounded-xl outline-none border border-slate-100 text-xs font-mono"
                                    value=${data.settings.secondaryColor}
                                    onInput=${(e) => setData({...data, settings: {...data.settings, secondaryColor: e.target.value}})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 class="font-bold mb-4 flex items-center gap-2">
                        <span class="w-4 h-4 bg-blue-500 rounded text-white flex items-center justify-center text-[10px]">💾</span>
                        Data Management
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="p-4 border border-slate-100 rounded-xl bg-slate-50">
                            <h4 class="text-xs font-black uppercase text-slate-400 mb-2">Backup System</h4>
                            <p class="text-[10px] text-slate-500 mb-4">Export all your school data including students, marks, and financial records to a JSON file.</p>
                            <button 
                                onClick=${handleExport}
                                class="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors"
                            >
                                Export Data (JSON)
                            </button>
                        </div>
                        <div class="p-4 border border-slate-100 rounded-xl bg-slate-50">
                            <h4 class="text-xs font-black uppercase text-slate-400 mb-2">Restore System</h4>
                            <p class="text-[10px] text-slate-500 mb-4">Upload a previously exported backup file to restore your school database.</p>
                            <label class="block">
                                <span class="sr-only">Choose backup file</span>
                                <input 
                                    type="file" 
                                    accept=".json" 
                                    onChange=${handleImportFile}
                                    class="block w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 class="font-bold mb-4 flex items-center gap-2">
                        <span class="w-4 h-4 bg-purple-500 rounded text-white flex items-center justify-center text-[10px]">K</span>
                        KNEC KJSEA Grading System
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        ${[
                            { l: 'EE1', p: '8 pts', r: '90-100%', c: 'bg-green-500', t: 'Exceptional' },
                            { l: 'EE2', p: '7 pts', r: '75-89%', c: 'bg-green-400', t: 'Very Good' },
                            { l: 'ME1', p: '6 pts', r: '58-74%', c: 'bg-blue-500', t: 'Good' },
                            { l: 'ME2', p: '5 pts', r: '41-57%', c: 'bg-blue-400', t: 'Fair' },
                            { l: 'AE1', p: '4 pts', r: '31-40%', c: 'bg-yellow-500', t: 'Needs Impr.' },
                            { l: 'AE2', p: '3 pts', r: '21-30%', c: 'bg-yellow-400', t: 'Below Avg.' },
                            { l: 'BE1', p: '2 pts', r: '11-20%', c: 'bg-red-400', t: 'Well Below' },
                            { l: 'BE2', p: '1 pt', r: '1-10%', c: 'bg-red-500', t: 'Minimal' }
                        ].map(g => html`
                            <div class="p-3 border border-slate-100 rounded-xl bg-slate-50 flex items-center gap-3">
                                <div class=${`w-8 h-8 rounded-lg ${g.c} text-white flex items-center justify-center font-black text-[10px]`}>${g.l}</div>
                                <div>
                                    <p class="text-[10px] font-bold text-slate-700">${g.r}</p>
                                    <p class="text-[8px] text-slate-400 uppercase font-bold">${g.t}</p>
                                </div>
                            </div>
                        `)}
                    </div>
                </div>

                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <h3 class="font-bold mb-6">Fee Structure per Grade (${data.settings.currency})</h3>
                    <div class="overflow-x-auto no-scrollbar">
                        <table class="w-full text-[10px] text-left border-collapse">
                            <thead class="bg-slate-50 text-slate-500 uppercase font-bold sticky top-0">
                                <tr>
                                    <th class="p-2 border bg-slate-50 min-w-[80px]">Grade</th>
                                    ${feeColumns.map(col => html`<th class="p-2 border min-w-[60px] text-center">${col.label}</th>`)}
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${data.settings.feeStructures.map(fee => html`
                                    <tr key=${fee.grade}>
                                        <td class="p-2 font-bold text-slate-700 border bg-white">${fee.grade}</td>
                                        ${feeColumns.map(col => html`
                                            <td class="p-1 border">
                                                <input 
                                                    type="number" 
                                                    class="w-full p-1 bg-slate-50 rounded text-center focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none" 
                                                    value=${fee[col.key] || 0} 
                                                    onInput=${(e) => updateFee(fee.grade, col.key, e.target.value)} 
                                                />
                                            </td>
                                        `)}
                                    </tr>
                                `)}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Selective Import Modal -->
                ${showImportModal && html`
                    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <div class="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <h3 class="text-2xl font-black mb-2">Selective Import</h3>
                            <p class="text-slate-400 text-sm mb-6">Choose which data categories to override. Deselected categories will keep your current data.</p>
                            
                            <div class="grid grid-cols-1 gap-3 mb-8">
                                ${[
                                    { id: 'students', label: 'Students Directory', icon: '👥' },
                                    { id: 'marks', label: 'Marks & Assessments', icon: '📝' },
                                    { id: 'staff', label: 'Teachers & Staff', icon: '👨‍🏫' },
                                    { id: 'finance', label: 'Financial Records', icon: '💰' },
                                    { id: 'settings', label: 'System Settings & Fees', icon: '⚙️' },
                                    { id: 'modules', label: 'Transport & Library', icon: '🚌' }
                                ].map(cat => html`
                                    <label class=${`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                        importSelections[cat.id] ? 'border-primary bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'
                                    }`}>
                                        <div class="flex items-center gap-3">
                                            <span class="text-xl">${cat.icon}</span>
                                            <span class="font-bold text-sm text-slate-700">${cat.label}</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                            checked=${importSelections[cat.id]}
                                            onChange=${() => setImportSelections({...importSelections, [cat.id]: !importSelections[cat.id]})}
                                        />
                                    </label>
                                `)}
                            </div>

                            <div class="flex gap-3">
                                <button onClick=${() => { setShowImportModal(false); setPendingImportData(null); }} class="flex-1 py-4 text-slate-500 font-bold">Cancel</button>
                                <button onClick=${processImport} class="flex-1 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-blue-200">Import Selected</button>
                            </div>
                        </div>
                    </div>
                `}

                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 class="font-bold mb-6">School Profile</h3>
                    <div class="space-y-6">
                        <div class="flex flex-col md:flex-row gap-6 items-center border-b pb-6">
                            <label class="relative w-24 h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer group">
                                <img src="${data.settings.schoolLogo}" class="w-full h-full object-contain" />
                                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span class="text-[10px] text-white font-bold text-center">Upload Logo</span>
                                </div>
                                <input type="file" accept="image/*" class="hidden" onChange=${(e) => handleImageUpload(e, 'schoolLogo')} />
                            </label>
                            <div class="flex-1 space-y-4 w-full">
                                <div class="space-y-1">
                                    <label class="text-xs font-bold text-slate-500 uppercase">Logo Source URL</label>
                                    <div class="flex gap-2">
                                        <input 
                                            class="flex-1 p-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:border-blue-400 text-xs"
                                            value=${data.settings.schoolLogo}
                                            onInput=${(e) => setData({...data, settings: {...data.settings, schoolLogo: e.target.value}})}
                                            placeholder="Paste logo URL or upload"
                                        />
                                    </div>
                                    <p class="text-[10px] text-slate-400">Recommended: Transparent PNG, square aspect ratio.</p>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
                            <div class="space-y-3">
                                <label class="text-xs font-bold text-slate-500 uppercase block">Principal's Signature</label>
                                <div class="flex items-center gap-4">
                                    <label class="w-24 h-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer group shrink-0">
                                        <img src="${data.settings.principalSignature}" class="w-full h-full object-contain" />
                                        <div class="absolute w-24 h-12 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span class="text-[8px] text-white font-bold">Upload</span>
                                        </div>
                                        <input type="file" accept="image/*" class="hidden" onChange=${(e) => handleImageUpload(e, 'principalSignature')} />
                                    </label>
                                    <input 
                                        class="flex-1 p-3 bg-slate-50 rounded-xl outline-none border border-slate-100 text-[10px]"
                                        value=${data.settings.principalSignature}
                                        onInput=${(e) => setData({...data, settings: {...data.settings, principalSignature: e.target.value}})}
                                        placeholder="Signature Image URL"
                                    />
                                </div>
                            </div>
                            <div class="space-y-3">
                                <label class="text-xs font-bold text-slate-500 uppercase block">Accounts Clerk's Signature</label>
                                <div class="flex items-center gap-4">
                                    <label class="w-24 h-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer group shrink-0">
                                        <img src="${data.settings.clerkSignature}" class="w-full h-full object-contain" />
                                        <div class="absolute w-24 h-12 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span class="text-[8px] text-white font-bold">Upload</span>
                                        </div>
                                        <input type="file" accept="image/*" class="hidden" onChange=${(e) => handleImageUpload(e, 'clerkSignature')} />
                                    </label>
                                    <input 
                                        class="flex-1 p-3 bg-slate-50 rounded-xl outline-none border border-slate-100 text-[10px]"
                                        value=${data.settings.clerkSignature}
                                        onInput=${(e) => setData({...data, settings: {...data.settings, clerkSignature: e.target.value}})}
                                        placeholder="Signature Image URL"
                                    />
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <label class="text-xs font-bold text-slate-500 uppercase">School Name</label>
                                <input 
                                    class="w-full p-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:border-blue-400"
                                    value=${data.settings.schoolName}
                                    onInput=${(e) => setData({...data, settings: {...data.settings, schoolName: e.target.value}})}
                                />
                            </div>
                            <div class="space-y-1">
                                <label class="text-xs font-bold text-slate-500 uppercase">School Address</label>
                                <input 
                                    class="w-full p-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:border-blue-400"
                                    value=${data.settings.schoolAddress}
                                    onInput=${(e) => setData({...data, settings: {...data.settings, schoolAddress: e.target.value}})}
                                />
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-bold text-slate-500 uppercase">Academic Year</label>
                            <select 
                                class="w-full p-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:border-blue-400 font-bold"
                                value=${data.settings.academicYear || '2024/2025'}
                                onChange=${(e) => setData({...data, settings: {...data.settings, academicYear: e.target.value}})}
                            >
                                ${Array.from({ length: 27 }, (_, i) => 2024 + i).map(year => html`
                                    <option value="${year}/${year + 1}">${year}/${year + 1}</option>
                                `)}
                            </select>
                        </div>
                        <button 
                            onClick=${handleUpdateProfile}
                            class=${`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${updating ? 'bg-green-500 text-white shadow-green-100' : 'bg-blue-600 text-white shadow-blue-100'}`}
                        >
                            ${updating ? '✓ Changes Saved Successfully' : 'Update School Profile'}
                        </button>
                    </div>
                </div>
            </div>

            <div class="p-6 bg-red-50 rounded-2xl border border-red-100">
                <h4 class="text-red-700 font-bold mb-2">Danger Zone</h4>
                <p class="text-red-600 text-sm mb-4">Resetting all data will clear students, payments, and assessment records permanently.</p>
                <button 
                    onClick=${() => { if(confirm('Are you sure?')) { localStorage.clear(); location.reload(); } }}
                    class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm"
                >
                    Reset System Data
                </button>
            </div>
        </div>
    `;
};