import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// 导入 Element Plus 相关依赖
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入 Pinia 相关依赖
import { createPinia } from 'pinia'

// 全量引入echarts
import * as echarts from 'echarts'
window.echarts = echarts // 可选，方便全局调试

// 创建 Pinia 实例
const pinia = createPinia()

// 创建 Vue 应用实例并配置
const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(router)
app.use(pinia)
app.use(ElementPlus, {
  locale: zhCn, // 设置中文语言包
})

// 挂载应用
app.mount('#app')
