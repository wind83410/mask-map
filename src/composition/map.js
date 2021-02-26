import { onMounted, watch, ref } from 'vue'
import L from 'leaflet'
import { dataState, listPhar, orderPhar } from '/@/composition/store'
import { ordering, userPos, mode, itemNum } from '/@/composition/interface'

const blueIcon = new L.icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const greenIcon = new L.icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blackIcon = new L.icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = new L.icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// const markerGroups = new L.MarkerClusterGroup();
const markers = []
export const userMarker = L.marker(userPos.value.cur, {icon: blueIcon}).bindPopup(`現在位置`)
export const map = ref(null)

export const classify = (mask_quan) => {
  let state, icon
  if (mask_quan == 0) {
    state = 'out-of-stock'
    icon = blackIcon
  } else if (mask_quan > 0 && mask_quan <= 500) {
    state = 'short-supply'
    icon = orangeIcon
  } else if (mask_quan > 500) {
    state = 'in-stock'
    icon = greenIcon
  }
  return { state, icon }
}

const addSpot = el => {
  const { icon } = classify(el.mask_adult)
  const marker = L.marker({ lat: el.lat, lng: el.lng }, { icon })
    .bindPopup(`
      <h6 class="text-center">${el.name}</h5>
      <ul class="d-flex popup-masks list-unstyled mb-2">
        <li class="${classify(el.mask_adult).state} rounded me-1 py-1 px-1 w-50 text-center h5">${el.mask_adult}</li>
        <li class="${classify(el.mask_child).state} rounded py-1 px-1 w-50 text-center h5">${el.mask_child}</li>
      </ul>
      <dl class="popup-mask-info mb-2">
        <div class="row g-2">
          <dt class="col-3 text-secondary">口罩</dt>
          <dd class="col-9">${el.note}</dd>
          <dt class="col-3 text-secondary">備註</dt>
          <dd class="col-9">${el.custom_note}</dd>
        </div>
      </dl>
      <div class="d-flex popup-link-group">
        <a class="py-2 popup-link rounded"
          href="https://www.google.com/maps/search/?api=1&query=${el.name}+${el.address}"
          target="_blank"
        >
          <i class="fas fa-clock"></i>
          營業時間
        </a>
        <a class="py-2 popup-link rounded"
          href="tel:${el.phone}">
          <i class="fas fa-phone"></i>
          打電話
        </a>
      </div>
    `)
  marker.markerId = el.id
  marker.mask_adult = el.mask_adult
  marker.mask_child = el.mask_child
  map.value.addLayer(marker)
  markers.push(marker)
}

const swapIcons = maskType => markers.forEach(el => el.setIcon(classify(el[maskType]).icon))

const clearSpots = () => {
  markers.forEach((m) => map.value.removeLayer(m))
  markers.length = 0
}

export const updateUserPos = newPos => {
  itemNum.value = 10
  userPos.value.pre = userPos.value.cur
  userPos.value.cur.lat = newPos.lat
  userPos.value.cur.lng = newPos.lng
  orderPhar()
  clearSpots()
  listPhar.value.forEach(element => addSpot(element))
  userMarker.setLatLng(userPos.value.cur)
}

export const getGPS = () => {
  mode.value = 'gps'
  map.value.once('locationfound', function (event) {
    updateUserPos(event.latlng)
  });
  map.value.once('locationerror', function () {
    if (userPos.pre.lat) {
      alert('無法順利定位，將使用上次使用的位置')
      updateUserPos(userPos.pre)
    } else {
      alert('無法定位，請允許存取位置或稍後重試')
    }
  });
  map.value.locate({ setView: true })
}

export const centering = markerId => {
  const mark = markers.find(e => e.markerId === markerId)
  map.value.flyTo(new L.latLng(mark.getLatLng()), 18)
  map.value.once('moveend', () => {
    mark.openPopup();
  })
}

export const mapInit = () => {
  onMounted(() => {
    map.value = L.map('map', {
      center: [22.604799, 120.2976256],
      zoom: 8
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.value);

    map.value.addLayer(userMarker).flyTo(userMarker.getLatLng(), 12)
  })

  watch(dataState, (state, preState) => {
    if (state === 'ready' && preState === 'load') {
      clearSpots()
      listPhar.value.forEach(element => addSpot(element))
    }
  })

  watch(itemNum, (cur, pre) => {
    if (cur > pre) {
      clearSpots()
      listPhar.value.forEach(element => addSpot(element))
    }
  })

  watch(ordering, (cur, pre) => {
    if (cur !== pre) swapIcons(`mask_${cur !== 'child' ? 'adult' : cur}`)
  })
}