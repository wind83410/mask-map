import { ref, computed } from 'vue'
import { map } from '@/composition/map'
import { curPos, ordering, itemNum } from '@/composition/interface'

export const pharmacies = ref([])
export const timeStamp = ref('') // 時間戳記
export const dataState = ref('download')

const merit = (item1, item2) => {
  switch (ordering.value) {
    case 'adult':
      return item2.mask_adult - item1.mask_adult
    case 'child':
      return item2.mask_child - item1.mask_child
  }
}

export const orderPhar = () => pharmacies.value.sort((pharA, pharB) => {
  return map.value.distance(pharA, curPos.value) - map.value.distance(pharB, curPos.value)
})

export const listPhar = computed(() => { // 藥局資料篩選
  if (ordering.value === 'distance') {
    return pharmacies.value.slice(0, itemNum.value)
  } else {
    return pharmacies.value.slice(0, itemNum.value).sort((a, b) => merit(a, b))
  }
})

export const getQuantity = async () => {
  dataState.value = 'load'
  const json = await fetch('https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json')
    .then(response => {
      if (response.ok) {
        return response.json()
      } else {
        dataState.value = 'error'
        return []
      }
    }).catch(() => {
      dataState.value = 'error'
      return []
    })

  pharmacies.value = json.features.map(d => {
    return {
      ...d.properties,
      lat: d.geometry.coordinates[1],
      lng: d.geometry.coordinates[0]
    }
  })
  if (pharmacies.value.length !== 0) {
    timeStamp.value = pharmacies.value[0].updated;
    orderPhar()
    dataState.value = 'ready';
  } else {
    dataState.value = 'error';
  }
}