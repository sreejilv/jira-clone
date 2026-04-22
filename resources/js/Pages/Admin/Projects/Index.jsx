import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function Index({ projects }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        status: 'active',
        client_name: '',
        client_contact: '',
    });

    const openCreateForm = () => {
        clearErrors();
        reset();
        setEditingId(null);
        setIsFormOpen(true);
    };

    const openEditForm = (project) => {
        clearErrors();
        setData({
            name: project.name,
            description: project.description || '',
            status: project.status,
            client_name: project.client_name || '',
            client_contact: project.client_contact || '',
        });
        setEditingId(project.id);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        reset();
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (editingId) {
            put(route('projects.update', editingId), {
                onSuccess: () => closeForm(),
            });
        } else {
            post(route('projects.store'), {
                onSuccess: () => closeForm(),
            });
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Projects Management</h2>}>
            <Head title="Projects" />

            <div className="py-12 pb-24">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    <div className="mb-6 flex justify-between items-center bg-white/30 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800">All Projects</h3>
                        <PrimaryButton onClick={isFormOpen ? closeForm : openCreateForm}>
                            {isFormOpen ? 'Cancel' : 'New Project'}
                        </PrimaryButton>
                    </div>

                    {isFormOpen && (
                        <div className="mb-6 bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 transition-all">
                            <div className="border-b border-gray-100 bg-gray-50/50 p-4">
                                <h4 className="font-semibold text-gray-700">{editingId ? 'Edit Project' : 'Create New Project'}</h4>
                            </div>
                            <form onSubmit={submit} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-1 md:col-span-2">
                                        <InputLabel htmlFor="name" value="Project Name" />
                                        <TextInput id="name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} autoFocus />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    
                                    <div>
                                        <InputLabel htmlFor="client_name" value="Client Name" />
                                        <TextInput id="client_name" className="mt-1 block w-full" value={data.client_name} onChange={(e) => setData('client_name', e.target.value)} />
                                        {errors.client_name && <p className="text-red-500 text-xs mt-1">{errors.client_name}</p>}
                                    </div>
                                    
                                    <div>
                                        <InputLabel htmlFor="client_contact" value="Client Contact Info" />
                                        <TextInput id="client_contact" className="mt-1 block w-full" value={data.client_contact} onChange={(e) => setData('client_contact', e.target.value)} placeholder="Email or Phone" />
                                        {errors.client_contact && <p className="text-red-500 text-xs mt-1">{errors.client_contact}</p>}
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <InputLabel htmlFor="description" value="Description" />
                                        <textarea id="description" className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" rows="3" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                    </div>
                                    
                                    <div>
                                        <InputLabel htmlFor="status" value="Status" />
                                        <select id="status" className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                            <option value="active">Active</option>
                                            <option value="completed">Completed</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                        {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center justify-end mt-4">
                                    <PrimaryButton className="ms-4" disabled={processing}>
                                        {editingId ? 'Update Project' : 'Create Project'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl">
                        <table className="w-full text-left text-sm text-gray-500">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.data.map((project) => (
                                    <tr key={project.id} className="border-b bg-white hover:bg-gray-50/50 transition duration-150">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{project.name}</p>
                                            <p className="text-xs text-gray-400 mt-1">{project.description}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {project.client_name ? (
                                                <>
                                                    <p className="font-medium text-gray-700">{project.client_name}</p>
                                                    <p className="text-xs text-gray-400">{project.client_contact}</p>
                                                </>
                                            ) : (
                                                <span className="text-gray-400 italic">Internal</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-3">
                                            <button onClick={() => openEditForm(project)} className="text-indigo-600 font-semibold hover:text-indigo-900 transition">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {projects.data.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                                            No projects found. Create one to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
