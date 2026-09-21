<?php

namespace App\Services;

use DOMDocument;
use DOMElement;
use DOMXPath;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

/**
 * Lấy nội dung đầy đủ của một bài báo từ trang gốc.
 *
 * ⚠ VỀ BẢN QUYỀN — đọc trước khi bật:
 * Lưu lại toàn văn bài của báo khác là ĐĂNG LẠI, không phải trích dẫn hợp lý.
 * Ghi nguồn và gắn link không làm việc đó thành hợp pháp. Hai cách an toàn hơn:
 *   · Đặt `content_paragraphs` để chỉ giữ vài đoạn đầu rồi dẫn sang bài gốc
 *     (mặc định 0 = không lưu nội dung, chỉ lưu sapo).
 *   · Xin phép báo nguồn, hoặc chỉ bật cho nội dung tự viết.
 * Google cũng hạ thấp nội dung sao chép nguyên si, nên ở đây SEO và pháp lý
 * đi cùng một hướng.
 *
 * Cách lấy: thử các vùng chứa quen thuộc của báo Việt Nam trước, không thấy thì
 * dùng cách chung — chọn khối có nhiều chữ trong thẻ <p> nhất.
 */
class ContentExtractor
{
    private const UA = 'Mozilla/5.0 (compatible; Tin360sBot/1.0; +https://tin360s.vn/bot)';

    /** Vùng chứa nội dung của các báo Việt Nam, thử theo thứ tự. */
    private const CONTAINERS = [
        "//*[@itemprop='articleBody']",
        "//*[contains(@class,'singular-content')]",      // Thanh Niên
        "//*[contains(@class,'detail-content')]",        // Dân Trí, Kenh14
        "//*[@id='main-detail-body']",                   // Tuổi Trẻ
        "//*[contains(@class,'fck_detail')]",            // VnExpress
        "//*[contains(@class,'the-article-body')]",      // ZNews
        "//*[contains(@class,'article-body')]",
        "//*[contains(@class,'entry-content')]",
        "//article",
    ];

    /** Thẻ chắc chắn không phải nội dung — bỏ trước khi đọc. */
    private const NOISE = [
        'script', 'style', 'iframe', 'form', 'button', 'nav', 'aside',
        'noscript', 'svg', 'video', 'audio',
    ];

    /**
     * @param  int  $maxParagraphs  0 = không lấy nội dung; >0 = chỉ giữ ngần ấy đoạn
     * @return array{content:?string, image:?string}
     */
    public function extract(string $url, int $maxParagraphs = 0): array
    {
        if ($maxParagraphs <= 0) {
            return ['content' => null, 'image' => null];
        }

        try {
            $html = Http::withHeaders(['User-Agent' => self::UA])
                ->timeout(20)->retry(2, 500)->get($url)->body();
        } catch (Throwable) {
            return ['content' => null, 'image' => null];
        }

        if (mb_strlen($html) < 500) {
            return ['content' => null, 'image' => null];
        }

        $prev = libxml_use_internal_errors(true);
        $doc = new DOMDocument();
        // Báo Việt Nam hay thiếu khai báo mã hoá — ép UTF-8 để không vỡ dấu
        $doc->loadHTML('<?xml encoding="UTF-8">'.$html, LIBXML_NOWARNING | LIBXML_NOERROR);
        libxml_use_internal_errors($prev);

        $xpath = new DOMXPath($doc);
        $this->stripNoise($xpath);

        $body = $this->findBody($xpath);
        if (! $body) {
            return ['content' => null, 'image' => $this->ogImage($xpath)];
        }

        return [
            'content' => $this->toHtml($body, $maxParagraphs),
            'image'   => $this->ogImage($xpath),
        ];
    }

    private function stripNoise(DOMXPath $xpath): void
    {
        foreach (self::NOISE as $tag) {
            foreach (iterator_to_array($xpath->query("//{$tag}") ?: []) as $node) {
                $node->parentNode?->removeChild($node);
            }
        }

        // Khối liên quan / quảng cáo / chia sẻ hay nằm lẫn trong nội dung
        $junk = "//*[contains(@class,'related') or contains(@class,'advert') "
              ."or contains(@class,'social') or contains(@class,'banner') "
              ."or contains(@class,'comment') or contains(@class,'tag')]";
        foreach (iterator_to_array($xpath->query($junk) ?: []) as $node) {
            $node->parentNode?->removeChild($node);
        }
    }

