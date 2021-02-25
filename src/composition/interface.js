import { reactive, toRef, computed, onMounted, watch } from 'vue'
import { dataState, getQuantity } from '/@/composition/store'
import { map, updateUserPos } from '/@/composition/map'
import Modal from 'bootstrap/js/dist/modal'

export const usedLoc = reactive({ // 使用過的位置紀錄
  position: { // 預設位置
    pre: {
      lat: 22.604799,
      lng: 120.2976256
    },
    cur: {
      lat: 22.604799,
      lng: 120.2976256
    }
  },
  searchLoc: [] // 搜尋紀錄
})

export const appControl = reactive({ // 操作面板
  mode: 'gps',
  page: 'main',
  searchText: {
    cur: '',
    pre: ''
  },
  weekDay: '',
  category: 'distance',
  itemNum: 10,
})

export const curPos = toRef(usedLoc.position, 'cur')
export const userPos = toRef(usedLoc, 'position')
export const ordering = toRef(appControl, 'category')
export const itemNum = toRef(appControl, 'itemNum')
export const mode = toRef(appControl, 'mode')

export const avaliableDay = computed(() => {
  appControl.weekDay = new Date(Date.now()).getDay();
  if (appControl.weekDay == 0) {
    return '都能買';
  } else if (appControl.weekDay % 2 == 0) {
    return '偶數';
  } else {
    return '奇數';
  }
})

// Search engine AJAX
export const search = async keyword => {

  if (keyword === '') { return }

  const searched = usedLoc.searchLoc
  const api = `https://nominatim.openstreetmap.org/search?q=${keyword}&format=geojson`
  const result = await fetch(api).then(response => {
    if (response.ok) {
      return response.json()
    } else {
      alert('搜尋引擎無回應，請稍後再試一次')
      return []
    }
  }).catch(Error('無法和連上搜尋引擎，請稍後再試')).then(data => data.features)

  if (result.length) {
    const [lng, lat] = result[0].geometry.coordinates
    updateUserPos({lat, lng})
    map.value.setView(curPos.value, 16)
    if (!searched.includes(keyword)) {
      searched.push({
        name: keyword,
        coordinates: {lat, lng}
      })
      appControl.searchText.pre = keyword
      mode.value = 'search'
    }
    appControl.page = 'main'
  }
}

export const searchRecord = record => {
  updateUserPos(record.coordinates)
  map.value.setView(curPos.value)
  appControl.searchText.pre = record.name
  mode.value = 'search'
  appControl.page = 'main'
}

export const scrollToTop = (selectorName, duration = 1000) => {
  let targetEl, scrollPos, scrollCount = 0, oldTimeStamp = null
  if (typeof selectorName === 'string') {
    targetEl = document.querySelector(selectorName)
    scrollPos = targetEl.scrollTop
    if (scrollPos === 0) return
  }

  const step = (newTimeStamp) => {
    if (oldTimeStamp !== null) {
      scrollCount += Math.PI * (newTimeStamp - oldTimeStamp) / duration
      if (scrollCount >= Math.PI) { return targetEl.scrollTop = 0 } // terminate recursion
      targetEl.scrollTop = scrollPos / 2 * ( 1 + Math.cos(scrollCount) )
    }
    oldTimeStamp = newTimeStamp
    window.requestAnimationFrame(step)
  }
  window.requestAnimationFrame(step)
}

export const panelInit = () => {
  onMounted(() => {
    new Modal(document.querySelector('.modal'))
  })

  watch(dataState, state => {
    if (state === 'download') { getQuantity() }
  })
  watch(mode, (curMode, preMode) => {
    if (curMode === 'search' && preMode === 'gps') { map.value.stopLocate() }
  })
}