import axios from 'axios'

/*
 * SPA và API cùng tên miền nên dùng chung phiên đăng nhập của Laravel.
 * Không cần token: chỉ cần gửi kèm cookie và header CSRF.
 */
const http = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
})

const csrf = document.querySelector('meta[name="csrf-token"]')?.content
if (csrf) http.defaults.headers.common['X-CSRF-TOKEN'] = csrf

// 401 ở bất kỳ đâu nghĩa là phiên đã hết — đẩy về trang đăng nhập.
let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn }

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) onUnauthorized()
    return Promise.reject(err)
  },
)

/** Rút thông điệp lỗi dễ đọc từ phản hồi của Laravel. */
export function errorMessage(err, fallback = 'Có lỗi xảy ra') {
  const d = err?.response?.data
  if (typeof d === 'string' && d.length < 400) return d
  if (d?.message) return d.message
  if (d?.errors) return Object.values(d.errors).flat().join(' · ')
  return err?.message || fallback
}

export default http
