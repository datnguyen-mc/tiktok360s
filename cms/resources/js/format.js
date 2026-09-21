/** Các hàm định dạng dùng chung — gom một chỗ để hiển thị nhất quán. */

export const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

export const fmtDateShort = (v) =>
  v ? new Date(v).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '—'

export const fmtTime = (v) =>
  v ? new Date(v).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'

/** 117.3 -> "1:57" */
export const fmtDuration = (sec) => {
  if (sec == null) return '—'
  const s = Math.round(sec)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export const fmtBytes = (b) => {
  if (!b) return '—'
  const mb = b / 1e6
  return mb >= 1000 ? `${(mb / 1000).toFixed(1)} GB` : `${mb.toFixed(1)} MB`
}

export const fmtNumber = (n) => (n ?? 0).toLocaleString('vi-VN')

/* Nhãn trạng thái: màu LUÔN đi kèm chữ, không bao giờ để màu tự nói. */
export const RUN_STATUS = {
  success: { label: 'Thành công', tone: 'good' },
  running: { label: 'Đang chạy', tone: 'warning' },
  failed:  { label: 'Thất bại', tone: 'critical' },
}

export const JOB_STATUS = {
  queued:     { label: 'Chờ đăng', tone: 'neutral' },
  uploading:  { label: 'Đang tải lên', tone: 'warning' },
  processing: { label: 'TikTok đang xử lý', tone: 'warning' },
  published:  { label: 'Đã đăng', tone: 'good' },
  failed:     { label: 'Thất bại', tone: 'critical' },
  cancelled:  { label: 'Đã huỷ', tone: 'neutral' },
}

export const TOPIC_LABEL = {
  cuoi_hen_ho: 'Cưới hỏi',
  chia_tay:    'Chia tay',
  tranh_cai:   'Tranh cãi',
  thanh_tich:  'Thành tích',
  nhan_sac:    'Nhan sắc',
  phim:        'Phim',
  am_nhac:     'Âm nhạc',
  chung:       'Chung',
}
