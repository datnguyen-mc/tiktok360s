<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            ActivityLog::query()
                ->when($request->string('level')->toString(), fn ($q, $l) => $q->where('level', $l))
                ->when($request->string('event')->toString(), fn ($q, $e) => $q->where('event', 'like', "{$e}%"))
                ->latest('id')
                ->paginate(50)
        );
    }
}
