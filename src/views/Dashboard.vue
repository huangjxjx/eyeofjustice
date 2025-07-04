<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-left">
        <h2 class="logo">正义之眼</h2>
        <span class="subtitle">智能校园安全监测系统</span>
        <el-tag
          v-if="hasUnhandledAlerts"
          type="danger"
          effect="dark"
          style="margin-left: 16px;cursor:pointer"
          @click="goToAlerts"
        >
          有未处理预警
        </el-tag>
        <el-tag
          v-else
          type="success"
          effect="plain"
          style="margin-left: 16px;"
        >
          全部预警已处理
        </el-tag>
      </div>
      <div class="header-right">
        <el-button
          type="success"
          style="margin-right: 18px;"
          v-if="!voiceConnected"
          @click="startMonitor"
        >
          开启监测
        </el-button>
        <el-button
          type="danger"
          style="margin-right: 18px;"
          v-else
          @click="stopMonitor"
        >
          结束监测
        </el-button>
        <el-tag :type="voiceConnected ? 'success' : 'info'">
          {{ voiceConnected ? '已连接' : '未连接' }}
        </el-tag>
        <span class="username" style="margin-left: 18px; font-weight: bold; color: #333;">
          {{ userInfo.name || userInfo.username || '用户' }}
        </span>
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="32">
              <el-icon><User /></el-icon>
            </el-avatar>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="main-content">
      <div class="welcome-section">
        <h1>欢迎使用正义之眼系统</h1>
        <p>这里是系统的主控制台，您可以在这里查看监测数据、管理用户和配置系统参数。</p>
      </div>

      <!-- 功能卡片 -->
      <div class="feature-cards">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="feature-card" shadow="hover">
              <div class="card-icon">
                <el-icon size="36" color="white">
                  <View />
                </el-icon>
              </div>
              <h3>实时监测</h3>
              <p>查看RFID和语音识别的实时监测数据</p>
              <el-button type="primary" @click="goToMonitor">进入监测</el-button>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="feature-card" shadow="hover">
              <div class="card-icon">
                <el-icon size="36" color="white">
                  <Warning />
                </el-icon>
              </div>
              <h3>预警管理</h3>
              <p>查看和处理系统预警信息</p>
              <el-button type="warning" @click="goToAlerts">查看预警</el-button>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="feature-card" shadow="hover">
              <div class="card-icon">
                <el-icon size="36" color="white">
                  <TrendCharts />
                </el-icon>
              </div>
              <h3>数据分析</h3>
              <p>查看统计报告和数据分析</p>
              <el-button type="success" @click="goToAnalytics">查看报告</el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 系统状态 -->
      <div class="system-status">
        <h3>系统状态</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="status-item">
              <div class="status-icon online">
                <el-icon size="24" color="white">
                  <Connection />
                </el-icon>
              </div>
              <div class="status-info">
                <h4>RFID系统</h4>
                <p>运行正常</p>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="status-item">
              <div class="status-icon online">
                <el-icon size="24" color="white">
                  <Microphone />
                </el-icon>
              </div>
              <div class="status-info">
                <h4>语音识别</h4>
                <p>运行正常</p>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="status-item">
              <div class="status-icon online">
                <el-icon size="24" color="white">
                  <DataBase />
                </el-icon>
              </div>
              <div class="status-info">
                <h4>数据存储</h4>
                <p>运行正常</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-main>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useVoiceStore } from '@/stores/voice'
import { useUserStore } from '@/stores/user'
import { getUserAlerts } from '@/api/alerts'
import { useAlertsStore } from '@/stores/alerts'

