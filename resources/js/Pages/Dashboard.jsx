import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard({ stats }) {
    const user = usePage().props.auth.user;
    const isAdmin = user.roles?.includes('Admin');

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>}>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 border-b border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900">Welcome back, {user.name}!</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                {isAdmin ? "Here is an overview of the system's current activity." : "Head over to the Tasks tab to view your assigned work."}
                            </p>
                        </div>
                    </div>

                    {isAdmin && stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 p-6 flex flex-col justify-center">
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Projects</dt>
                                <dd className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{stats.projects_count}</dd>
                            </div>
                            
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 p-6 flex flex-col justify-center">
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                                <dd className="mt-2 text-3xl font-bold tracking-tight text-indigo-600">{stats.tasks_count}</dd>
                            </div>
                            
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 p-6 flex flex-col justify-center">
                                <dt className="text-sm font-medium text-gray-500 truncate">Pending Tasks</dt>
                                <dd className="mt-2 text-3xl font-bold tracking-tight text-gray-600">{stats.tasks_pending}</dd>
                            </div>
                            
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 p-6 flex flex-col justify-center">
                                <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                                <dd className="mt-2 text-3xl font-bold tracking-tight text-blue-600">{stats.tasks_in_progress}</dd>
                            </div>

                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 p-6 flex flex-col justify-center">
                                <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                                <dd className="mt-2 text-3xl font-bold tracking-tight text-green-600">{stats.tasks_completed}</dd>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
