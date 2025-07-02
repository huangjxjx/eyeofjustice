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
      <el-table :data="alerts" style="width: 100%" size="small" :row-class-name="rowClass">
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
        <el-table-column prop="person" label="涉事人" width="100" />
        <el-table-column prop="location" label="位置" width="120" />
        <el-table-column prop="time" label="触发时间" width="160" />
        <el-table-column prop="status" label="处理状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.status==='未处理'" type="danger">未处理</el-tag>
            <el-tag v-else type="success">已处理</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button v-if="row.status==='未处理'" type="primary" size="small" @click="markHandled(row)">
              标记为已处理
            </el-button>
            <span v-else style="color:#aaa;">--</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'AlertsView',
  setup() {
    // 模拟预警数据
    const alerts = ref([
      { type: 'RFID', level: '高', desc: '检测到推搡同学', person: '张三', location: '教学楼A', time: '2024-06-01 09:01:12', status: '未处理' },
      { type: '语音', level: '中', desc: '检测到威胁性言语', person: '李四', location: '食堂', time: '2024-06-01 09:02:33', status: '未处理' },
      { type: 'RFID', level: '低', desc: '检测到异常聚集', person: '王五', location: '操场', time: '2024-06-01 09:03:10', status: '已处理' },
      { type: '语音', level: '高', desc: '检测到辱骂', person: '赵六', location: '教室', time: '2024-06-01 09:04:20', status: '未处理' }
    ])
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
    // 标记为已处理
    const markHandled = (row) => {
      row.status = '已处理'
    }
    // 计算是否有未处理预警
    const hasUnhandledAlerts = computed(() => alerts.value.some(a => a.status === '未处理'))
    return {
      alerts,
      levelColor,
      rowClass,
      markHandled,
      hasUnhandledAlerts
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