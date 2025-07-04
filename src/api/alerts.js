import api from '@/utils/api'

/**
 * 根据用户ID获取预警列表
 * @param {number} userId - 用户ID
 * @returns Promise
 */
export function getUserAlerts(userId) {
  return api.get(`/alerts/user/${userId}`)
}

/**
 * 删除指定ID的预警
 * @param {number} alertId - 预警ID
 * @returns Promise
 */
export function deleteAlert(alertId) {
  return api.delete(`/alerts/${alertId}`)
}

/**
 * 更新指定ID的预警
 * @param {number} alertId - 预警ID
 * @param {object} data - 要更新的数据
 * @returns Promise
 */
export function updateAlert(alertId, data) {
  return api.put(`/alerts/${alertId}`, data)
}

/**
 * 按日期统计霸凌事件数量
 * @param {object} params - { user_id, start_date, end_date }
 * @returns Promise
 */
export function getAlertCountByDate(params) {
  return api.post('/alerts/count-by-date', params)
}

/**
 * 按日期统计各类型霸凌事件数量
 * @param {object} params - { user_id, start_date, end_date }
 * @returns Promise
 */
export function getAlertTypeCountByDate(params) {
  return api.post('/alerts/count-by-type', params)
} 