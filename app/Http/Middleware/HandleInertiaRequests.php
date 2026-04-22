<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                    'roles' => $request->user()->roles->pluck('name'),
                ]) : null,
            ],
            'honeypot' => [
                'nameFieldName' => config('honeypot.name_field_name'),
                'validFromFieldName' => config('honeypot.valid_from_field_name'),
                'encryptedValidFrom' => \Spatie\Honeypot\Facades\Honeypot::encryptedValidFrom(),
                'enabled' => config('honeypot.enabled'),
            ],
        ];
    }
}
