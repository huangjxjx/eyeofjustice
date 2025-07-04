<template>
  <div class="alerts-container" :class="{ 'relaxed-bg': !hasUnhandledAlerts }">
    <div class="alerts-header">
      <div class="header-left">
        <h2>预警管理</h2>
        <el-tag
          :type="hasUnhandledAlerts ? 'danger' : 'success'"
          class="status-tag"
        >
          {{ hasUnhandledAlerts ? '有未处理预警' : '全部预警已处理' }}
        </el-tag>
      </div>
    </div>
    <el-card class="alerts-card">
      <div class="card-title">
        <el-icon><Warning /></el-icon>
        <span>预警事件列表</span>
      </div>
      <el-table :data="alerts" style="width: 100%" size="small" :row-class-name="rowClass" :loading="loading">
        <el-table-column prop="type" label="类型" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.type==='RFID'" type="warning">RFID</el-tag>
            <el-tag v-else type="danger">语音</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="90">
          <template #default="{ row }">
            <el-tag :type="levelColor(row.level)">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="事件描述" min-width="180" />
        <el-table-column prop="time" label="触发时间" width="160" />
        <el-table-column prop="status" label="处理状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.status==='未处理'" type="danger">未处理</el-tag>
            <el-tag v-else type="success">已处理</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button v-if="row.status==='未处理'" type="primary" size="small" @click="handleMarkHandled(row)">
              标记为已处理
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getUserAlerts, deleteAlert, updateAlert } from '@/api/alerts'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AlertsView',
  setup() {
    const userStore = useUserStore()
    const alerts = ref([])
    const loading = ref(false)

    // 级别颜色
    const levelColor = (level) => {
      if (level === '高') return 'danger'
      if (level === '中') return 'warning'
      return 'info'
    }
    // 行高亮
    const rowClass = ({ row }) => {
      return row.status === '未处理' ? 'row-unhandled' : ''
    }
    // 标记为已处理（调用API）
    const handleMarkHandled = async (row) => {
      try {
        loading.value = true
        await updateAlert(row.id, { status: '已处理' })
        ElMessage.success('已标记为已处理')
        fetchAlerts()
      } catch (e) {
        ElMessage.error('操作失败')
      } finally {
        loading.value = false
      }
    }
    // 删除预警
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm('确定要删除该预警吗？', '删除确认', { type: 'warning' })
        loading.value = true
        await deleteAlert(row.id)
        ElMessage.success('删除成功')
        fetchAlerts()
      } catch (e) {
        if (e !== 'cancel') ElMessage.error('删除失败')
      } finally {
        loading.value = false
      }
    }
    // 计算是否有未处理预警
    const hasUnhandledAlerts = computed(() => alerts.value.some(a => a.status === '未处理'))

    // 获取alerts
    const fetchAlerts = async () => {
      if (!userStore.userId) {
        ElMessage.error('用户未登录，无法获取预警')
        return
      }
      loading.value = true
      try {
        const res = await getUserAlerts(userStore.userId)
        // 映射后端字段到前端表格字段
        alerts.value = (res.data || []).map(item => ({
          ...item,
          desc: item.description,
          time: item.timestamp
        }))
      } catch (e) {
        ElMessage.error('获取预警失败: ' + (e.message || '未知错误'))
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchAlerts()
    })

    return {
      alerts,
      levelColor,
      rowClass,
      hasUnhandledAlerts,
      loading,
      handleDelete,
      handleMarkHandled
    }
  }
}
</script>

<style scoped>
.alerts-container {
  padding: 30px;
  min-height: 100vh;
  background: linear-gradient(135deg, #fff1f0 0%, #f5f7fa 100%);
}
/* 舒缓背景色 */
.relaxed-bg {
  background: linear-gradient(135deg, #e6f9ed 0%, #f5f7fa 100%) !important;
}
.alerts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.status-tag {
  margin-left: 8px;
}
.alerts-card {
  border-radius: 18px;
  box-shadow: 0 4px 18px rgba(234, 102, 102, 0.08);
  background: #fff;
}
.card-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  gap: 8px;
}
:deep(.row-unhandled) {
  background: #fff7f6 !important;
}
</style> 