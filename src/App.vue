<template>
  <div class="container-fluid px-0 d-flex flex-column monitor">
    <Navbar />
    <div class="map-interface d-flex flex-item-unscroll">
      <Panel />
      <Map />
    </div>
    <div
      class="modal fade"
      id="staticBackdrop"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">口罩實名制</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <img
              class="img-fluid"
              src="./assets/images/mask_realname.png"
              alt="Real-time mask purchase system"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '/@/components/Navbar.vue'
import Panel from '/@/components/Panel.vue'
import Map from '/@/components/Map.vue'
import { onMounted } from 'vue'
import {
  getQuantity
} from '/@/composition/store'

export default {
  setup () {
    onMounted(() => {
      getQuantity()
    })
    return {
      Navbar,
      Panel,
      Map
    }
  }
}
// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md
</script>

<style lang="scss">
@import '../src/style/all.scss';
</style>
