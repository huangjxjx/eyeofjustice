import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/user'

function emotionToChinese(label) {
  switch (label) {
    case 'neutral': return '正常'
    case 'angry': return '愤怒'
    case 'happy': return '高兴'
    case 'sad': return '悲伤'
    case 'fearful': return '恐惧'
    case 'disgust': return '厌恶'
    case 'surprise': return '惊讶'
    default: return '异常'
  }
}

export const useVoiceStore = defineStore('voice', {
  state: () => ({
    ws: null,
    connected: false,
    voiceList: []
  }),
  actions: {
    connectWebSocket() {
      if (this.connected || this.ws) return
      this.ws = new WebSocket('ws://localhost:8000/voice_data/ws/audio-stream')
      this.ws.onopen = () => {
        this.connected = true
        try {
          const userStore = useUserStore()
          const userId = userStore.userId
          if (userId) {
            this.ws.send(JSON.stringify({ user_id: userId }))
          }
        } catch (e) {
          console.error('发送user_id失败', e)
        }
        console.log('WebSocket已连接')
      }
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.voiceList.unshift({
            content: data.text || '',
            keywords: (data.keywords || []).join(','),
            emotion: emotionToChinese(data.emotion?.label),
            eventType: (data.events && data.events.length > 0) ? data.events[0].label : '',
            time: data.timestamp
          })
          if (this.voiceList.length > 6) this.voiceList.length = 6
        } catch (e) {
          console.error('WebSocket数据解析失败', e)
        }
      }
      this.ws.onclose = () => {
        this.connected = false
        this.ws = null
        console.log('WebSocket已断开')
      }
      this.ws.onerror = (e) => {
        this.connected = false
        this.ws = null
        console.error('WebSocket错误', e)
      }
    },
    disconnectWebSocket() {
      if (this.ws) {
        this.ws.close()
        this.ws = null
        this.connected = false
      }
    },
    clearVoiceList() {
      this.voiceList = []
    }
  }
}) 