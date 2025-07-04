import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null')
  }),
  getters: {
    userId: (state) => state.userInfo?.id || state.userInfo?.user_id || state.userInfo?.userId || null,
    isLoggedIn: (state) => !!state.userInfo
  },
  actions: {
    setUserInfo(info) {
      this.userInfo = info
      // 持久化存储到localStorage
      localStorage.setItem('userInfo', JSON.stringify(info))
      console.log('用户信息已存储:', info)
    },
    clearUserInfo() {
      this.userInfo = null
      // 清除localStorage
      localStorage.removeItem('userInfo')
      console.log('用户信息已清除')
    }
  }
}) 