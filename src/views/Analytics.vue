<template>
  <div class="analytics-container">
    <div class="analytics-header">
      <h2>数据分析</h2>
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="margin-left: 24px;" size="small" />
    </div>
    <el-row :gutter="24">
      <el-col :xs="24" :md="16">
        <el-card class="analytics-card">
          <div class="card-title">
            <el-icon><TrendCharts /></el-icon>
            <span>霸凌事件趋势</span>
          </div>
          <div ref="trendChart" style="height: 300px; width: 100%"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card class="analytics-card">
          <div class="card-title">
            <el-icon><PieChart /></el-icon>
            <span>类型分布</span>
          </div>
          <div ref="typeChart" style="height: 300px; width: 100%"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="24" style="margin-top: 24px;">
      <el-col :xs="24" :md="12">
        <el-card class="analytics-card">
          <div class="card-title">
            <el-icon><Histogram /></el-icon>
            <span>关键词热度排行</span>
          </div>
          <div ref="keywordChart" style="height: 260px; width: 100%"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="analytics-card">
          <div class="card-title">
            <el-icon><Warning /></el-icon>
            <span>近期高危事件</span>
          </div>
          <el-table :data="dangerList" size="small" style="width: 100%" :empty-text="'暂无高危事件'">
            <el-table-column prop="type" label="类型" width="80">
              <template #default="{ row }">
                <el-tag v-if="row.type==='RFID'" type="warning">RFID</el-tag>
                <el-tag v-else type="danger">语音</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="desc" label="事件描述" min-width="120" />
            <el-table-column prop="person" label="涉事人" width="80" />
            <el-table-column prop="time" label="时间" width="140" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import { TrendCharts, PieChart, Histogram, Warning } from '@element-plus/icons-vue'
import { getAlertCountByDate, getAlertTypeCountByDate } from '@/api/alerts'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userId = userStore.userId

const dateRange = ref([])
const dangerList = ref([
  { type: 'RFID', desc: '推搡同学', person: '张三', time: '2024-06-06 09:01' },
  { type: '语音', desc: '辱骂同学', person: '李四', time: '2024-06-06 10:12' },
  { type: 'RFID', desc: '强行索要物品', person: '王五', time: '2024-06-05 15:20' }
])

// 图表ref
const trendChart = ref(null)
const typeChart = ref(null)
const keywordChart = ref(null)

// echarts实例
let trendChartInstance = null
let typeChartInstance = null
let keywordChartInstance = null

// 霸凌事件趋势图配置（动态）
const trendOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 40, bottom: 40 },
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value' },
  series: [
    { name: '霸凌事件数', type: 'line', data: [], smooth: true, areaStyle: {} }
  ]
})
// 类型分布图配置（动态）
const typeOption = ref({
  tooltip: { trigger: 'item' },
  legend: { top: 'bottom' },
  series: [
    {
      name: '类型',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      label: { show: true, position: 'outside' },
      data: []
    }
  ]
})
const keywordOption = {
  tooltip: {},
  grid: { left: 40, right: 20, top: 40, bottom: 40 },
  xAxis: { type: 'category', data: ['威胁', '辱骂', '霸凌', '索要', '推搡'] },
  yAxis: { type: 'value' },
  series: [
    { data: [12, 10, 8, 6, 4], type: 'bar', color: '#f56c6c', barWidth: 30 }
  ]
}

/**
 * 获取指定日期区间的所有日期字符串数组
 */
function getDateArray(start, end) {
  const arr = []
  const dt = new Date(start)
  const endDt = new Date(end)
  while (dt <= endDt) {
    arr.push(dt.toISOString().slice(0, 10))
    dt.setDate(dt.getDate() + 1)
  }
  return arr
}

/**
 * 工具函数：将Date对象或字符串格式化为'YYYY-MM-DD'
 */
