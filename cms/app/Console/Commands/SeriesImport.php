<?php

namespace App\Console\Commands;

use App\Models\SeriesItem;
use Illuminate\Console\Command;

/**
 * Nạp lộ trình từ topics/<slug>.json vào cơ sở dữ liệu.
 *
 * Chạy một lần khi chuyển một kênh series sang dùng lộ trình trong CSDL, và
 * chạy lại khi thêm mục mới vào file. Mục đã có thì cập nhật dữ kiện nhưng
 * GIỮ NGUYÊN trạng thái đã lên video — nạp lại không được làm kênh quay đầu.
 */
class SeriesImport extends Command
{
    protected $signature = 'series:import {topic : Mã chủ đề, vd clb}
                            {--reset : Xoá cả trạng thái đã lên video}';

    protected $description = 'Nạp lộ trình kênh series từ file topics/ vào cơ sở dữ liệu';

    public function handle(): int
    {
        $topic = $this->argument('topic');
        $file = base_path('../topics/'.$topic.'.json');

        if (! is_file($file)) {
            $this->error("Không thấy {$file}");

            return self::FAILURE;
        }

        $cfg = json_decode(file_get_contents($file), true);
        $danBai = data_get($cfg, 'series.dan_bai') ?: [];

        if (! $danBai) {
            $this->error("Chủ đề {$topic} không có series.dan_bai trong file.");

            return self::FAILURE;
        }

        if ($this->option('reset')) {
            SeriesItem::where('topic', $topic)->delete();
            $this->warn('Đã xoá lộ trình cũ cùng trạng thái đã lên video.');
        }

        $them = $capNhat = 0;
        foreach ($danBai as $m) {
            $co = SeriesItem::where('topic', $topic)->where('so', $m['so'])->first();

            $fields = [
                'ten'       => $m['ten'],
                'nhom'      => $m['giai'] ?? null,
                'nam'       => $m['nam'] ?? null,
                'san'       => $m['san'] ?? null,
                'danh_hieu' => $m['danh_hieu'] ?? null,
                'dau_an'    => $m['dau_an'] ?? null,
                'ghi_chu'   => $m['ghi_chu'] ?? null,
            ];

            if ($co) {
                // Không đụng tới `da_dung_luc`: nạp lại file không được làm
                // những tập đã ra bị coi như chưa ra.
                $co->update($fields);
                $capNhat++;
            } else {
                SeriesItem::create([...$fields, 'topic' => $topic, 'so' => $m['so']]);
                $them++;
            }
        }

        $xong = SeriesItem::where('topic', $topic)->whereNotNull('da_dung_luc')->count();
        $tong = SeriesItem::where('topic', $topic)->count();

        $this->info(sprintf('Thêm %d · cập nhật %d · tổng %d mục, đã lên video %d.',
            $them, $capNhat, $tong, $xong));

        return self::SUCCESS;
    }
}
