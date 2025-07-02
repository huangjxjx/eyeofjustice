<template>
  <div class="monitor-container">
    <div class="monitor-header">
      <div class="header-left">
        <h2>实时监测</h2>
        <el-tag type="success" class="status-tag">系统运行正常</el-tag>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showKeywordDialog = true" plain>
          <el-icon><Plus /></el-icon>添加霸凌关键词
        </el-button>
      </div>
    </div>
    <el-row :gutter="24" class="main-row">
      <!-- RFID霸凌事件监测 -->
      <el-col :xs="24" :md="14">
        <el-card class="monitor-card">
          <div class="card-title">
            <el-icon><WarningFilled /></el-icon>
            <span>RFID霸凌行为监测</span>
          </div>
          <el-table :data="rfidList" style="width: 100%" size="small" :empty-text="'暂无霸凌事件'">
            <el-table-column prop="name" label="涉事人" width="100" />
            <el-table-column prop="cardId" label="卡号" width="120" />
            <el-table-column prop="location" label="位置" width="120" />
            <el-table-column prop="event" label="事件描述" />
            <el-table-column prop="time" label="发生时间" width="160" />
            <el-table-column label="状态" width="80">
              <template #default="">
                <el-tag type="danger">霸凌</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <!-- 语音识别监测 -->
      <el-col :xs="24" :md="10">
        <el-card class="monitor-card">
          <div class="card-title">
            <el-icon><Microphone /></el-icon>
            <span>语音识别监测</span>
          </div>
          <el-table :data="voiceList" style="width: 100%" size="small" :empty-text="'暂无语音事件'">
            <el-table-column prop="content" label="语音内容" />
            <el-table-column prop="keywords" label="关键词" width="120">
              <template #default="{ row }">
                <el-tag v-if="row.keywords" type="danger">{{ row.keywords }}</el-tag>
                <span v-else>--</span>
              </template>
            </el-table-column>
            <el-table-column prop="emotion" label="情感分析" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.emotion === '异常'" type="danger">异常</el-tag>
                <el-tag v-else type="success">正常</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="eventType" label="声音事件" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.eventType" type="warning">{{ row.eventType }}</el-tag>
                <span v-else>--</span>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="捕获时间" width="160" />
          </el-table>
        </el-card>
        <!-- 关键词管理区 -->
        <el-card class="keyword-card">
          <div class="keyword-title">
            <el-icon><CollectionTag /></el-icon>
            <span>当前霸凌关键词</span>
          </div>
          <div class="keyword-list">
            <el-tag
              v-for="(kw, idx) in keywords"
              :key="kw"
              type="danger"
              closable
              @close="removeKeyword(idx)"
              style="margin: 4px;"
            >
              {{ kw }}
            </el-tag>
            <span v-if="!keywords.length" style="color:#aaa;">暂无关键词</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 添加关键词弹窗 -->
    <el-dialog v-model="showKeywordDialog" title="添加霸凌关键词" width="400px" center>
      <el-input v-model="newKeyword" placeholder="请输入新关键词" clearable @keyup.enter="addKeyword" />
      <template #footer>
        <el-button @click="showKeywordDialog = false">取消</el-button>
        <el-button type="primary" @click="addKeyword">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'MonitorView',
  setup() {
    // 霸凌关键词管理
    const keywords = ref(['威胁', '霸凌'])
    const showKeywordDialog = ref(false)
    const newKeyword = ref('')
    const addKeyword = () => {
      const kw = newKeyword.value.trim()
      if (kw && !keywords.value.includes(kw)) {
        keywords.value.push(kw)
        newKeyword.value = ''
        showKeywordDialog.value = false
      }
    }
    const removeKeyword = (idx) => {
      keywords.value.splice(idx, 1)
    }
    // 模拟RFID霸凌事件数据
    const rfidList = ref([
      { name: '张三', cardId: '10001', location: '教学楼A', event: '推搡同学', time: '2024-06-01 09:01:12' },
      { name: '李四', cardId: '10002', location: '食堂', event: '强行索要物品', time: '2024-06-01 09:02:33' }
    ])
    // 模拟语音识别数据
    const voiceList = ref([
      { content: '你再说一遍试试！', keywords: '威胁', emotion: '异常', eventType: '辱骂', time: '2024-06-01 09:05:10' },
      { content: '我们一起去上课吧', keywords: '', emotion: '正常', eventType: '', time: '2024-06-01 09:05:20' },
      { content: '快点把东西还给我！', keywords: '霸凌', emotion: '异常', eventType: '威胁', time: '2024-06-01 09:05:35' }
    ])
    onMounted(() => {
      // 这里可以集成真实的API或WebSocket
    })
    return {
      rfidList,
      voiceList,
      keywords,
      showKeywordDialog,
      newKeyword,
      addKeyword,
      removeKeyword
    }
  }
}
</script>

<style scoped>
.monitor-container {
  padding: 30px;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%);
}
.monitor-header {
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
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.status-tag {
  margin-left: 8px;
}
.main-row {
  margin-top: 8px;
}
.monitor-card {
  margin-bottom: 24px;
  border-radius: 18px;
  box-shadow: 0 4px 18px rgba(102, 126, 234, 0.08);
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
.keyword-card {
  margin-top: 24px;
  border-radius: 14px;
  background: #f8fafc;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.06);
}
.keyword-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  gap: 6px;
  color: #5a5a5a;
}
.keyword-list {
  min-height: 36px;
  padding: 4px 0 8px 0;
}
</style> 