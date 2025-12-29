import { h } from 'preact';
import { useState } from 'preact/hooks';
import htm from 'htm';

const html = htm.bind(h);

export const Teachers = ({ data, setData }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newTeacher, setNewTeacher] = useState({ 
        name: '', 
        contact: '', 
        subjects: '', 
        grades: '',
        employeeNo: '',
        nssfNo: '',
        shifNo: '',
        taxNo: ''
    });

    const handleAdd = (e) => {
        e.preventDefault();
        if (editingId) {
            const updated = data.teachers.map(t => t.id === editingId ? { ...newTeacher, id: editingId } : t);
            setData({ ...data, teachers: updated });
            setEditingId(null);
        } else {
            const id = 'T-' + Date.now();
            setData({ ...data, teachers: [...(data.teachers || []), { ...newTeacher, id }] });
        }
        setShowAdd(false);
        resetForm();
    };

    const resetForm = () => {
        setNewTeacher({ 
            name: '', 
            contact: '', 
            subjects: '', 
            grades: '',
            employeeNo: '',
            nssfNo: '',
            shifNo: '',
            taxNo: ''
        });
        setEditingId(null);
    };

    const handleEdit = (teacher) => {
        setNewTeacher(teacher);
        setEditingId(teacher.id);
        setShowAdd(true);
    };

    const handleDelete = (id) => {
        if (confirm('Remove teacher from registry?')) {
            setData({ ...data, teachers: (data.teachers || []).filter(t => t.id !== id) });
        }
    };

    const teachers = data.teachers || [];

    return html`
        <div class="space-y-6">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div>
                    <h2 class="text-2xl font-bold">Teachers Registry</h2>
                    <p class="text-slate-500 text-sm">Academic staff management and assignments</p>
                </div>
                <div class="flex gap-2 w-full md:w-auto">
                    <button onClick=${() => window.print()} class="flex-1 md:flex-none bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-200">Print Table</button>
                    <button 
                        onClick=${() => { if(showAdd) resetForm(); setShowAdd(!showAdd); }}
                        class="flex-1 md:flex-none bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700"
                    >
                        ${showAdd ? 'Cancel' : 'Add Teacher'}
                    </button>
                </div>
            </div>

            ${showAdd && html`
                <form onSubmit=${handleAdd} class="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4 no-print animate-in slide-in-from-top-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                            <input placeholder="e.g. Jane Doe" required class="w-full p-3 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value=${newTeacher.name} onInput=${(e) => setNewTeacher({...newTeacher, name: e.target.value})} />
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Contact Number</label>
                            <input placeholder="e.g. +254 7..." required class="w-full p-3 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value=${newTeacher.contact} onInput=${(e) => setNewTeacher({...newTeacher, contact: e.target.value})} />
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Subjects (Comma separated)</label>
                            <input placeholder="e.g. Maths, Science" required class="w-full p-3 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value=${newTeacher.subjects} onInput=${(e) => setNewTeacher({...newTeacher, subjects: e.target.value})} />
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Classes (Comma separated)</label>
                            <input placeholder="e.g. Grade 1, Grade 2" required class="w-full p-3 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value=${newTeacher.grades} onInput=${(e) => setNewTeacher({...newTeacher, grades: e.target.value})} />
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Employee No.</label>
                            <input placeholder="e.g. T-001" required class="w-full p-3 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value=${newTeacher.employeeNo} onInput=${(e) => setNewTeacher({...newTeacher, employeeNo: e.target.value})} />
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">NSSF No.</label>
                            <input placeholder="e.g. 100..." class="w-full p-3 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value=${newTeacher.nssfNo} onInput=${(e) => setNewTeacher({...newTeacher, nssfNo: e.target.value})} />
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">SHIF No.</label>
                            <input placeholder="e.g. S-..." class="w-full p-3 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value=${newTeacher.shifNo} onInput=${(e) => setNewTeacher({...newTeacher, shifNo: e.target.value})} />
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Tax (PIN) No.</label>
                            <input placeholder="e.g. A00..." class="w-full p-3 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value=${newTeacher.taxNo} onInput=${(e) => setNewTeacher({...newTeacher, taxNo: e.target.value})} />
                        </div>
                    </div>
                    <button class="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors">
                        ${editingId ? 'Update Teacher Profile' : 'Register Teacher'}
                    </button>
                </form>
            `}

            <div class="grid grid-cols-1 gap-6">
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Name</th>
                                <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Emp No</th>
                                <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Contact</th>
                                <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Subjects</th>
                                <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Classes</th>
                                <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase no-print">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            ${teachers.map(t => html`
                                <tr key=${t.id} class="even:bg-slate-50/50 hover:bg-blue-50/50 transition-colors">
                                    <td class="px-6 py-4">
                                        <div class="font-bold text-sm">${t.name}</div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="text-xs font-mono text-slate-600">${t.employeeNo || t.id}</div>
                                    </td>
                                    <td class="px-6 py-4 text-slate-600 text-sm font-medium">${t.contact || 'N/A'}</td>
                                    <td class="px-6 py-4">
                                        <div class="flex flex-wrap gap-1">
                                            ${(t.subjects || t.subject || '').split(',').map(s => html`
                                                <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">${s.trim()}</span>
                                            `)}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex flex-wrap gap-1">
                                            ${(t.grades || t.grade || '').split(',').map(g => html`
                                                <span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">${g.trim()}</span>
                                            `)}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 no-print">
                                        <div class="flex gap-2">
                                            <button onClick=${() => handleEdit(t)} class="text-blue-600 text-[10px] font-bold uppercase hover:underline">Edit</button>
                                            <button onClick=${() => handleDelete(t.id)} class="text-red-500 text-[10px] font-bold uppercase hover:underline">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            `)}
                            ${teachers.length === 0 && html`<tr><td colspan="4" class="p-12 text-center text-slate-300">No teachers registered yet.</td></tr>`}
                        </tbody>
                    </table>
                </div>

                <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm no-print">
                    <h3 class="font-bold mb-4 flex items-center gap-2">
                        <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Subject Load Distribution
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        ${[...new Set(teachers.flatMap(t => (t.subjects || t.subject || '').split(',').map(s => s.trim())))].filter(s => s).map(subject => {
                            const count = teachers.filter(t => (t.subjects || t.subject || '').includes(subject)).length;
                            const totalLoad = teachers.flatMap(t => (t.subjects || t.subject || '').split(',')).length;
                            const pct = totalLoad > 0 ? (count / teachers.length) * 100 : 0;
                            return html`
                                <div class="space-y-1">
                                    <div class="flex justify-between text-xs font-bold text-slate-600">
                                        <span>${subject}</span>
                                        <span>${count} Teachers</span>
                                    </div>
                                    <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div class="h-full bg-blue-500 rounded-full" style=${{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            `;
                        })}
                        ${teachers.length === 0 && html`<div class="text-center text-slate-300 py-10">No teacher data to visualize</div>`}
                    </div>
                </div>
            </div>
        </div>
    `;
};