export default {
  name: 'DashboardView',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const voiceStore = useVoiceStore()
    const alerts = ref([])
    const loadingAlerts = ref(false)
    const alertsStore = useAlertsStore()
    let alertsTimer = null

    // 用户信息
    const userInfo = reactive({
      name: '管理员',
      email: 'admin@test.com',
      role: 'admin',
      username: ''
    })

    // 检测状态
    const voiceConnected = computed(() => voiceStore.connected)

    // 预警状态
    const hasUnhandledAlerts = computed(() => alerts.value.some(a => a.status === '未处理'))

    // 获取alerts
    const fetchAlerts = async () => {
      if (!userStore.userId) return
      loadingAlerts.value = true
      try {
        const res = await getUserAlerts(userStore.userId)
        alerts.value = res.data || []
      } catch (e) {
        // 可选：ElMessage.error('获取预警失败')
      } finally {
        loadingAlerts.value = false
      }
    }

    onMounted(() => {
      // 获取用户信息
      const storedUserInfo = localStorage.getItem('userInfo')
      if (storedUserInfo) {
        const parsedInfo = JSON.parse(storedUserInfo)
        userInfo.email = parsedInfo.email
        userInfo.name = parsedInfo.name || parsedInfo.username || parsedInfo.email.split('@')[0] || '用户'
        userInfo.username = parsedInfo.username || parsedInfo.name || parsedInfo.email.split('@')[0] || '用户'
      }
      fetchAlerts()
      // 定时轮询alerts并全局弹窗
      alertsStore.fetchAlertsAndNotify()
      alertsTimer = setInterval(() => {
        alertsStore.fetchAlertsAndNotify()
      }, 10000)
    })

    // 页面卸载时清理定时器
    onUnmounted(() => {
      if (alertsTimer) clearInterval(alertsTimer)
    })

    // 处理下拉菜单命令
    const handleCommand = async (command) => {
      switch (command) {
        case 'profile':
          ElMessage.info('个人资料功能开发中...')
          break
        case 'settings':
          ElMessage.info('系统设置功能开发中...')
          break
        case 'logout':
          try {
            await ElMessageBox.confirm(
              '确定要退出登录吗？',
              '退出确认',
              {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }
            )
            // 清除本地存储
            localStorage.removeItem('userInfo')
            ElMessage.success('已退出登录')
            router.push('/login')
          } catch (error) {
            // 用户取消退出
          }
          break
      }
    }

    // 检测控制
    const startMonitor = () => {
      voiceStore.connectWebSocket()
      ElMessage.success('监测已开启')
    }
    const stopMonitor = () => {
      voiceStore.disconnectWebSocket()
      ElMessage.success('监测已结束')
    }

    // 跳转
    const goToMonitor = () => {
      router.push('/monitor')
    }
    const goToAlerts = () => {
      router.push('/alerts')
    }
    const goToAnalytics = () => {
      router.push('/analytics')
    }

    return {
      userInfo,
      handleCommand,
      goToMonitor,
      goToAlerts,
      goToAnalytics,
      startMonitor,
      stopMonitor,
      voiceConnected,
      hasUnhandledAlerts,
      loadingAlerts
    }
  }
}
</script>

<style scoped>

.dashboard-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.subtitle {
  font-size: 14px;
  opacity: 0.8;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.1);
}

.username {
  font-weight: 500;
}

.main-content {
  padding: 30px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.welcome-section h1 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 32px;
}

.welcome-section p {
  color: #7f8c8d;
  font-size: 16px;
  margin: 0;
}

.feature-cards {
  margin-bottom: 40px;
}

.feature-card {
  text-align: center;
  padding: 30px 20px;
  border-radius: 15px;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.card-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.feature-card h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 20px;
}

.feature-card p {
  color: #7f8c8d;
  margin-bottom: 20px;
  line-height: 1.6;
}

.system-status {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.system-status h3 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 22px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: background-color 0.3s;
}

.status-item:hover {
  background: #e9ecef;
}

.status-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.status-icon.online {
  background: #67c23a;
}

.status-icon.offline {
  background: #f56c6c;
}

.status-info h4 {
  margin: 0 0 5px;
  color: #2c3e50;
  font-size: 16px;
}

.status-info p {
  margin: 0;
  color: #67c23a;
  font-size: 14px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 0 15px;
  }

  .logo {
    font-size: 20px;
  }

  .subtitle {
    display: none;
  }

  .main-content {
    padding: 20px;
  }

  .welcome-section {
    padding: 30px 20px;
  }

  .welcome-section h1 {
    font-size: 24px;
  }

  .feature-cards .el-col {
    margin-bottom: 20px;
  }
}
</style> 