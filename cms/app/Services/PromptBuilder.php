<?php

namespace App\Services;

/**
 * Dựng prompt tạo cảnh từ mẫu của kênh.
 *
 * Bản này chỉ dùng để **xem thử** trong giao diện. Lúc chạy thật, việc thay biến
 * do phía Python đảm nhiệm (pipeline/aiclip.py) — cùng bộ biến, cùng quy tắc.
 * Giữ hai bản là có chủ đích: CMS phải xem thử được mà không cần gọi sang Python.
 */
class PromptBuilder
{
    public const VARIABLES = [
        '{tieu_de}'   => 'Tiêu đề tin',
        '{tom_tat}'   => 'Câu tóm tắt đầu tiên',
        '{nguon}'     => 'Tên báo nguồn',
        '{chu_de}'    => 'Nhóm nội dung (cưới hỏi, tranh cãi, âm nhạc…)',
        '{so_thu_tu}' => 'Số thứ tự tin trong video',
        '{tong_so}'   => 'Tổng số tin',
        '{ngay}'      => 'Ngày của bản tin',
    ];

    public const SAMPLE = [
        'tieu_de'   => 'Cặp đôi ca sĩ Vbiz thông báo đăng ký kết hôn',
        'tom_tat'   => 'Cặp đôi khoe đã đăng ký kết hôn vào ngày đặc biệt, trước thềm lễ cưới.',
        'nguon'     => 'Kenh14',
        'chu_de'    => 'Cưới hỏi',
        'so_thu_tu' => '3',
        'tong_so'   => '10',
        'ngay'      => '21/09/2026',
    ];

    public const DEFAULT_TEMPLATE =
        "Cinematic vertical 9:16 news b-roll for a Vietnamese entertainment story about: {tieu_de}. "
        ."Mood: {chu_de}. Modern studio lighting, shallow depth of field, slow camera push-in, "
        ."no on-screen text, no watermark, no captions, photorealistic, 4k detail.";

    public static function render(string $template, array $values): string
    {
        $replace = [];
        foreach ($values as $key => $value) {
            $replace['{'.$key.'}'] = (string) $value;
        }

        return trim(strtr($template, $replace));
    }
}