function formatDateToYMD(date) {
  if (!date) return ''
  if (typeof date === 'string') return date.slice(0, 10)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 拉取趋势数据并更新图表
 */
async function fetchTrendData() {
  let start, end
  if (dateRange.value && dateRange.value.length === 2) {
    start = formatDateToYMD(dateRange.value[0])
    end = formatDateToYMD(dateRange.value[1])
  } else {
    // 默认最近7天
    const today = new Date()
    const before = new Date()
    before.setDate(today.getDate() - 6)
    start = formatDateToYMD(before)
    end = formatDateToYMD(today)
    dateRange.value = [start, end]
  }
  // 请求接口
  try {
    const res = await getAlertCountByDate({
      user_id: userId,
      start_date: start,
      end_date: end
    })
    // 组装横坐标和数据
    const dateArr = getDateArray(start, end)
    const countMap = {}
    ;(res.data || []).forEach(item => {
      countMap[item.date] = item.count
    })
    const dataArr = dateArr.map(d => countMap[d] || 0)
    // 更新option
    trendOption.value.xAxis.data = dateArr.map(d => d.slice(5)) // 只显示月-日
    trendOption.value.series[0].data = dataArr
    // 更新图表
    if (trendChartInstance) {
      trendChartInstance.setOption(trendOption.value)
    }
  } catch (e) {
    // 错误处理
    trendOption.value.xAxis.data = []
    trendOption.value.series[0].data = []
    if (trendChartInstance) trendChartInstance.setOption(trendOption.value)
  }
}

/**
 * 拉取类型分布数据并更新图表
 */
async function fetchTypeData() {
  let start, end
  if (dateRange.value && dateRange.value.length === 2) {
    start = formatDateToYMD(dateRange.value[0])
    end = formatDateToYMD(dateRange.value[1])
  } else {
    // 默认最近7天
    const today = new Date()
    const before = new Date()
    before.setDate(today.getDate() - 6)
    start = formatDateToYMD(before)
    end = formatDateToYMD(today)
  }
  try {
    const res = await getAlertTypeCountByDate({
      user_id: userId,
      start_date: start,
      end_date: end
    })
    // 组装饼图数据
    const dataArr = [
      { value: res.data['RFID霸凌检测'] || 0, name: 'RFID' },
      { value: res.data['语音霸凌检测'] || 0, name: '语音' }
    ]
    typeOption.value.series[0].data = dataArr
    if (typeChartInstance) {
      typeChartInstance.setOption(typeOption.value)
    }
  } catch (e) {
    typeOption.value.series[0].data = []
    if (typeChartInstance) typeChartInstance.setOption(typeOption.value)
  }
}

function resizeCharts() {
  trendChartInstance && trendChartInstance.resize()
  typeChartInstance && typeChartInstance.resize()
  keywordChartInstance && keywordChartInstance.resize()
}

onMounted(() => {
  trendChartInstance = echarts.init(trendChart.value)
  fetchTrendData()
  typeChartInstance = echarts.init(typeChart.value)
  fetchTypeData()
  keywordChartInstance = echarts.init(keywordChart.value)
  keywordChartInstance.setOption(keywordOption)
  window.addEventListener('resize', resizeCharts)
})

// 监听日期变化自动拉取数据
watch(dateRange, () => {
  fetchTrendData()
  fetchTypeData()
})

onBeforeUnmount(() => {
  trendChartInstance && trendChartInstance.dispose()
  typeChartInstance && typeChartInstance.dispose()
  keywordChartInstance && keywordChartInstance.dispose()
  window.removeEventListener('resize', resizeCharts)
})
</script>

<script>
export default {
  name: 'AnalyticsPage'
}
</script>

<style scoped>
.analytics-container {
  padding: 30px;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%);
}
.analytics-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.analytics-card {
  border-radius: 18px;
  box-shadow: 0 4px 18px rgba(102, 126, 234, 0.08);
  background: #fff;
  margin-bottom: 24px;
}
.card-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  gap: 8px;
}
</style> 