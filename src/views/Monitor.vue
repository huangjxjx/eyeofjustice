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
      <!-- 语音识别监测+关键词管理 -->
      <el-col :xs="24" :md="10">
        <div class="right-panel">
          <el-card class="monitor-card voice-card">
            <div class="card-title">
              <el-icon><Microphone /></el-icon>
              <span>语音识别监测</span>
              <el-tag :type="voiceConnected ? 'success' : 'info'" style="margin-left: 12px;">{{ voiceConnected ? '已连接' : '未连接' }}</el-tag>
              <el-button
                size="small"
                style="margin-left: 12px;"
                v-if="voiceConnected"
                @click="disconnectVoice"
              >
                断开连接
              </el-button>
              <el-button
                size="small"
                style="margin-left: 12px;"
                v-else
                @click="reconnectVoice"
              >
                重新连接
              </el-button>
            </div>
            <el-table :data="voiceList" style="width: 100%" size="small" :empty-text="'暂无语音事件'" class="voice-table">
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
                  <el-tag v-else type="success">{{ row.emotion }}</el-tag>
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
          <div class="keywords-row">
            <el-card class="keyword-card system-keywords">
              <div class="keyword-title">
                <el-icon><CollectionTag /></el-icon>
                <span>系统固定霸凌关键词</span>
              </div>
              <div class="keyword-list">
                <el-tag
                  v-for="kw in SYSTEM_BULLYING_KEYWORDS"
                  :key="kw"
                  type="info"
                  effect="plain"
                  style="margin: 2px;"
                  disable-transitions
                >
                  {{ kw }}
                </el-tag>
              </div>
            </el-card>
            <el-card class="keyword-card user-keywords">
              <div class="keyword-title">
                <el-icon><CollectionTag /></el-icon>
                <span>当前霸凌关键词</span>
              </div>
              <div class="keyword-list">
                <el-tag
                  v-for="(kw, idx) in keywords"
                  :key="typeof kw === 'object' ? kw.id || kw.keyword : kw"
                  type="danger"
                  closable
                  @close="removeKeyword(idx)"
                  style="margin: 2px;"
                >
                  {{ typeof kw === 'object' ? kw.keyword : kw }}
                </el-tag>
                <span v-if="!keywords.length" style="color:#aaa;">暂无关键词</span>
              </div>
            </el-card>
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- 添加关键词弹窗 -->
    <el-dialog v-model="showKeywordDialog" title="添加霸凌关键词" width="400px" center>
      <el-input v-model="newKeyword" placeholder="请输入新关键词" clearable @keyup.enter="addKeyword" />
      <template #footer>
        <el-button @click="showKeywordDialog = false">取消</el-button>
        <el-button type="primary" @click="addKeyword" :loading="loading">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { getUserKeywords, createKeyword, deleteKeyword } from '@/api/keywords'
import { ElMessage } from 'element-plus'
import { useVoiceStore } from '@/stores/voice'

const SYSTEM_BULLYING_KEYWORDS = [
  "你去死", "滚开", "闭嘴", "废物", "没用", "白痴", "蠢货", "傻逼", "垃圾", "打你", "揍你",
  "混蛋", "王八蛋", "婊子", "臭不要脸", "贱人", "草你", "妈的", "滚蛋"
]

