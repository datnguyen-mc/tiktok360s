<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DailyStat;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    private const RANGES = [7 => '7 ngày', 30 => '30 ngày', 90 => '90 ngày'];

    public function __invoke(Request $request)
    {
        $days = (int) $request->integer('days', 30);
        $days = array_key_exists($days, self::RANGES) ? $days : 30;

        $from = today()->subDays($days - 1);

        // Ngày nào chưa có dòng thì vẫn phải có mặt với số 0, nếu không biểu đồ
        // sẽ nối liền hai ngày cách nhau và che mất ngày website chết.
        $rows = DailyStat::where('date', '>=', $from)->orderBy('date')->get()->keyBy(
            fn ($r) => $r->date->toDateString()
        );

        $series = [];
        for ($d = $from->copy(); $d <= today(); $d->addDay()) {
            $key = $d->toDateString();
            $r   = $rows->get($key);
            $series[] = [
                'date'     => $key,
                'views'    => $r?->views ?? 0,
                'visitors' => $r?->visitors ?? 0,
                'comments' => $r?->comments ?? 0,
            ];
        }

        $latest = $rows->last();

        return Inertia::render('Admin/Reports', [
            'range'   => $days,
            'ranges'  => collect(self::RANGES)->map(fn ($l, $v) => ['value' => (int) $v, 'label' => $l])
                            ->values()->all(),
            'series'  => $series,

            'totals' => [
                'views'    => $rows->sum('views'),
                'visitors' => $rows->sum('visitors'),
                'comments' => $rows->sum('comments'),
                'likes'    => $rows->sum('likes'),
                'searches' => $rows->sum('searches'),
                'articles' => $rows->sum('new_articles'),
            ],

            // So với kỳ liền trước cùng độ dài — con số trần không nói lên gì
            'previous' => $this->previous($days),

            'today'    => $this->live(),
            'byDevice' => $this->merge($rows, 'by_device'),
            'byReferrer' => $this->merge($rows, 'by_referrer', 8),
            'byCategory' => $this->merge($rows, 'by_category'),
            'byHour'     => $this->hours($rows),
            'topArticles' => $this->topArticles($rows),
            'rolledAt'   => $latest?->rolled_at?->toIso8601String(),
        ]);
    }

    /** Số của hôm nay tính thẳng từ bảng thô, để không phải chờ 10 phút. */
    private function live(): array
    {
        $today = Visit::whereDate('created_at', today());

        return [
            'views'    => (clone $today)->count(),
            'visitors' => (clone $today)->distinct('visitor')->count('visitor'),
            'online'   => Visit::where('created_at', '>=', now()->subMinutes(5))
                            ->distinct('visitor')->count('visitor'),
        ];
    }

    private function previous(int $days): array
    {
        $rows = DailyStat::whereBetween('date', [
            today()->subDays($days * 2 - 1), today()->subDays($days),
        ])->get();

        return [
            'views'    => (int) $rows->sum('views'),
            'visitors' => (int) $rows->sum('visitors'),
            'comments' => (int) $rows->sum('comments'),
        ];
    }

    /** Cộng dồn các map JSON của nhiều ngày thành một bảng xếp hạng. */
    private function merge($rows, string $field, ?int $limit = null): array
    {
        $out = [];
        foreach ($rows as $r) {
            foreach (($r->{$field} ?: []) as $k => $n) {
                $out[$k] = ($out[$k] ?? 0) + (int) $n;
            }
        }
        arsort($out);

        return array_map(
            fn ($k, $n) => ['label' => $k, 'value' => $n],
            array_keys($limit ? array_slice($out, 0, $limit, true) : $out),
            array_values($limit ? array_slice($out, 0, $limit, true) : $out),
        );
    }

    private function hours($rows): array
    {
        $out = array_fill(0, 24, 0);
        foreach ($rows as $r) {
            foreach (($r->by_hour ?: []) as $h => $n) {
                $out[(int) $h] += (int) $n;
            }
        }

        return $out;
    }

    private function topArticles($rows): array
    {
        $out = [];
        foreach ($rows as $r) {
            foreach (($r->top_articles ?: []) as $a) {
                $id = $a['id'];
                $out[$id]['title'] = $a['title'];
                $out[$id]['views'] = ($out[$id]['views'] ?? 0) + (int) $a['views'];
                $out[$id]['id'] = $id;
            }
        }
        usort($out, fn ($a, $b) => $b['views'] <=> $a['views']);

        return array_slice(array_values($out), 0, 10);
    }
}
