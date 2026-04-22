<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::withCount('tasks')->latest()->paginate(10);
        return Inertia::render('Admin/Projects/Index', ['projects' => $projects]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'status'         => 'required|string|in:active,completed,archived',
            'client_name'    => 'nullable|string|max:255',
            'client_contact' => 'nullable|string|max:255',
        ]);

        Project::create($validated);

        // Bust caches that depend on projects
        Cache::forget('dashboard_stats');
        Cache::forget('projects_dropdown');

        return redirect()->back();
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'status'         => 'required|string|in:active,completed,archived',
            'client_name'    => 'nullable|string|max:255',
            'client_contact' => 'nullable|string|max:255',
        ]);

        $project->update($validated);

        Cache::forget('dashboard_stats');
        Cache::forget('projects_dropdown');

        return redirect()->back();
    }

    public function destroy(Project $project)
    {
        $project->delete();

        Cache::forget('dashboard_stats');
        Cache::forget('projects_dropdown');

        return redirect()->back();
    }
}
