import { router } from '@inertiajs/react';
import { useState } from 'react';

export function useTasks() {
    const [isLoading, setIsLoading] = useState(false);

    const createTask = (data, onSuccess) => {
        router.post('/tasks', data, {
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
            onSuccess: onSuccess,
        });
    };

    const updateTask = (id, data, onSuccess) => {
        router.put(`/tasks/${id}`, data, {
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
            onSuccess: onSuccess,
        });
    };

    const deleteTask = (id, onSuccess) => {
        router.delete(`/tasks/${id}`, {
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
            onSuccess: onSuccess,
        });
    };

    const filterTasks = (filters) => {
        router.get('/tasks', filters, { preserveState: true, preserveScroll: true });
    };

    return {
        isLoading,
        createTask,
        updateTask,
        deleteTask,
        filterTasks
    };
}
