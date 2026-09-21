/** Định dạng dùng chung cho toàn site. */

export const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''

/** "3 phút trước", "2 giờ trước" — trang tin cần cảm giác tươi mới. */
export function fmtAgo(v) {
  if (!v) return ''
  const diff = (Date.now() - new Date(v).getTime()) / 1000
  if (diff < 60) return 'vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`
  return fmtDate(v)
}

export const fmtNumber = (n) => (n ?? 0).toLocaleString('vi-VN')
