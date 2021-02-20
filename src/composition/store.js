import { ref, toRef, reactive, computed } from 'vue'
import { map } from '@/composition/map'

export const pharData = reactive({ // 藥局資料
  pharmacies: [],
  timeStamp: ''
})
export const timeStamp  = toRef(pharData, 'timeStamp')
export const locMarker = ref({})
export const usedLoc = reactive({
  position: {
    pre: {}, // 沒有內部結構，覺得會出事，先寫著
    cur: {} // 沒有內部結構
  },
  searchLoc: []
})
export const appControl = reactive({ // 操作面板
  dataState: 'load',
  mode: 'gps',
  page: 'main',
  searchText: {
    cur: '',
    pre: ''
  },
  weekDay: '',
  chosen: [],
  category: 'distance',
  itemNum: 10,
})

const merit = (item1, item2) => {
  switch (appControl.category) {
    case 'distance':
      // let itemCor1 = [item1.geometry.coordinates[1], item1.geometry.coordinates[0]];
      // let itemCor2 = [item2.geometry.coordinates[1], item2.geometry.coordinates[0]];
      return -(map.distance(itemCor1, usedLoc.position.cur) - map.distance(itemCor2, usedLoc.position.cur));
    case 'adult':
      return item1.properties.mask_adult - item2.properties.mask_adult;
    case 'child':
      return item1.properties.mask_child - item2.properties.mask_child;
  }
}

// function pharAround
export const pharAround = computed(() => {
  appControl.chosen = pharData.pharmacies.filter((item) => {
    return map.distance(usedLoc.position.cur, item) < 5000;
  });
})

export const listPhar = computed(() => { // 藥局資料篩選
  if (appControl.chosen.length !== 0) {
    if (appControl.itemNum > appControl.chosen.length) { appControl.itemNum = appControl.chosen.length; }
    appControl.chosen = appControl.chosen.sort((pharA, pharB) => merit(pharA, pharB))
    return appControl.chosen.slice(0, appControl.itemNum);
  }
})
export const numPhar = computed(() => { // 剩餘附近藥局數量
  return appControl.chosen.length - appControl.itemNum;
})
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

export const getQuantity = async () => {
  const json = await fetch('https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json')
    .then(response => {
      if (response.ok) {
        return response.json()
      } else {
        appControl.dataState = 'error'
        return []
      }
    }).catch(() => {
      appControl.dataState = 'error'
      return []
    })

  pharData.pharmacies = json.features.map(d => {
    return {
      ...d.properties,
      lat: d.geometry.coordinates[0],
      lng: d.geometry.coordinates[1]
    }
  })

  if (pharData.pharmacies.length !== 0) {
    timeStamp.value = pharData.pharmacies[0].updated;
    // markers.clearLayers();
    // if (usedLoc.position.cur.lat) {
    //   pharAround();
    // }
    // drawSpots(pharData.pharmacies);
    appControl.dataState = 'ready';
  } else {
    appControl.dataState = 'error';
  }
}