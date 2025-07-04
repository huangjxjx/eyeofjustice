# 故障排除指南

## 用户信息不存在问题

### 问题描述
在监测页面或其他需要用户ID的功能中，出现"用户信息不存在，请重新登录"的错误提示。

### 可能的原因
1. **后端返回的数据结构不包含ID字段**
2. **用户信息没有正确存储到Pinia**
3. **页面刷新后用户信息丢失**
4. **localStorage中的数据格式错误**

### 解决步骤

#### 第一步：检查用户信息
1. 打开浏览器开发者工具（F12）
2. 在Console标签页中运行：
```javascript
// 查看localStorage中的用户信息
console.log('localStorage用户信息:', localStorage.getItem('userInfo'))

// 查看解析后的用户信息
console.log('解析后用户信息:', JSON.parse(localStorage.getItem('userInfo') || 'null'))
```

#### 第二步：访问调试页面
1. 在浏览器中访问：`http://localhost:8088/debug`
2. 查看当前用户信息状态
3. 如果用户信息为空，点击"设置测试用户"按钮

#### 第三步：检查后端API响应
1. 在登录时查看控制台输出
2. 确认后端返回的数据结构是否包含 `id` 字段
3. 如果字段名不是 `id`，可能是 `user_id` 或 `userId`

#### 第四步：手动设置用户信息
如果自动获取失败，可以手动设置：
```javascript
// 在浏览器控制台中运行
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()

// 设置用户信息（根据实际后端返回的数据结构调整）
userStore.setUserInfo({
  id: 1,  // 或者 user_id, userId
  username: 'your_username',
  email: 'your_email@example.com'
})
```

### 常见数据结构

#### 标准格式
```json
{
  "id": 1,
  "username": "user123",
  "email": "user@example.com"
}
```

#### 其他可能的格式
```json
{
  "user_id": 1,
  "username": "user123",
  "email": "user@example.com"
}
```

```json
{
  "userId": 1,
  "username": "user123",
  "email": "user@example.com"
}
```

### 预防措施
1. **确保登录成功后用户信息正确存储**
2. **检查后端API返回的数据结构**
3. **使用调试页面定期检查用户信息状态**
4. **在开发环境中启用详细的控制台日志**

## 关键词API问题

### 问题描述
无法获取或创建关键词，API调用失败。

### 解决步骤
1. **确认后端服务运行**: 检查 `http://127.0.0.1:8000` 是否可访问
2. **测试API接口**: 在调试页面中点击"测试关键词API"按钮
3. **检查网络请求**: 在开发者工具的Network标签页中查看API请求详情
4. **验证用户ID**: 确保用户ID存在且格式正确
5. **测试删除功能**: 在浏览器控制台中运行 `testKeywordDelete()` 函数

### 删除关键词问题
如果删除关键词功能不工作：

1. **检查关键词数据结构**: 确认后端返回的关键词对象包含 `id` 字段
2. **查看控制台日志**: 删除时会输出详细的关键词信息
3. **手动测试删除**: 使用浏览器控制台测试删除功能
4. **验证API响应**: 确认删除API返回正确的状态码

```javascript
// 在浏览器控制台中测试删除功能
import { testKeywordDelete } from '@/utils/debug'
testKeywordDelete()
```

### API测试
```javascript
// 测试获取关键词
fetch('http://127.0.0.1:8000/keywords/user/1')
  .then(response => response.json())
  .then(data => console.log('关键词数据:', data))
  .catch(error => console.error('API错误:', error))

// 测试删除关键词
fetch('http://127.0.0.1:8000/keywords/1', { method: 'DELETE' })
  .then(response => {
    if (response.ok) {
      console.log('删除成功')
    } else {
      console.error('删除失败:', response.status)
    }
  })
  .catch(error => console.error('删除API错误:', error))
```

## 其他常见问题

### 页面刷新后数据丢失
- 确保用户信息已持久化到localStorage
- 检查Pinia store的初始化逻辑

### 路由跳转问题
- 检查路由守卫配置
- 确认用户认证状态

### 样式问题
- 清除浏览器缓存
- 检查CSS文件是否正确加载

## 联系支持
如果问题仍然存在，请：
1. 收集控制台错误信息
2. 记录复现步骤
3. 提供后端API响应示例
4. 联系技术支持团队 