export default {
  name: 'MonitorView',
  setup() {
    const userStore = useUserStore()
    const voiceStore = useVoiceStore()
    
    // 霸凌关键词管理
    const keywords = ref([])
    const showKeywordDialog = ref(false)
    const newKeyword = ref('')
    const loading = ref(false)
    
    // 获取用户关键词
    const fetchUserKeywords = async () => {
      try {
        console.log('当前用户信息:', userStore.userInfo)
        console.log('用户ID:', userStore.userId)
        console.log('是否已登录:', userStore.isLoggedIn)
        
        // 尝试多种方式获取用户ID
        let userId = userStore.userId
        if (!userId && userStore.userInfo) {
          // 如果userStore.userId为空，但userInfo存在，尝试从userInfo中获取ID
          userId = userStore.userInfo.id || userStore.userInfo.user_id || userStore.userInfo.userId
        }
        
        if (!userId) {
          console.error('用户ID不存在，用户信息:', userStore.userInfo)
          ElMessage.warning('用户信息不存在，请重新登录')
          return
        }
        
        console.log('使用的用户ID:', userId)
        const response = await getUserKeywords(userId)
        console.log('关键词API响应:', response)
        if (response.data && Array.isArray(response.data)) {
          // 保存完整的关键词对象，包含ID信息
          keywords.value = response.data.map(item => {
            if (typeof item === 'object' && item.keyword) {
              return item // 保持完整对象
            } else if (typeof item === 'string') {
              return { keyword: item, id: null } // 为字符串创建对象
            }
            return item
          })
        }
      } catch (error) {
        console.error('获取关键词失败:', error)
        ElMessage.error('获取关键词失败，请稍后重试')
      }
    }
    
    // 添加关键词
    const addKeyword = async () => {
      const kw = newKeyword.value.trim()
      if (!kw) {
        ElMessage.warning('请输入关键词')
        return
      }
      
      if (keywords.value.includes(kw)) {
        ElMessage.warning('关键词已存在')
        return
      }
      
      // 尝试多种方式获取用户ID
      let userId = userStore.userId
      if (!userId && userStore.userInfo) {
        userId = userStore.userInfo.id || userStore.userInfo.user_id || userStore.userInfo.userId
      }
      
      if (!userId) {
        ElMessage.warning('用户信息不存在，请重新登录')
        return
      }
      
      loading.value = true
      try {
        const response = await createKeyword({
          keyword: kw,
          user_id: userId
        })
        
        if (response.data) {
          // 添加新关键词到列表，包含返回的ID信息
          const newKeywordObj = response.data
          keywords.value.push(newKeywordObj)
          newKeyword.value = ''
          showKeywordDialog.value = false
          ElMessage.success('关键词添加成功')
        }
      } catch (error) {
        console.error('添加关键词失败:', error)
        ElMessage.error('添加关键词失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
    
    // 删除关键词
    const removeKeyword = async (idx) => {
      const keyword = keywords.value[idx]
      console.log('要删除的关键词:', keyword)
      
      try {
        let keywordId = null
        
        // 尝试多种方式获取关键词ID
        if (typeof keyword === 'object') {
          keywordId = keyword.id || keyword.keyword_id || keyword.keywordId
        } else if (typeof keyword === 'string') {
          // 如果是字符串，可能需要先获取关键词的完整信息
          console.log('关键词是字符串，需要获取ID信息')
          // 这里可以重新获取关键词列表来获取ID，或者使用关键词名称删除
          // 暂时先从前端移除，后续可以优化
        }
        
        console.log('关键词ID:', keywordId)
        
        if (keywordId) {
          // 调用删除API
          await deleteKeyword(keywordId)
          console.log('删除API调用成功')
        }
        
        // 从前端列表中移除
        keywords.value.splice(idx, 1)
        ElMessage.success('关键词删除成功')
      } catch (error) {
        console.error('删除关键词失败:', error)
        ElMessage.error('删除关键词失败，请稍后重试')
      }
    }
    // 模拟RFID霸凌事件数据
    const rfidList = ref([
      { name: '张三', cardId: '10001', location: '教学楼A', event: '推搡同学', time: '2024-06-01 09:01:12' },
      { name: '李四', cardId: '10002', location: '食堂', event: '强行索要物品', time: '2024-06-01 09:02:33' }
    ])
    // 模拟语音识别数据
    const voiceList = voiceStore.voiceList
    const voiceConnected = ref(voiceStore.connected)
    // 监听连接状态
    onMounted(() => {
      voiceConnected.value = voiceStore.connected
      watch(
        () => voiceStore.connected,
        (val) => { voiceConnected.value = val }
      )
      // 获取用户关键词
      fetchUserKeywords()
      // 这里可以集成真实的API或WebSocket
    })
    const disconnectVoice = () => {
      voiceStore.disconnectWebSocket()
    }
    const reconnectVoice = () => {
      voiceStore.connectWebSocket()
    }
    return {
      rfidList,
      voiceList,
      keywords,
      showKeywordDialog,
      newKeyword,
      loading,
      addKeyword,
      removeKeyword,
      voiceConnected,
      disconnectVoice,
      reconnectVoice,
      SYSTEM_BULLYING_KEYWORDS
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
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}
.voice-card {
  margin-bottom: 0;
  /* max-height: 340px; */
  overflow: visible;
}
.voice-table {
  /* max-height: 220px; */
  overflow-y: visible;
}
.keywords-row {
  display: flex;
  gap: 12px;
  align-items: stretch; /* 让两个卡片高度一致 */
}
.system-keywords, .user-keywords {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
/* 只让用户关键词区内容多时滚动，系统区不滚动 */
.user-keywords .keyword-list {
  max-height: 120px;
  overflow-y: auto;
}
.keyword-card {
  border-radius: 14px;
  background: #f8fafc;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.06);
  margin-top: 0;
  height: 100%; /* 让卡片自动拉伸 */
  display: flex;
  flex-direction: column;
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
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  /* max-height: 120px; 只在.user-keywords .keyword-list中生效 */
  overflow-y: visible;
  padding: 4px 0 8px 0;
}
</style> 