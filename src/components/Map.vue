<template>
  <div class="d-flex flex-column flex-grow-1">
    <div id="map" class="flex-grow-1"></div>
  </div>
</template>

<script>
import { mapInit } from '@/composition/map'

export default {
  setup () {
    mapInit()
  }
}
</script>

<style>

</style>