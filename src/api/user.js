import api from '@/utils/api'

/**
 * 用户注册
 * @param {Object} data - 注册信息 { username, email, phone, password }
 * @returns Promise
 */
export function registerUser(data) {
  return api.post('/users/', data)
}

/**
 * 用户登录
 * @param {Object} data - 登录信息 { username, password }
 * @returns Promise
 */
export function loginUser(data) {
  return api.post('/users/login', data)
}
