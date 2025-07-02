<template>
  <div class="register-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 注册卡片 -->
    <div class="register-card">
      <!-- Logo和标题 -->
      <div class="header">
        <div class="logo">
          <el-icon size="40" color="white">
            <UserFilled />
          </el-icon>
        </div>
        <h1 class="title">用户注册</h1>
        <p class="subtitle">欢迎注册正义之眼</p>
      </div>

      <!-- 注册表单 -->
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        label-width="80px"
        @submit.prevent="handleRegister"
      >
        <el-form-item label="用户名" prop="name">
          <el-input
            v-model="registerForm.name"
            placeholder="请输入用户名"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            type="email"
            placeholder="请输入邮箱地址"
            clearable
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号码"
            clearable
          >
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（至少6位）"
            show-password
            clearable
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            clearable
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="registerForm.agreeTerms">
            我已阅读并同意
            <el-link type="primary" @click="showTerms">《用户协议》</el-link>
            和
            <el-link type="primary" @click="showPrivacy">《隐私政策》</el-link>
          </el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="register-button"
            :loading="loading"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '立即注册' }}
          </el-button>
        </el-form-item>
        <div class="login-link">
          <span>已有账号？</span>
          <el-link type="primary" @click="goToLogin">
            立即登录
          </el-link>
        </div>
      </el-form>
    </div>

    <!-- 用户协议对话框 -->
    <el-dialog
      v-model="termsVisible"
      title="用户协议"
      width="600px"
      center
    >
      <div class="terms-content">
        <h4>正义之眼用户协议</h4>
        <p>欢迎使用正义之眼智能校园安全监测系统。在使用本系统前，请仔细阅读以下协议：</p>
        <ol>
          <li>用户应提供真实、准确的个人信息</li>
          <li>用户应遵守相关法律法规和学校规章制度</li>
          <li>用户应保护个人账号安全，不得泄露给他人</li>
          <li>系统收集的数据仅用于校园安全管理</li>
          <li>用户有权查看、修改、删除个人数据</li>
        </ol>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="termsVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 隐私政策对话框 -->
    <el-dialog
      v-model="privacyVisible"
      title="隐私政策"
      width="600px"
      center
    >
      <div class="privacy-content">
        <h4>隐私政策</h4>
        <p>我们重视您的隐私保护，承诺：</p>
        <ul>
          <li>严格保护用户个人信息安全</li>
          <li>不会向第三方泄露用户信息</li>
          <li>采用加密技术保护数据传输</li>
          <li>定期更新安全措施</li>
          <li>用户可随时删除个人数据</li>
        </ul>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="privacyVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { registerUser } from '@/api/user'

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter()
    const registerFormRef = ref(null)
    const loading = ref(false)
    const termsVisible = ref(false)
    const privacyVisible = ref(false)

    // 注册表单数据
    const registerForm = reactive({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false
    })

    // 密码确认验证
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== registerForm.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }

    // 注册表单验证规则
    const registerRules = {
      name: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '姓名长度在2到20个字符', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机号码', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, validator: validateConfirmPassword, trigger: 'blur' }
      ]
    }

    // 处理注册
    const handleRegister = async () => {
      if (!registerFormRef.value) return
      try {
        await registerFormRef.value.validate()
        if (!registerForm.agreeTerms) {
          ElMessage.warning('请先同意用户协议和隐私政策')
          return
        }
        loading.value = true
        // 调用后端注册接口
        const payload = {
          username: registerForm.name,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password
        }
        await registerUser(payload)
        ElMessage.success('注册成功！请查收邮箱验证邮件')
        router.push('/login')
      } catch (error) {
        console.log(error)
        // 处理后端返回的错误信息
        const msg = error?.response?.data?.detail || '注册失败，请检查表单信息'
        ElMessage.error(msg)
      } finally {
        loading.value = false
      }
    }
    const showTerms = () => { termsVisible.value = true }
    const showPrivacy = () => { privacyVisible.value = true }
    const goToLogin = () => { router.push('/login') }
    return {
      registerFormRef,
      registerForm,
      registerRules,
      loading,
      termsVisible,
      privacyVisible,
      handleRegister,
      showTerms,
      showPrivacy,
      goToLogin
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 20px 0;
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

.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  max-height: 90vh;
  overflow-y: auto;
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

.register-form {
  margin-bottom: 30px;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 15px;
  border-left: 4px solid #667eea;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 18px;
  background: #667eea;
  margin-right: 10px;
  border-radius: 2px;
}

.role-group {
  width: 100%;
}

.role-group .el-radio-button {
  flex: 1;
  text-align: center;
}

.role-group .el-radio-button__inner {
  width: 100%;
  padding: 15px 20px;
  font-size: 14px;
}

.role-specific {
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}

.register-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #7f8c8d;
}

.terms-content,
.privacy-content {
  max-height: 400px;
  overflow-y: auto;
  line-height: 1.6;
}

.terms-content h4,
.privacy-content h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.terms-content ol,
.privacy-content ul {
  padding-left: 20px;
}

.terms-content li,
.privacy-content li {
  margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-card {
    margin: 20px;
    padding: 30px 20px;
  }

  .title {
    font-size: 24px;
  }

  .form-section {
    padding: 15px;
  }

  .role-group .el-radio-button__inner {
    padding: 10px 15px;
    font-size: 12px;
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

:deep(.el-radio-button__inner) {
  border-radius: 8px;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 8px 0 0 8px;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 8px 8px 0;
}
</style> 