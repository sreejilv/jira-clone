import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function Index({ users, roles }) {
    const [isCreating, setIsCreating] = useState(false);
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        
        post(route('users.store'), {
            onSuccess: () => {
                reset();
                clearErrors();
                setIsCreating(false);
            },
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">User Management</h2>}>
            <Head title="Users" />

            <div className="py-12 pb-24">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    <div className="mb-6 flex justify-between items-center bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800">System Users</h3>
                        <PrimaryButton onClick={() => {
                            setIsCreating(!isCreating);
                            clearErrors();
                        }}>
                            {isCreating ? 'Cancel' : '+ Create User'}
                        </PrimaryButton>
                    </div>

                    {isCreating && (
                        <div className="mb-6 bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100">
                            <form onSubmit={submit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="name" value="Full Name" />
                                    <TextInput id="name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} autoFocus />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="email" value="Email Address" />
                                    <TextInput id="email" type="email" className="mt-1 block w-full" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Password" />
                                    <TextInput id="password" type="password" className="mt-1 block w-full" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                    <TextInput id="password_confirmation" type="password" className="mt-1 block w-full" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                                    {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
                                </div>

                                <div className="col-span-1 md:col-span-2 flex items-center justify-end mt-4">
                                    <PrimaryButton disabled={processing}>Save User</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl">
                        <table className="w-full text-left text-sm text-gray-500">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Roles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr key={user.id} className="border-b bg-white hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {user.roles.map(role => (
                                                    <span key={role.id} className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                                        {role.name}
                                                    </span>
                                                ))}
                                                {user.roles.length === 0 && <span className="text-gray-400">None</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.data.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-gray-400">
                                            No users found.
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
