import { defineStore } from 'pinia'
import { getUserAlerts } from '@/api/alerts'
import { useUserStore } from '@/stores/user'

export const useAlertsStore = defineStore('alerts', {
  state: () => ({
    alerts: [],
    lastUnhandledCount: 0
  }),
  actions: {
    async fetchAlertsAndNotify() {
      const userStore = useUserStore()
      if (!userStore.userId) return
      const res = await getUserAlerts(userStore.userId)
      this.alerts = res.data || []
      const unhandledCount = this.alerts.filter(a => a.status === '未处理').length
      if (unhandledCount > this.lastUnhandledCount) {
        // 新增未处理预警，弹窗
        import('element-plus').then(({ ElNotification }) => {
          ElNotification({
            title: '预警提醒',
            message: '有新的未处理预警，请及时处理！',
            type: 'error',
            duration: 5000
          })
        })
      }
      this.lastUnhandledCount = unhandledCount
    }
  }
}) 