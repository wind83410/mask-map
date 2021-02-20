<template>
  <div class="container-fluid px-0 d-flex flex-column monitor">
    <Navbar />
    <div class="map-interface d-flex">
      <Panel />
      <Map />
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Panel from '@/components/Panel.vue'
import Map from '@/components/Map.vue'
import { onMounted } from 'vue'
import {
  getQuantity
} from '@/composition/store'

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
@import '@/style/all.scss';
</style>