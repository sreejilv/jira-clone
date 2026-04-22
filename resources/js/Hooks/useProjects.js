import { router } from '@inertiajs/react';
import { useState } from 'react';

export function useProjects() {
    const [isLoading, setIsLoading] = useState(false);

    const createProject = (data, onSuccess) => {
        router.post('/projects', data, {
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
            onSuccess: onSuccess,
        });
    };

    const updateProject = (id, data, onSuccess) => {
        router.put(`/projects/${id}`, data, {
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
            onSuccess: onSuccess,
        });
    };

    const deleteProject = (id, onSuccess) => {
        router.delete(`/projects/${id}`, {
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
            onSuccess: onSuccess,
        });
    };

    return {
        isLoading,
        createProject,
        updateProject,
        deleteProject
    };
}
