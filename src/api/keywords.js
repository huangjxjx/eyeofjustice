import api from '@/utils/api'

/**
 * 根据用户ID获取关键词列表
 * @param {number} userId - 用户ID
 * @returns Promise
 */
export function getUserKeywords(userId) {
  return api.get(`/keywords/user/${userId}`)
}

/**
 * 创建新的关键词
 * @param {Object} data - 关键词信息 { keyword, user_id }
 * @returns Promise
 */
export function createKeyword(data) {
  return api.post('/keywords/', data)
}

/**
 * 删除关键词
 * @param {number} keywordId - 关键词ID
 * @returns Promise
 */
export function deleteKeyword(keywordId) {
  return api.delete(`/keywords/${keywordId}`)
} 