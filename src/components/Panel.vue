<template>
  <div class="map-control-container overflow-auto">
    <div
      class="bg-light d-flex flex-column"
      :class="{ 'h-100': appControl.page == 'control' }"
      id="map-control"
    >
      <div
        class="pt-3 flex-grow-1"
        :class="{
          'px-3': appControl.page == 'main',
          'd-flex flex-column position-relative flex-item-unscroll': appControl.page == 'control'
        }"
      >
        <template v-if="appControl.page == 'main'">
          <div
            class="search-control input-group my-2 my-lg-0 rounded"
            @click="
              ;(appControl.page = 'control'), (appControl.searchText.cur = '')
            "
          >
            <p class="searchbar form-control border border-end-0 my-0">
              <span
                v-if="appControl.searchText == '' && appControl.mode !== 'gps'"
                >點一下搜尋地點或使用定位</span
              >
              <span v-else-if="appControl.mode == 'gps'">目前定位</span>
              <span v-else> {{ appControl.searchText.pre }} </span>
            </p>
            <span class="find-phar input-group-text">
              <i class="fas fa-crosshairs"></i>
            </span>
          </div>
          <h2 class="available my-3">
            <span> {{ avaliableDay }} </span><small class="ms-1">購買日</small>
            <button
              type="button"
              class="realname-info btn p-0 ms-2 rounded-circle"
              data-bs-toggle="modal"
              data-bs-target="#staticBackdrop"
            ></button>
          </h2>
          <div class="d-flex align-items-center my-2">
            <p class="description my-auto">
              更新時間:
              <span v-if="dataState == 'ready'" v-text="timeStamp"></span>
              <span v-else-if="dataState !== 'error'">資料下載中</span>
            </p>
            <button
              class="btn btn-outline-primary rounded-pill my-2 ms-auto"
              :class="{ active: dataState == 'download' }"
              :disabled="dataState == 'error'"
              @click="dataState = 'download'"
            >
              重整清單
            </button>
          </div>
          <div class="d-flex align-items-center" v-if="dataState !== 'error'">
            <i class="fas fa-sort-amount-down sort-icon me-3"></i>
            <div class="btn-group" v-if="dataState !== 'error'">
              <input
                type="radio"
                value="distance"
                id="sort-distance"
                v-model="appControl.category"
                class="btn-check"
                :class="{ active: appControl.category == 'distance' }"
              />
              <label for="sort-distance" class="btn btn-outline-primary"
                >距離</label
              >
              <input
                type="radio"
                value="adult"
                id="sort-adult-mask"
                v-model="appControl.category"
                class="btn-check"
                :class="{ active: appControl.category == 'adult' }"
              />
              <label for="sort-adult-mask" class="btn btn-outline-primary"
                >大人口罩</label
              >
              <input
                type="radio"
                value="child"
                id="sort-child-mask"
                v-model="appControl.category"
                class="btn-check"
                :class="{ active: appControl.category == 'child' }"
              />
              <label for="sort-child-mask" class="btn btn-outline-primary"
                >小孩口罩</label
              >
            </div>
          </div>
          <p class="alert alert-danger" v-if="dataState == 'error'">
            抱歉，我們無法讀取口罩即時資料。請稍後再試一次看看，如果再不行請檢查一下網路。
          </p>
          <ul class="pharmacy-list list-group">
            <li
              class="list-group-item my-2 px-3 border-0 rounded"
              v-for="(item, ind) in listPhar"
              :key="`pharmacy-${ind}`"
            >
              <ul class="mask-stock text-white list-unstyled d-flex mb-2">
                <li
                  class="rounded p-3 w-50 me-2"
                  :class="classify(item.mask_adult).state"
                >
                  成人口罩數量<em class="mask-stock-quan">{{
                    item.mask_adult
                  }}</em
                  >片
                </li>
                <li
                  class="rounded p-3 w-50"
                  :class="classify(item.mask_child).state"
                >
                  兒童口罩數量<em class="mask-stock-quan">{{
                    item.mask_child
                  }}</em
                  >片
                </li>
              </ul>
              <div class="pharmacy-name">
                <h3 class="pharmacy-name__name mb-0">{{ item.name }}</h3>
                <a
                  :href="`https://www.google.com/maps/search/?api=1&query=${item.name}+${item.address}`"
                  target="_blank"
                  class="pharmacy-name__btn btn btn-outline-secondary"
                  ><i class="fas fa-clock"></i
                ></a>
              </div>
              <ul class="phar-info list-unstyled d-flex flex-column">
                <li class="phar-info-item px-0 py-1 border-0">
                  <small class="text-secondary phar-info-item__title"
                    >地址</small
                  >
                  <span class="phar-info-item__content">{{
                    item.address
                  }}</span>
                  <a
                    href="#"
                    @click.prevent="centering(item.id)"
                    class="phar-info-item__btn btn btn-outline-secondary"
                    ><i class="fas fa-map-marker-alt"></i
                  ></a>
                </li>
                <li class="phar-info-item px-0 py-1 border-0">
                  <small class="text-secondary phar-info-item__title"
                    >電話</small
                  >
                  <span class="phar-info-item__content">{{ item.phone }}</span>
                  <a
                    :href="'tel:' + item.phone"
                    class="phar-info-item__btn btn btn-outline-secondary"
                    ><i class="fas fa-phone"></i
                  ></a>
                </li>
                <li class="phar-info-item px-0 py-1 border-0">
                  <small class="text-secondary phar-info-item__title"
                    >口罩</small
                  >
                  <span class="phar-info-item__content side-note">{{
                    item.note
                  }}</span>
                </li>
                <li class="phar-info-item px-0 py-1 border-0">
                  <small class="text-secondary phar-info-item__title"
                    >備註</small
                  >
                  <span class="phar-info-item__content side-note">{{
                    item.custom_note
                  }}</span>
                </li>
              </ul>
            </li>
          </ul>
          <p class="my-2 text-center">前 {{ appControl.itemNum }} 筆</p>
          <div class="position-relative d-flex">
            <button
              class="see-more btn btn-primary d-block rounded-pill p-0"
              type="button"
              @click="appControl.itemNum += 10"
            >
              查看更多
            </button>
          </div>
          <button
            class="back-to-top btn btn-primary d-block border-0 rounded-circle ms-auto mb-4 p-0"
            type="button"
            @click="scrollToTop('.map-control-container')"
          >
            TOP
          </button>
        </template>
        <template v-if="appControl.page == 'control'">
          <div class="search-control input-group mb-3 px-3 rounded">
            <button
              class="btn btn-outline-primary"
              type="button"
              @click.prevent="appControl.page = 'main'"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <input
              class="searchbar form-control"
              v-model="appControl.searchText.cur"
              type="text"
              aria-label="Search"
              placeholder="輸入地名或縣市名"
            />
            <button
              type="button"
              class="btn btn-outline-primary"
              @click.prevent="search(appControl.searchText.cur)"
            >
              <i class="fas fa-search-location"></i>
            </button>
          </div>
          <div class="bg-primary text-white px-3 d-flex align-items-center">
            <span class="my-2">最近搜尋</span>
            <button
              class="btn btn-sm btn-outline-light rounded-pill ms-auto py-1"
              @click="usedLoc.searchLoc = []"
            >
              清除
            </button>
          </div>
          <div class="flex-grow-1 py-2 overflow-auto">
            <ul class="list-group mx-3">
              <li
                v-for="(record, ind) in usedLoc.searchLoc"
                :key="`record-${ind}`"
                @click="searchRecord(record)"
                class="search-record list-group-item list-group-item-action"
              >
                {{ record.name }}
              </li>
            </ul>
          </div>
          <div class="locate d-flex position-absolute align-items-center">
            <span class="locate__text">使用目前位置</span>
            <button
              class="locate__btn btn btn-lg border-0 rounded-circle ml-auto p-2"
              @click="
                ;(appControl.page = 'main'), (appControl.mode = 'gps'), getGPS()
              "
            >
              <img
                class="d-block"
                src="../assets/images/ic_location@2x.png"
                alt="locate"
              />
            </button>
          </div>
        </template>
      </div>
      <footer class="copyright bg-primary px-4 py-3">
        <ul class="list-unstyled text-white">
          <li class="d-inline-block border-white py-0 pe-2">防疫專線 1922</li>
          <li class="d-inline-block border-white border-start py-0 px-2">
            口罩資訊 1911
          </li>
        </ul>
        <p class="mt-2 text-white">
          Search Engine: Nominatim <br />
          Developer: Mack Chen / UI: PY Design
        </p>
      </footer>
    </div>
  </div>
</template>

<script>
import {
  listPhar,
  timeStamp,
  dataState
} from '/@/composition/store'

import {
  classify,
  centering,
  getGPS
} from '/@/composition/map'

import {
  panelInit,
  appControl,
  usedLoc,
  avaliableDay,
  search,
  searchRecord,
  scrollToTop
} from '/@/composition/interface'

export default {
  setup () {
    panelInit()
    return {
      classify,
      centering,
      getGPS,
      search,
      searchRecord,
      usedLoc,
      appControl,
      dataState,
      listPhar,
      timeStamp,
      avaliableDay,
      scrollToTop
    }
  }
}
</script>
