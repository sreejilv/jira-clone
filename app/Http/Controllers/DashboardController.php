<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Project;
use App\Models\Task;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $stats = null;
        if ($request->user() && $request->user()->hasRole('Admin')) {
            $stats = [
                'projects_count' => Project::count(),
                'tasks_count' => Task::count(),
                'tasks_pending' => Task::where('status', 'todo')->count(),
                'tasks_in_progress' => Task::where('status', 'in_progress')->count(),
                'tasks_completed' => Task::where('status', 'done')->count(),
            ];
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats
        ]);
    }
}
