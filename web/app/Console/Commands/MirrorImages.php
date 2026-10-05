<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Services\R2;
use Illuminate\Console\Command;

/**
 * Đưa ảnh bài viết từ CDN báo về R2 của mình.
 *
 * Ảnh lấy theo RSS trỏ thẳng vào CDN của toà soạn (dantri, tuoitre, znews…).
 * Hotlink kiểu đó hỏng theo ba đường: toà soạn chặn referer lạ, đổi địa chỉ khi
 * dọn kho, hoặc gỡ bài. Lúc đó trang mình mất ảnh mà không biết. Gương về R2 thì
 * ảnh nằm trong tay mình.
 *
 * Chỉ áp dụng cho bài MỚI. 938 bài có từ trước ngày 05/10/2026 đã được đánh dấu
 * giữ nguyên hotlink (image_source_url ghi đúng bằng image_url), theo yêu cầu.
 * Muốn gương cả ảnh cũ thì xoá trắng ô đó ở những dòng có hai cột bằng nhau:
 *
 *     UPDATE articles SET image_source_url = NULL WHERE image_source_url = image_url;
 */
class MirrorImages extends Command
{
    protected $signature = 'images:mirror
                            {--limit=200 : Số ảnh mỗi lượt}
                            {--force : Chạy kể cả khi chưa khai tên miền công khai}';

    protected $description = 'Tải ảnh bài viết từ CDN báo lên R2';

    public function handle(R2 $r2): int
    {
        if (! $r2->ready()) {
            $this->error('Chưa đủ cấu hình R2 — còn thiếu: '.implode(', ', $r2->missing()));

            return self::FAILURE;
        }

        // Không có tên miền công khai thì địa chỉ R2 cần chữ ký mới mở được, mà
        // thẻ <img> không ký được. Ghi đè lúc đó là đổi ảnh đang hiển thị được
        // lấy ảnh hỏng — tệ hơn hẳn hiện trạng, nên chặn ngay từ đầu.
        if (! $r2->hasPublicUrl() && ! $this->option('force')) {
            $this->error('Chưa khai AWS_PUBLIC_URL.');
            $this->line('  Ảnh đẩy lên được nhưng thẻ <img> sẽ không mở được, vì địa chỉ');
            $this->line('  endpoint phải kèm chữ ký. Bật Public Access cho bucket (R2 →');
            $this->line('  Settings → Public Development URL), rồi điền tên miền r2.dev');
            $this->line('  vào AWS_PUBLIC_URL ở web/.env.');

            return self::FAILURE;
        }

        $limit = max(1, (int) $this->option('limit'));
        $pending = Article::whereNotNull('image_url')
            ->where('image_url', '!=', '')
            ->whereNull('image_source_url')      // chưa gương bao giờ
            ->limit($limit)
            ->get(['id', 'image_url']);

        if ($pending->isEmpty()) {
            $this->info('Không còn ảnh nào cần gương.');

            return self::SUCCESS;
        }

        $con_lai = Article::whereNotNull('image_url')->where('image_url', '!=', '')
            ->whereNull('image_source_url')->count();
        $this->line("Gương {$pending->count()} ảnh (tổng còn {$con_lai})");

        $bar = $this->output->createProgressBar($pending->count());
        $bar->start();
        $xong = $hong = 0;

        foreach ($pending as $a) {
            $goc = $a->image_url;
            if ($moi = $r2->mirror($goc)) {
                // Cất địa chỉ gốc rồi mới ghi đè: khoá trên R2 là sha1 của địa
                // chỉ gốc nên không suy ngược được, mất dòng này là mất đường lùi.
                $a->forceFill(['image_source_url' => $goc, 'image_url' => $moi])->save();
                $xong++;
            } else {
                // Đánh dấu đã thử để lượt sau khỏi vấp lại cùng một ảnh hỏng;
                // giữ nguyên image_url để trang vẫn còn ảnh hotlink mà dùng.
                $a->forceFill(['image_source_url' => $goc])->save();
                $hong++;
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✓ {$xong} ảnh lên R2".($hong ? " · {$hong} ảnh hỏng, giữ nguyên địa chỉ cũ" : ''));

        if ($con_lai > $pending->count()) {
            $this->line('Còn '.($con_lai - $pending->count()).' ảnh — chạy lại lệnh này.');
        }

        return self::SUCCESS;
    }
}