    private function findBody(DOMXPath $xpath): ?DOMElement
    {
        foreach (self::CONTAINERS as $q) {
            $nodes = $xpath->query($q);
            if ($nodes && $nodes->length) {
                $node = $nodes->item(0);
                if ($node instanceof DOMElement && $this->textLength($node) > 400) {
                    return $node;
                }
            }
        }

        // Cách chung: khối có nhiều chữ trong <p> nhất
        $best = null;
        $bestLen = 400;
        foreach ($xpath->query('//div | //section') ?: [] as $node) {
            if (! $node instanceof DOMElement) {
                continue;
            }
            $len = $this->textLength($node);
            if ($len > $bestLen) {
                $bestLen = $len;
                $best = $node;
            }
        }

        return $best;
    }

    /** Độ dài chữ nằm trong các thẻ <p> — chỉ số tốt nhất để nhận ra thân bài. */
    private function textLength(DOMElement $node): int
    {
        $len = 0;
        foreach ($node->getElementsByTagName('p') as $p) {
            $len += mb_strlen(trim($p->textContent));
        }

        return $len;
    }

    /** Giữ lại đoạn văn và ảnh, bỏ mọi thuộc tính và thẻ lạ. */
    private function toHtml(DOMElement $body, int $maxParagraphs): ?string
    {
        $out = [];
        $count = 0;

        foreach ($body->getElementsByTagName('*') as $el) {
            if ($count >= $maxParagraphs) {
                break;
            }

            $tag = strtolower($el->nodeName);

            if ($tag === 'p') {
                $text = $this->cleanParagraph($el->textContent);
                // Bỏ dòng quá ngắn: thường là chú thích ảnh hoặc nhãn "Ảnh: ..."
                if (mb_strlen($text) < 40) {
                    continue;
                }
                $out[] = '<p>'.e($text).'</p>';
                $count++;
            } elseif (in_array($tag, ['h2', 'h3'], true)) {
                $text = trim($el->textContent);
                if ($text !== '') {
                    $out[] = "<{$tag}>".e($text)."</{$tag}>";
                }
            }
        }

        if (! $out) {
            return null;
        }

        return implode("\n", $out);
    }

    /**
     * Dọn một đoạn văn.
     *
     * Đoạn đầu của nhiều báo dính cả đường dẫn chuyên mục và tiền tố toà soạn
     * — ví dụ Dân Trí trả về "Đời sống\n(Dân trí) - Ngày 19/9…". Để nguyên thì
     * bài nào cũng mở đầu bằng rác.
     */
    private function cleanParagraph(string $raw): string
    {
        $text = trim(preg_replace('/\s+/u', ' ', $raw));
        // Tiền tố toà soạn: "(Dân trí) - ", "TPO - ", "TTO - "
        $text = preg_replace('/^\s*(?:\([^)]{1,24}\)|TPO|TTO|PLO|VOV)\s*[-–—:,]*\s*/iu', '', $text);
        // Nhãn chuyên mục dính ở đầu, dạng "Đời sống (Dân trí) - …" đã xử lý ở trên;
        // còn dạng "Đời sống Ngày 19/9…" thì cắt cụm viết hoa ngắn đầu dòng
        $text = preg_replace('/^[\p{Lu}][\p{L}]{1,12}(?: [\p{Lu}][\p{L}]{1,12}){0,2}\s+(?=\([^)]{1,24}\))/u', '', $text);

        return trim($text);
    }

    private function ogImage(DOMXPath $xpath): ?string
    {
        $node = $xpath->query("//meta[@property='og:image']/@content")?->item(0);
        $url = $node ? trim($node->nodeValue) : '';

        return Str::startsWith($url, 'http') ? $url : null;
    }
}
