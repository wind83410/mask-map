<template>
  <nav class="mask-navi navbar navbar-expand-lg navbar-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">
        <img
          class="d-inline-block m-0"
          src="../assets/images/logo.png"
          alt="logo"
        />
        <h1 class="d-inline-block align-middle m-0">口罩即時查</h1>
      </a>
      <button
        class="call-control navbar-toggler mr-0 border-0"
        type="button"
        data-target="#map-control"
        aria-controls="map-control"
        aria-expanded="false"
        aria-label="Toggle navigation"
        @click="slide"
      >
        <img
          class="img-fluid"
          src="../assets/images/ic_toggler@2x.png"
          alt=""
        />
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a
              class="nav-link"
              data-bs-toggle="modal"
              data-bs-target="#staticBackdrop"
              >口罩怎麼買</a
            >
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  setup () {
    const slide = () => {
      document.querySelector('.map-control-container').classList.toggle('slide-in')
    }
    return {
      slide
    }
  }
}
</script>
