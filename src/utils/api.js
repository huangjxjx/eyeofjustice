import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8000', // FastAPI后端地址
  timeout: 10000, // 请求超时时间（毫秒）
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可在此处添加token等认证信息
    // const token = localStorage.getItem('token')
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    // 可在此处统一处理错误
    // alert(error.response?.data?.detail || '请求出错')
    return Promise.reject(error)
  }
)

export default api
