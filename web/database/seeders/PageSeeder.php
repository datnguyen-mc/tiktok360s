<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

/**
 * Trang tĩnh bắt buộc của một trang tin: giới thiệu, liên hệ, điều khoản, bảo mật.
 *
 * Không gieo thì chân trang trống trơn, và trang tổng hợp tin mà không nói rõ
 * mình tổng hợp từ đâu, bản quyền thuộc về ai là chuyện dễ gây phiền phức.
 */
class PageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'slug' => 'about', 'title' => 'Giới thiệu', 'sort' => 10,
                'excerpt' => 'Tin360s là trang tổng hợp tin tức tự động từ các báo điện tử Việt Nam.',
                'content' =>
                    '<p>Tin360s tổng hợp tin tức từ các nguồn báo điện tử uy tín tại Việt Nam: '
                    .'VnExpress, Dân Trí, Thanh Niên, ZNews, Kenh14 và nhiều nguồn khác.</p>'
                    .'<h2>Cách chúng tôi làm việc</h2>'
                    .'<p>Hệ thống tự động đọc nguồn RSS công khai của các báo, lọc trùng lặp và sắp '
                    .'xếp theo chuyên mục. Mỗi bài luôn ghi rõ nguồn và kèm liên kết dẫn tới bài gốc.</p>'
                    .'<h2>Bản quyền</h2>'
                    .'<p>Bản quyền nội dung thuộc về cơ quan báo chí đã xuất bản. Chúng tôi chỉ hiển '
                    .'thị tiêu đề và phần trích dẫn, đồng thời dẫn người đọc về trang gốc để đọc toàn '
                    .'văn. Nếu bạn là chủ sở hữu nội dung và muốn gỡ bài, xin liên hệ với chúng tôi.</p>',
            ],
            [
                'slug' => 'contact', 'title' => 'Liên hệ', 'sort' => 20,
                'excerpt' => 'Góp ý, báo lỗi hoặc yêu cầu gỡ nội dung.',
                'content' =>
                    '<p>Mọi góp ý, phản ánh về nội dung hoặc yêu cầu gỡ bài, xin gửi tới chúng tôi '
                    .'qua email ghi ở chân trang.</p>'
                    .'<p>Chúng tôi phản hồi trong vòng 48 giờ làm việc.</p>',
            ],
            [
                'slug' => 'terms', 'title' => 'Điều khoản sử dụng', 'sort' => 30,
                'excerpt' => 'Những điều cần biết khi dùng Tin360s.',
                'content' =>
                    '<p>Khi truy cập Tin360s, bạn đồng ý với các điều khoản dưới đây.</p>'
                    .'<h2>Nội dung</h2>'
                    .'<p>Nội dung tin tức thuộc bản quyền của các cơ quan báo chí gốc. Tin360s không '
                    .'chịu trách nhiệm về tính chính xác của nội dung do bên thứ ba xuất bản.</p>'
                    .'<h2>Tài khoản và bình luận</h2>'
                    .'<p>Bạn chịu trách nhiệm về nội dung bình luận của mình. Chúng tôi có quyền ẩn '
                    .'hoặc xoá bình luận vi phạm pháp luật, xúc phạm người khác hoặc mang tính quảng cáo.</p>',
            ],
            [
                'slug' => 'privacy', 'title' => 'Chính sách bảo mật', 'sort' => 40,
                'excerpt' => 'Chúng tôi thu thập và dùng dữ liệu của bạn như thế nào.',
                'content' =>
                    '<p>Chúng tôi chỉ lưu những thông tin cần thiết để website hoạt động.</p>'
                    .'<h2>Thông tin thu thập</h2>'
                    .'<p>Khi bạn đăng ký tài khoản, chúng tôi lưu tên, email và mật khẩu đã mã hoá. '
                    .'Khi bạn đọc bài, chúng tôi ghi nhận lượt xem ở mức ẩn danh — chỉ lưu một mã băm '
                    .'của phiên, không lưu địa chỉ IP, và mỗi phiên chỉ tính một lần cho mỗi bài.</p>'
                    .'<h2>Chia sẻ dữ liệu</h2>'
                    .'<p>Chúng tôi không bán hay chia sẻ dữ liệu cá nhân của bạn cho bên thứ ba.</p>',
            ],
        ];

        foreach ($pages as $p) {
            // updateOrCreate chứ không create: chạy seeder lần hai không được
            // nhân đôi trang, mà cũng không được ghi đè nội dung đã sửa tay.
            Page::firstOrCreate(
                ['slug' => $p['slug']],
                [...$p, 'is_published' => true, 'in_footer' => true]
            );
        }
    }
}
