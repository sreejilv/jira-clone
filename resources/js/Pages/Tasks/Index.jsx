import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useCallback, useRef } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import Select from 'react-select';

const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: '38px',
        borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
        boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
        '&:hover': { borderColor: '#6366f1' },
        borderRadius: '6px',
        fontSize: '0.875rem',
    }),
    option: (base, state) => ({
        ...base,
        fontSize: '0.875rem',
        backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#e0e7ff' : 'white',
        color: state.isSelected ? 'white' : '#111827',
    }),
    placeholder: (base) => ({ ...base, color: '#9ca3af', fontSize: '0.875rem' }),
    singleValue: (base) => ({ ...base, fontSize: '0.875rem' }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
};

export default function Index({ tasks, projects, users, filters }) {
    const authUser = usePage().props.auth.user;
    const isAdmin = authUser.roles?.includes('Admin');
    
    const [isCreating, setIsCreating] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [clientErrors, setClientErrors] = useState({});
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        project_id: '',
        assigned_to: '',
    });

    // Map to react-select options format
    const userOptions = users.map(u => ({ value: u.id, label: u.name }));
    const projectOptions = projects.map(p => ({ value: p.id, label: p.name }));

    // Current filter values as react-select value objects
    const filterProjectVal = filters.project_id
        ? projectOptions.find(o => o.value == filters.project_id) || null
        : null;
    const filterUserVal = filters.assigned_to
        ? userOptions.find(o => o.value == filters.assigned_to) || null
        : null;
    const filterStatusVal = filters.status ? { value: filters.status, label: statusLabel(filters.status) } : null;

    function statusLabel(s) {
        return { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }[s] || s;
    }

    const statusOptions = [
        { value: 'todo', label: 'To Do' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'done', label: 'Done' },
    ];

    const priorityOptions = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
    ];

    // Debounced filter handler
    const debouncedFilter = useCallback(
        debounce((updatedFilters) => {
            // Clean out undefined/null keys
            const clean = Object.fromEntries(
                Object.entries(updatedFilters).filter(([, v]) => v != null && v !== '')
            );
            router.get(route('tasks.index'), clean, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 350),
        []
    );

    const handleFilterChange = (key, value) => {
        const updated = {
            status: filters.status || '',
            project_id: filters.project_id || '',
            assigned_to: filters.assigned_to || '',
            [key]: value ?? '',
        };
        debouncedFilter(updated);
    };

    const clearFilters = () => {
        router.get(route('tasks.index'), {}, { preserveState: false });
    };

    const validate = () => {
        // Users editing an existing task only need to set status — no other validation needed
        if (editingTask && !isAdmin) return true;
        const errs = {};
        if (!data.name.trim()) errs.name = 'Task title is required.';
        if (!data.project_id) errs.project_id = 'Please select a project.';
        if (!data.assigned_to) errs.assigned_to = 'Please assign this task to a user.';
        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const openCreate = () => {
        reset();
        clearErrors();
        setClientErrors({});
        setEditingTask(null);
        setIsCreating(true);
    };

    const openEdit = (task) => {
        clearErrors();
        setClientErrors({});
        setData({
            name: task.name,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            project_id: task.project_id,
            assigned_to: task.assigned_to || '',
        });
        setEditingTask(task);
        setIsCreating(true);
    };

    const closeForm = () => {
        setIsCreating(false);
        setEditingTask(null);
        reset();
        clearErrors();
        setClientErrors({});
    };

    const submit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        // For non-admin status updates, show confirm dialog first
        if (editingTask && !isAdmin) {
            setShowConfirm(true);
            return;
        }

        if (editingTask) {
            put(route('tasks.update', editingTask.id), { onSuccess: closeForm });
        } else {
            post(route('tasks.store'), { onSuccess: closeForm });
        }
    };

    const confirmStatusUpdate = () => {
        setShowConfirm(false);
        put(route('tasks.update', editingTask.id), { onSuccess: closeForm });
    };

    const statusColors = {
        todo: 'bg-gray-100 text-gray-700',
        in_progress: 'bg-blue-100 text-blue-700',
        done: 'bg-green-100 text-green-700',
    };

    const priorityColors = {
        low: 'bg-slate-100 text-slate-600',
        medium: 'bg-yellow-100 text-yellow-700',
        high: 'bg-red-100 text-red-700',
    };

    const hasActiveFilters = filters.status || filters.project_id || filters.assigned_to;

    return (
        <AuthenticatedLayout header={
            <h2 className="text-xl font-semibold leading-tight text-gray-800">Tasks Board</h2>
        }>
            <Head title="Tasks" />

            <div className="py-12 pb-24">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* Controls Bar */}
                    <div className="mb-6 flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex-1 min-w-0">
                            <Select
                                instanceId="filter-project"
                                isClearable
                                placeholder="Filter by project…"
                                options={projectOptions}
                                value={filterProjectVal}
                                styles={selectStyles}
                                onChange={(opt) => handleFilterChange('project_id', opt?.value ?? '')}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Select
                                instanceId="filter-status"
                                isClearable
                                placeholder="Filter by status…"
                                options={statusOptions}
                                value={filterStatusVal}
                                styles={selectStyles}
                                onChange={(opt) => handleFilterChange('status', opt?.value ?? '')}
                            />
                        </div>
                        {isAdmin && (
                            <div className="flex-1 min-w-0">
                                <Select
                                    instanceId="filter-user"
                                    isClearable
                                    placeholder="Filter by assignee…"
                                    options={userOptions}
                                    value={filterUserVal}
                                    styles={selectStyles}
                                    onChange={(opt) => handleFilterChange('assigned_to', opt?.value ?? '')}
                                />
                            </div>
                        )}
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 whitespace-nowrap font-medium transition px-2">
                                Clear filters
                            </button>
                        )}
                        {isAdmin && (
                            <PrimaryButton onClick={isCreating && !editingTask ? closeForm : openCreate} className="whitespace-nowrap">
                                {isCreating && !editingTask ? 'Cancel' : '+ Create Task'}
                            </PrimaryButton>
                        )}
                    </div>

                    {/* Create / Edit Form */}
                    {isCreating && (
                        <div className="mb-6 bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100">
                            <div className="border-b p-4 bg-gray-50/50">
                                <h4 className="font-semibold text-gray-700">
                                    {editingTask
                                        ? (isAdmin ? 'Edit Task' : `Update Status — ${editingTask.name}`)
                                        : 'Create New Task'}
                                </h4>
                            </div>
                            <form onSubmit={submit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* User editing: all details read-only, only status editable */}
                                {editingTask && !isAdmin ? (
                                    <>
                                        {/* Read-only task details */}
                                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <div>
                                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Title</p>
                                                <p className="text-sm font-semibold text-gray-800">{editingTask.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Project</p>
                                                <p className="text-sm text-gray-700">{editingTask.project?.name ?? '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Priority</p>
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${priorityColors[editingTask.priority]}`}>
                                                    {editingTask.priority}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Assignee</p>
                                                <p className="text-sm text-gray-700">{editingTask.assignee?.name ?? 'Unassigned'}</p>
                                            </div>
                                            {editingTask.description && (
                                                <div className="col-span-2">
                                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Description</p>
                                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{editingTask.description}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Editable status only */}
                                        <div className="col-span-2 max-w-xs">
                                            <InputLabel value="Update Status" />
                                            <div className="mt-1">
                                                <Select
                                                    instanceId="user-edit-status"
                                                    options={statusOptions}
                                                    value={statusOptions.find(o => o.value === data.status) || null}
                                                    styles={selectStyles}
                                                    onChange={(opt) => setData('status', opt?.value ?? 'todo')}
                                                />
                                            </div>
                                            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Title */}
                                        <div className="col-span-2">
                                            <InputLabel htmlFor="name" value="Task Title" />
                                            <input
                                                id="name"
                                                type="text"
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                                value={data.name}
                                                onChange={(e) => { setData('name', e.target.value); setClientErrors(p => ({ ...p, name: '' })); }}
                                                autoFocus
                                            />
                                            {(clientErrors.name || errors.name) && (
                                                <p className="text-red-500 text-xs mt-1">{clientErrors.name || errors.name}</p>
                                            )}
                                        </div>

                                        {/* Project */}
                                        <div>
                                            <InputLabel value="Project" />
                                            <div className="mt-1">
                                                <Select
                                                    instanceId="form-project"
                                                    placeholder="Type to search project…"
                                                    options={projectOptions}
                                                    value={projectOptions.find(o => o.value == data.project_id) || null}
                                                    styles={selectStyles}
                                                    onChange={(opt) => { setData('project_id', opt?.value ?? ''); setClientErrors(p => ({ ...p, project_id: '' })); }}
                                                />
                                            </div>
                                            {(clientErrors.project_id || errors.project_id) && (
                                                <p className="text-red-500 text-xs mt-1">{clientErrors.project_id || errors.project_id}</p>
                                            )}
                                        </div>

                                        {/* Assignee */}
                                        <div>
                                            <InputLabel value="Assign To" />
                                            <div className="mt-1">
                                                <Select
                                                    instanceId="form-user"
                                                    placeholder="Type to search user…"
                                                    options={userOptions}
                                                    value={userOptions.find(o => o.value == data.assigned_to) || null}
                                                    styles={selectStyles}
                                                    onChange={(opt) => { setData('assigned_to', opt?.value ?? ''); setClientErrors(p => ({ ...p, assigned_to: '' })); }}
                                                />
                                            </div>
                                            {(clientErrors.assigned_to || errors.assigned_to) && (
                                                <p className="text-red-500 text-xs mt-1">{clientErrors.assigned_to || errors.assigned_to}</p>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div className="col-span-2">
                                            <InputLabel value="Description" />
                                            <textarea
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                                rows="3"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                            />
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <InputLabel value="Status" />
                                            <div className="mt-1">
                                                <Select
                                                    instanceId="form-status"
                                                    options={statusOptions}
                                                    value={statusOptions.find(o => o.value === data.status) || null}
                                                    styles={selectStyles}
                                                    onChange={(opt) => setData('status', opt?.value ?? 'todo')}
                                                />
                                            </div>
                                        </div>

                                        {/* Priority */}
                                        <div>
                                            <InputLabel value="Priority" />
                                            <div className="mt-1">
                                                <Select
                                                    instanceId="form-priority"
                                                    options={priorityOptions}
                                                    value={priorityOptions.find(o => o.value === data.priority) || null}
                                                    styles={selectStyles}
                                                    onChange={(opt) => setData('priority', opt?.value ?? 'medium')}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="col-span-2 flex justify-end mt-2">
                                    <PrimaryButton disabled={processing}>
                                        {editingTask ? (isAdmin ? 'Update Task' : 'Update Status') : 'Save Task'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Task Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl">
                        <table className="w-full text-left text-sm text-gray-500">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Task</th>
                                    <th className="px-6 py-4">Project</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Priority</th>
                                    {isAdmin && <th className="px-6 py-4">Assignee</th>}
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.data.map((task) => (
                                    <tr key={task.id} className="border-b bg-white hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{task.name}</p>
                                            {task.description && (
                                                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{task.description}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{task.project?.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${statusColors[task.status]}`}>
                                                {statusLabel(task.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${priorityColors[task.priority]}`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4">
                                                {task.assignee ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                                            {task.assignee.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-gray-700">{task.assignee.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">Unassigned</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => openEdit(task)}
                                                className="text-indigo-600 font-semibold hover:text-indigo-900 transition text-sm"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {tasks.data.length === 0 && (
                                    <tr>
                                        <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-gray-400">
                                            No tasks found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {tasks.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                                <span>
                                    Showing {tasks.from}–{tasks.to} of {tasks.total} tasks
                                </span>
                                <div className="flex gap-2">
                                    {tasks.links.map((link, i) => (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                            className={`px-3 py-1 rounded border text-xs font-medium transition ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : link.url
                                                    ? 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                    : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        {/* Status Update Confirmation Modal */}
        {showConfirm && editingTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h3 className="text-base font-semibold text-gray-900">Confirm Status Update</h3>
                    </div>
                    <div className="px-6 py-5 space-y-3">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to update the status of{' '}
                            <span className="font-semibold text-gray-900">"{editingTask.name}"</span>?
                        </p>
                        <div className="flex items-center gap-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[editingTask.status]}`}>
                                {statusLabel(editingTask.status)}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[data.status]}`}>
                                {statusLabel(data.status)}
                            </span>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmStatusUpdate}
                            disabled={processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
                        >
                            {processing ? 'Updating…' : 'Yes, Update Status'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </AuthenticatedLayout>
    );
}
