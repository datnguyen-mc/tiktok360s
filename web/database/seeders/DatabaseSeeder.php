<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Chuyên mục của website.
     *
     * Hai chuyên mục đầu nối với chủ đề của dây chuyền video (`topic`) — chúng
     * nhận tin từ dây chuyền VÀ tự lấy thêm. Các chuyên mục còn lại chỉ có tin,
     * không dựng video, nên chỉ cần khai nguồn RSS.
     */
    public function run(): void
    {
        $categories = [
            [
                'slug' => 'showbiz', 'name' => 'Showbiz', 'topic' => 'showbiz',
                'color' => '#FE2C55', 'sort' => 10,
                'description' => 'Tin giải trí, sao Việt và quốc tế',
                'sources' => [
                    ['name' => 'VnExpress', 'url' => 'https://vnexpress.net/rss/giai-tri.rss'],
                    ['name' => 'Kenh14', 'url' => 'https://kenh14.vn/star.rss'],
                    ['name' => 'Dân Trí', 'url' => 'https://dantri.com.vn/rss/giai-tri.rss'],
                    ['name' => 'ZNews', 'url' => 'https://znews.vn/rss/giai-tri.rss'],
                ],
            ],
            [
                'slug' => 'bongda', 'name' => 'Bóng đá', 'topic' => 'bongda',
                'color' => '#00A650', 'sort' => 20,
                'description' => 'Tin bóng đá Việt Nam và quốc tế',
                'sources' => [
                    ['name' => 'VnExpress', 'url' => 'https://vnexpress.net/rss/the-thao.rss'],
                    ['name' => 'Dân Trí', 'url' => 'https://dantri.com.vn/rss/the-thao.rss'],
                    ['name' => 'ZNews', 'url' => 'https://znews.vn/rss/the-thao.rss'],
                ],
                // Các báo chỉ có feed "thể thao" chung — phải lọc ra bóng đá
                'require_keywords' => [
                    'bóng đá', 'cầu thủ', 'hlv', 'đội tuyển', 'v-league', 'ngoại hạng',
                    'champions league', 'world cup', 'ghi bàn', 'bàn thắng', 'chuyển nhượng',
                    'thủ môn', 'tiền đạo', 'hậu vệ', 'trọng tài', 'clb', 'man utd', 'real madrid',
                    'barcelona', 'arsenal', 'liverpool', 'chelsea', 'psg', 'messi', 'ronaldo',
                ],
                'exclude_keywords' => [
                    'bóng chuyền', 'bóng rổ', 'bóng bàn', 'cầu lông', 'điền kinh',
                    'bơi lội', 'cờ vua', 'tennis', 'đua xe', 'golf', 'esports',
                ],
            ],
            [
                'slug' => 'cong-nghe', 'name' => 'Công nghệ',
                'color' => '#0A9CB0', 'sort' => 30,
                'description' => 'Điện thoại, máy tính, AI và chuyển đổi số',
                'sources' => [
                    ['name' => 'VnExpress', 'url' => 'https://vnexpress.net/rss/so-hoa.rss'],
                    ['name' => 'Dân Trí', 'url' => 'https://dantri.com.vn/rss/suc-manh-so.rss'],
                    ['name' => 'Thanh Niên', 'url' => 'https://thanhnien.vn/rss/cong-nghe.rss'],
                    ['name' => 'ZNews', 'url' => 'https://znews.vn/rss/cong-nghe.rss'],
                ],
            ],
            [
                'slug' => 'kinh-doanh', 'name' => 'Kinh doanh',
                'color' => '#7C3AED', 'sort' => 40,
                'description' => 'Thị trường, doanh nghiệp và tài chính',
                'sources' => [
                    ['name' => 'VnExpress', 'url' => 'https://vnexpress.net/rss/kinh-doanh.rss'],
                    ['name' => 'Dân Trí', 'url' => 'https://dantri.com.vn/rss/kinh-doanh.rss'],
                    ['name' => 'Thanh Niên', 'url' => 'https://thanhnien.vn/rss/kinh-te.rss'],
                ],
            ],
            [
                'slug' => 'the-gioi', 'name' => 'Thế giới',
                'color' => '#2563EB', 'sort' => 50,
                'description' => 'Tin quốc tế nổi bật',
                'sources' => [
                    ['name' => 'VnExpress', 'url' => 'https://vnexpress.net/rss/the-gioi.rss'],
                    ['name' => 'Dân Trí', 'url' => 'https://dantri.com.vn/rss/the-gioi.rss'],
                ],
            ],
            [
                'slug' => 'doi-song', 'name' => 'Đời sống',
                'color' => '#EA580C', 'sort' => 60,
                'description' => 'Gia đình, ẩm thực, du lịch và nhịp sống',
                'sources' => [
                    ['name' => 'VnExpress', 'url' => 'https://vnexpress.net/rss/doi-song.rss'],
                    ['name' => 'Dân Trí', 'url' => 'https://dantri.com.vn/rss/doi-song.rss'],
                ],
            ],
            [
                'slug' => 'suc-khoe', 'name' => 'Sức khoẻ',
                'color' => '#059669', 'sort' => 70,
                'description' => 'Y tế, dinh dưỡng và phòng bệnh',
                'sources' => [
                    ['name' => 'VnExpress', 'url' => 'https://vnexpress.net/rss/suc-khoe.rss'],
                ],
            ],
        ];

        foreach ($categories as $c) {
            Category::updateOrCreate(['slug' => $c['slug']], $c);
        }

        $this->command->info('Đã tạo/cập nhật '.count($categories).' chuyên mục.');
        $this->command->line('Lấy tin ngay: php artisan news:fetch');
    }
}
