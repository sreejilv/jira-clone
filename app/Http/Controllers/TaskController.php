<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::with(['project', 'assignee', 'creator']);

        if (!Auth::user()->hasRole('Admin')) {
            $query->where('assigned_to', Auth::id());
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $tasks = $query->latest()->paginate(10)->withQueryString();

        // Cache dropdown lists — they rarely change
        $projects = Cache::remember('projects_dropdown', 300, function () {
            return Project::select('id', 'name')->get();
        });

        $users = Cache::remember('users_dropdown', 300, function () {
            return User::whereDoesntHave('roles', function ($q) {
                $q->where('name', 'Admin');
            })->select('id', 'name')->get();
        });

        return Inertia::render('Tasks/Index', [
            'tasks'   => $tasks,
            'filters' => $request->only(['status', 'project_id', 'assigned_to']),
            'projects' => $projects,
            'users'    => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority'    => 'required|string|in:low,medium,high',
            'status'      => 'required|string|in:todo,in_progress,done',
            'project_id'  => 'required|exists:projects,id',
            'assigned_to' => 'required|exists:users,id',
        ]);

        $validated['created_by'] = Auth::id();
        Task::create($validated);

        Cache::forget('dashboard_stats');

        return redirect()->back();
    }

    public function update(Request $request, Task $task)
    {
        if (Auth::user()->hasRole('Admin')) {
            $validated = $request->validate([
                'name'        => 'required|string|max:255',
                'description' => 'nullable|string',
                'priority'    => 'required|string|in:low,medium,high',
                'status'      => 'required|string|in:todo,in_progress,done',
                'project_id'  => 'required|exists:projects,id',
                'assigned_to' => 'nullable|exists:users,id',
            ]);
        } else {
            $validated = $request->validate([
                'status' => 'required|string|in:todo,in_progress,done',
            ]);
        }

        $task->update($validated);

        Cache::forget('dashboard_stats');

        return redirect()->back();
    }

    public function destroy(Task $task)
    {
        $task->delete();

        Cache::forget('dashboard_stats');

        return redirect()->back();
    }
}
