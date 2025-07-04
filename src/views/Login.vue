<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- Logo和标题 -->
      <div class="header">
        <div class="logo">
          <el-icon size="40" color="white">
            <View />
          </el-icon>
        </div>
        <h1 class="title">正义之眼</h1>
        <p class="subtitle">用户登录</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <!-- 用户名输入 -->
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            type="text"
            placeholder="请输入用户名"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 密码输入 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            clearable
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 记住登录和忘记密码 -->
        <div class="form-options">
          <el-checkbox v-model="loginForm.rememberMe">
            记住登录状态
          </el-checkbox>
          <el-link type="primary" @click="showForgotPassword">
            忘记密码？
          </el-link>
        </div>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>

        <!-- 注册链接 -->
        <div class="register-link">
          <span>还没有账号？</span>
          <el-link type="primary" @click="goToRegister">
            立即注册
          </el-link>
        </div>
      </el-form>

      <!-- 忘记密码对话框 -->
      <el-dialog
        v-model="forgotPasswordVisible"
        title="重置密码"
        width="400px"
        center
      >
        <el-form
          ref="forgotFormRef"
          :model="forgotForm"
          :rules="forgotRules"
          label-width="80px"
        >
          <el-form-item label="用户名" prop="email">
            <el-input
              v-model="forgotForm.email"
              type="text"
              placeholder="请输入注册用户名"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="forgotPasswordVisible = false">取消</el-button>
            <el-button type="primary" @click="handleForgotPassword">
              发送重置邮件
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { loginUser } from '@/api/user'
import { useUserStore } from '@/stores/user'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const loginFormRef = ref(null)
    const forgotFormRef = ref(null)
    const loading = ref(false)
    const forgotPasswordVisible = ref(false)
    const userStore = useUserStore()

    // 登录表单数据
    const loginForm = reactive({
      email: '',
      password: '',
      rememberMe: false
    })

    // 忘记密码表单数据
    const forgotForm = reactive({
      email: ''
    })

    // 登录表单验证规则
    const loginRules = {
      email: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
      ]
    }

    // 忘记密码表单验证规则
    const forgotRules = {
      email: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ]
    }

    // 处理登录
    const handleLogin = async () => {
      if (!loginFormRef.value) return
      try {
        await loginFormRef.value.validate()
        loading.value = true
        // 调用后端登录接口
        const payload = {
          username: loginForm.email,
          password: loginForm.password
        }
        const res = await loginUser(payload)
        console.log('登录响应数据:', res.data)
        // 存储用户信息到pinia
        userStore.setUserInfo(res.data)
        sessionStorage.setItem('userInfo', JSON.stringify(res.data))
        console.log('存储后的用户信息:', userStore.userInfo)
        ElMessage.success('登录成功！')
        // 跳转到主页面
        router.push('/dashboard')
      } catch (error) {
        console.error('登录失败:', error)
        const msg = error?.response?.data?.detail || '登录失败，请检查用户名和密码'
        ElMessage.error(msg)
      } finally {
        loading.value = false
      }
    }

    // 显示忘记密码对话框
    const showForgotPassword = () => {
      forgotPasswordVisible.value = true
    }

    // 处理忘记密码
    const handleForgotPassword = async () => {
      try {
        await ElMessageBox.confirm(
          `重置密码链接将发送到 ${forgotForm.email}，请查收邮件并按照提示重置密码。`,
          '重置密码',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          }
        )

        // 这里应该调用实际的忘记密码API
        console.log('忘记密码用户名:', forgotForm.email)
        
        ElMessage.success('重置密码邮件已发送，请查收邮箱')
        forgotPasswordVisible.value = false

      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('发送失败，请稍后重试')
        }
      }
    }

    // 跳转到注册页面
    const goToRegister = () => {
      router.push('/register')
    }

    return {
      loginFormRef,
      forgotFormRef,
      loginForm,
      loginRules,
      loading,
      forgotPasswordVisible,
      forgotForm,
      forgotRules,
      handleLogin,
      showForgotPassword,
      handleForgotPassword,
      goToRegister
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.logo i {
  font-size: 40px;
  color: white;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 10px;
}

.subtitle {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.login-form {
  margin-bottom: 30px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #7f8c8d;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    margin: 20px;
    padding: 30px 20px;
  }

  .title {
    font-size: 24px;
  }
}

/* Element Plus 组件样式覆盖 */
:deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}
</style>
