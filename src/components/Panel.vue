<template>
  <div class="map-control-container h-100 overflow-auto">
    <div class="bg-light d-flex flex-column" id="map-control">
      <div
        class="pt-3 flex-grow-1"
        :class="{
          'px-3': appControl.page == 'main',
          'd-flex flex-column position-relative': appControl.page == 'control'
        }"
      >
        <template v-if="appControl.page == 'main'">
          <div
            class="search-control input-group my-2 my-lg-0 rounded"
            @click="
              appControl.page = 'control',
              appControl.searchText.cur = ''
            "
          >
            <p class="searchbar form-control border border-right-0 my-0">
              <span
                v-if="appControl.searchText == '' && appControl.mode !== 'gps'"
                >點一下搜尋地點或使用定位</span
              >
              <span v-else-if="appControl.mode == 'gps'">目前定位</span>
              <span v-else v-text="appControl.searchText.pre"></span>
            </p>
            <span class="find-phar btn border border-left-0">
              <i class="fas fa-crosshairs"></i>
            </span>
          </div>
          <h2 class="available my-3">
            <span> {{ avaliableDay }} </span><small class="ml-2">購買日</small>
            <button
              type="button"
              class="realname-info btn p-0 rounded-circle"
              data-toggle="modal"
              data-target="#staticBackdrop"
            ></button>
          </h2>
          <div class="d-flex align-items-center my-2">
            <p class="description my-auto">
              方圓 5 km 以內的的供應商<br />
              更新時間:
              <span
                v-if="appControl.dataState == 'ready'"
                v-text="timeStamp"
              ></span>
              <span v-else-if="appControl.dataState !== 'error'"
                >資料下載中</span
              >
            </p>
            <button
              class="btn rounded-pill my-2 ml-auto"
              :class="{ active: appControl.dataState == 'download' }"
              :disabled="appControl.dataState == 'error'"
              @click="appControl.dataState = 'download'"
            >
              重整清單
            </button>
          </div>
          <div
            class="mask-sort d-inline-block"
            v-if="appControl.dataState !== 'error'"
          >
            <i class="fas fa-sort-amount-down sort-icon"></i>
            <button
              class="btn py-1 ml-1 rounded-pill"
              :class="{ active: appControl.category == 'distance' }"
              @click="appControl.category = 'distance'"
            >
              距離
            </button>
            <button
              class="btn py-1 ml-1 rounded-pill"
              :class="{ active: appControl.category == 'adult' }"
              @click="appControl.category = 'adult'"
            >
              大人口罩
            </button>
            <button
              class="btn py-1 ml-1 rounded-pill"
              :class="{ active: appControl.category == 'child' }"
              @click="appControl.category = 'child'"
            >
              小孩口罩
            </button>
          </div>
          <p class="alert alert-danger" v-if="appControl.dataState == 'error'">
            抱歉，我們無法讀取口罩即時資料。請稍後再試一次看看，如果再不行請檢查一下網路。
          </p>
          <ul class="pharmacy-list list-group">
            <li
              class="list-group-item my-2 px-3 border-0 rounded"
              v-for="(item, ind) in listPhar" :key="`pharmacy-${ind}`"
            >
              <ul class="mask-quantity list-group flex-row mb-2">
                <li
                  class="list-group-item rounded border-0 px-3 w-50"
                  :class="classify(item.mask_adult)"
                >
                  成人口罩數量<em>{{ item.mask_adult }}</em
                  >片
                </li>
                <li
                  class="list-group-item rounded border-0 px-3 w-50"
                  :class="classify(item.mask_child)"
                >
                  兒童口罩數量<em>{{ item.mask_child }}</em
                  >片
                </li>
              </ul>
              <h3 class="pharmacy-name d-flex">
                {{ item.name }}
                <a
                  :href="`https://www.google.com/maps/search/?api=1&query=${item.name}+${item.address}`"
                  target="_blank"
                  class="text-secondary ml-auto"
                  ><small><i class="fas fa-clock"></i></small
                ></a>
              </h3>
              <ul class="pharmacy-info list-group">
                <li class="list-group-item px-0 py-1 border-0">
                  <small class="info-item text-secondary">地址</small>
                  <span>{{ item.address }}</span>
                  <a
                    href="#"
                    @click.prevent="centering(item)"
                    class="text-secondary"
                    ><i class="fas fa-map-marker-alt"></i
                  ></a>
                </li>
                <li class="list-group-item px-0 py-1 border-0">
                  <small class="info-item text-secondary">電話</small>
                  <span>{{ item.phone }}</span>
                  <a
                    :href="'tel:' + item.phone"
                    class="text-secondary"
                    ><i class="fas fa-phone"></i
                  ></a>
                </li>
                <li class="list-group-item side-note px-0 py-1 border-0">
                  <small class="info-item text-secondary">口罩</small>
                  <span>{{ item.note }}</span>
                </li>
                <li class="list-group-item side-note px-0 py-1 border-0">
                  <small class="info-item text-secondary">備註</small>
                  <span>{{ item.custom_note }}</span>
                </li>
              </ul>
            </li>
          </ul>
          <p class="my-2 text-center" v-if="appControl.chosen.length !== 0">
            尚有 {{ numPhar }} 筆
          </p>
          <button
            class="see-more btn d-block rounded-pill mx-auto p-0"
            v-if="appControl.chosen.length !== 0"
            @click="appControl.itemNum += 10"
          >
            查看更多
          </button>
          <div class="position-relative mb-4">
            <button
              class="back-to-top position-absolute btn d-block border-0 rounded-circle mx-auto p-0"
              v-if="appControl.chosen.length !== 0"
              type="submit"
              @click="scrollToTop"
            >
              TOP
            </button>
          </div>
        </template>
        <template v-if="appControl.page == 'control'">
          <form
            class="search-control input-group justify-content-center mb-3 rounded"
          >
            <button class="back btn" type="button" @click.prevent="appControl.page = 'main'">
              <i class="fas fa-chevron-left"></i>
            </button>
            <input
              class="searchbar form-control border border-right-0"
              v-model="appControl.searchText.cur"
              type="text"
              aria-label="Search"
              placeholder="輸入地名或縣市名"
            />
            <button
              type="button"
              class="find-phar btn border border-left-0 mr-3"
              @click.prevent="search(appControl.searchText.cur)"
            >
              <i class="fas fa-search-location"></i>
            </button>
          </form>
          <div class="history-list-title px-3 mb-2 d-flex align-items-center">
            <h3 class="my-2">最近搜尋</h3>
            <button
              class="clear-all btn rounded-pill ml-auto py-1"
              @click="usedLoc.searchLoc = []"
            >
              清除
            </button>
          </div>
          <div class="flex-grow-1 overflow-auto h-100">
            <ul class="history-list list-group mx-3">
              <li
                v-for="(record, ind) in usedLoc.searchLoc"
                :key="`record-${ind}`"
                @click="searchRecord(record)"
                class="list-group-item rounded-0 border-top-0 border-left-0 border-right-0"
              >
                {{ record.name }}
              </li>
            </ul>
          </div>
          <div class="locate d-flex position-absolute align-items-center">
            <span>使用目前位置</span>
            <button
              class="locate-btn btn border-0 rounded-circle ml-auto p-2"
              @click="findAround"
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
      <footer class="copyright px-4 py-3">
        <ul class="list-group list-group-horizontal">
          <li
            class="list-group-item border-left-0 border-white border-bottom-0 border-top-0 py-0 pl-0 pr-2"
          >
            防疫專線 1922
          </li>
          <li class="list-group-item border-0 py-0 pl-2 pr-0">口罩資訊 1911</li>
        </ul>
        <p class="mt-2">
          Search Engine: Nominatim <br />
          Developer: Mack Chen / UI: PY Design
        </p>
      </footer>
    </div>
  </div>
</template>

<script>
import {
  usedLoc,
  appControl,
  listPhar,
  numPhar,
  timeStamp,
  avaliableDay
} from '@/composition/store'

export default {
  setup () {
    return {
      usedLoc,
      appControl,
      listPhar,
      numPhar,
      timeStamp,
      avaliableDay
    }
  }
}
</script>

<style>
</style>