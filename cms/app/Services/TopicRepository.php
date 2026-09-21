<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use JsonException;
use RuntimeException;

/**
 * Đọc và ghi các file chủ đề trong topics/ của dây chuyền.
 *
 * File JSON là nguồn sự thật duy nhất, không phải bảng trong CSDL. Lý do: dây
 * chuyền Python phải chạy được cả khi CMS tắt — nó đọc thẳng file. CMS ở đây chỉ
 * là giao diện sửa file, giống như sửa bằng trình soạn thảo nhưng có kiểm tra.
 */
class TopicRepository
{
    /** Khoá bắt buộc phải có, để file hỏng không làm gãy dây chuyền. */
    private const REQUIRED = ['name', 'brand', 'sources', 'ranking', 'hashtags'];

    public function dir(): string
    {
        return rtrim((string) config('pipeline.root'), '/').'/topics';
    }

    public function path(string $slug): string
    {
        return $this->dir().'/'.$this->safeSlug($slug).'.json';
    }

    /** Danh sách chủ đề kèm tóm tắt, đủ để hiển thị bảng. */
    public function all(): array
    {
        if (! is_dir($this->dir())) {
            return [];
        }

        $out = [];
        foreach (glob($this->dir().'/*.json') as $file) {
            $slug = basename($file, '.json');
            try {
                $data = $this->read($slug);
            } catch (RuntimeException) {
                // File hỏng vẫn phải hiện ra để người dùng còn biết mà sửa
                $out[] = ['slug' => $slug, 'name' => $slug, 'broken' => true];
                continue;
            }

            $out[] = [
                'slug'         => $slug,
                'name'         => $data['name'] ?? $slug,
                'description'  => $data['description'] ?? '',
                'brand'        => $data['brand'] ?? [],
                // Bảng danh sách hiện cả tốc độ và cao độ, không chỉ nam/nữ —
                // hai kênh dùng chung một giọng vẫn phải phân biệt được.
                'voice'        => $data['voice'] ?? [],
                'sources'      => count($data['sources'] ?? []),
                'style'        => $data['script']['style'] ?? null,
                'styles'       => array_keys($data['styles'] ?? []),
                'hashtags'     => count($data['hashtags'] ?? []),
                'has_filter'   => ! empty($data['ranking']['require_keywords']),
                'broken'       => false,
                'updated_at'   => date('c', filemtime($file)),
            ];
        }

        usort($out, fn ($a, $b) => strcmp($a['slug'], $b['slug']));

        return $out;
    }

    public function read(string $slug): array
    {
        $path = $this->path($slug);
        if (! is_file($path)) {
            throw new RuntimeException("Không có chủ đề “{$slug}”.");
        }

        try {
            $data = json_decode(File::get($path), true, 64, JSON_THROW_ON_ERROR);
        } catch (JsonException $e) {
            throw new RuntimeException("File topics/{$slug}.json sai cú pháp JSON: ".$e->getMessage());
        }

        return is_array($data) ? $data : [];
    }

    /**
     * Gộp dữ liệu mới lên chủ đề hiện có rồi ghi.
     *
     * Bắt buộc phải gộp chứ không ghi đè: giao diện chỉ sửa một phần (nhận diện,
     * nguồn tin, từ khoá), còn `styles`, `nhom_tu_khoa`, `script`… thì không đụng
     * tới. Ghi đè thẳng sẽ xoá sạch những phần đó — đã xảy ra thật một lần.
     *
     * Quy tắc gộp giống phía Python (pipeline/topics.py): map thì gộp sâu,
     * danh sách thì THAY THẾ hẳn — bỏ một nguồn tin phải thật sự bị bỏ.
     */
    public function merge(string $slug, array $incoming): array
    {
        $current = is_file($this->path($slug)) ? $this->read($slug) : [];

        return $this->write($slug, $this->deepMerge($current, $incoming));
    }

    private function deepMerge(array $base, array $over): array
    {
        foreach ($over as $key => $value) {
            $base[$key] = is_array($value) && isset($base[$key]) && is_array($base[$key])
                          && ! array_is_list($value)
                ? $this->deepMerge($base[$key], $value)
                : $value;
        }

        return $base;
    }

    /**
     * Ghi file chủ đề. Luôn sao lưu bản cũ trước — sửa nhầm một dấu phẩy có thể
     * làm cả dây chuyền không chạy được sáng hôm sau.
     */
    public function write(string $slug, array $data): array
    {
        foreach (self::REQUIRED as $key) {
            if (! array_key_exists($key, $data)) {
                throw new RuntimeException("Thiếu khoá bắt buộc: {$key}");
            }
        }

        $dir = $this->dir();
        if (! is_dir($dir) && ! mkdir($dir, 0755, true) && ! is_dir($dir)) {
            throw new RuntimeException("Không tạo được thư mục {$dir}");
        }

        $path = $this->path($slug);
        if (is_file($path)) {
            $backup = $dir.'/.backup';
            is_dir($backup) || mkdir($backup, 0755, true);
            copy($path, $backup.'/'.$slug.'.'.date('Ymd-His').'.json');
            $this->pruneBackups($backup, $slug);
        }

        $json = json_encode($data,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json === false) {
            throw new RuntimeException('Không mã hoá được JSON.');
        }

        File::put($path, $json."\n");

        return $this->read($slug);
    }

    public function delete(string $slug): void
    {
        $path = $this->path($slug);
        if (! is_file($path)) {
            return;
        }
        // Xoá = chuyển vào thư mục sao lưu, không xoá hẳn
        $backup = $this->dir().'/.backup';
        is_dir($backup) || mkdir($backup, 0755, true);
        rename($path, $backup.'/'.$slug.'.deleted-'.date('Ymd-His').'.json');
    }

    /** Chép một chủ đề làm điểm khởi đầu cho chủ đề mới. */
    public function duplicate(string $from, string $slug, string $name): array
    {
        $data = $this->read($from);
        $data['name'] = $name;
        $data['description'] = 'Sao chép từ '.($data['name'] ?? $from);

        return $this->write($slug, $data);
    }

    /** Chỉ cho phép chữ thường, số và gạch nối — slug đi thẳng vào tên file. */
    private function safeSlug(string $slug): string
    {
        $clean = preg_replace('/[^a-z0-9_-]/', '', strtolower(trim($slug)));
        if ($clean === '' || $clean !== strtolower(trim($slug))) {
            throw new RuntimeException(
                'Mã chủ đề chỉ được dùng chữ thường không dấu, số và gạch nối. Ví dụ: bongda, am-nhac'
            );
        }

        return $clean;
    }

    private function pruneBackups(string $dir, string $slug, int $keep = 10): void
    {
        $files = glob($dir.'/'.$slug.'.*.json') ?: [];
        if (count($files) <= $keep) {
            return;
        }
        usort($files, fn ($a, $b) => filemtime($a) <=> filemtime($b));
        foreach (array_slice($files, 0, count($files) - $keep) as $old) {
            @unlink($old);
        }
    }
}
