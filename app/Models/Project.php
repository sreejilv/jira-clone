<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = ['name', 'description', 'status', 'client_name', 'client_contact'];

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
