import { useUserStore } from '@/stores/user'

/**
 * 调试用户信息存储问题
 */
export function debugUserInfo() {
  const userStore = useUserStore()
  
  console.log('=== 用户信息调试 ===')
  console.log('1. Pinia Store中的用户信息:', userStore.userInfo)
  console.log('2. 用户ID:', userStore.userId)
  console.log('3. 是否已登录:', userStore.isLoggedIn)
  console.log('4. localStorage中的用户信息:', localStorage.getItem('userInfo'))
  
  try {
    const localUserInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
    console.log('5. 解析后的localStorage用户信息:', localUserInfo)
  } catch (error) {
    console.error('6. localStorage解析失败:', error)
  }
  
  console.log('=== 调试结束 ===')
}

/**
 * 清除所有用户信息
 */
export function clearAllUserInfo() {
  const userStore = useUserStore()
  userStore.clearUserInfo()
  console.log('所有用户信息已清除')
}

/**
 * 手动设置测试用户信息
 */
export function setTestUserInfo() {
  const userStore = useUserStore()
  const testUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com'
  }
  userStore.setUserInfo(testUser)
  console.log('测试用户信息已设置:', testUser)
} 