<template>
  <div class="keyword-manager">
    <div class="keyword-header">
      <h3>关键词管理</h3>
      <el-button type="primary" size="small" @click="showAddDialog = true" plain>
        <el-icon><Plus /></el-icon>添加关键词
      </el-button>
    </div>
    
    <div class="keyword-list">
      <el-tag
        v-for="(keyword, idx) in keywords"
        :key="idx"
        type="danger"
        closable
        @close="removeKeyword(idx)"
        style="margin: 4px;"
      >
        {{ keyword }}
      </el-tag>
      <span v-if="!keywords.length" style="color:#aaa;">暂无关键词</span>
    </div>
    
    <!-- 添加关键词弹窗 -->
    <el-dialog v-model="showAddDialog" title="添加关键词" width="400px" center>
      <el-input 
        v-model="newKeyword" 
        placeholder="请输入新关键词" 
        clearable 
        @keyup.enter="addKeyword" 
      />
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addKeyword" :loading="loading">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getUserKeywords, createKeyword, deleteKeyword } from '@/api/keywords'
import { ElMessage } from 'element-plus'

export default {
  name: 'KeywordManager',
  setup() {
    const userStore = useUserStore()
    const keywords = ref([])
    const showAddDialog = ref(false)
    const newKeyword = ref('')
    const loading = ref(false)
    
    // 获取用户关键词
    const fetchUserKeywords = async () => {
      try {
        if (!userStore.userId) {
          ElMessage.warning('用户信息不存在，请重新登录')
          return
        }
        
        const response = await getUserKeywords(userStore.userId)
        if (response.data && Array.isArray(response.data)) {
          keywords.value = response.data.map(item => item.keyword || item)
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
      
      if (!userStore.userId) {
        ElMessage.warning('用户信息不存在，请重新登录')
        return
      }
      
      loading.value = true
      try {
        const response = await createKeyword({
          keyword: kw,
          user_id: userStore.userId
        })
        
        if (response.data) {
          keywords.value.push(kw)
          newKeyword.value = ''
          showAddDialog.value = false
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
      try {
        if (typeof keyword === 'object' && keyword.id) {
          await deleteKeyword(keyword.id)
        }
        keywords.value.splice(idx, 1)
        ElMessage.success('关键词删除成功')
      } catch (error) {
        console.error('删除关键词失败:', error)
        ElMessage.error('删除关键词失败，请稍后重试')
      }
    }
    
    onMounted(() => {
      fetchUserKeywords()
    })
    
    return {
      keywords,
      showAddDialog,
      newKeyword,
      loading,
      addKeyword,
      removeKeyword
    }
  }
}
</script>

<style scoped>
.keyword-manager {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.keyword-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.keyword-header h3 {
  margin: 0;
  color: #374151;
}

.keyword-list {
  min-height: 32px;
  padding: 8px 0;
}
</style> 