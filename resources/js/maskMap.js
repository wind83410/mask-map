let map = L.map('map', {
    center: [22.604799,120.2976256],
    zoom: 8
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
let markers = new L.MarkerClusterGroup();
const greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
const blackIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
const redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
const orangeIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

$(document).ready(function() {
    $('.call-control').on('click', function(){
        $('.map-control-container').toggleClass('slide-in');
    });
});

let maskApp = new Vue({
    el: '#map-control',
    data: {
        pharmacies: [], // original data
        chosen: [],
        order: [],
        history: [],
        timeStamp: '',
        userLoc: {},
        locMarker: {},
        category: 'adult',
        appState: 'load',
        page: 'main',
        mode: 'gps',
        itemNum: 10,
        weekDay: '',
        searchText: {
            cur: '',
            pre: ''
        },
    },
    methods: {
        getQuantity: function (){
            let xml = new XMLHttpRequest();
            let vm = this;

            xml.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json?fbclid=IwAR24jhHb_hRsjl7yLeyUOaEE6QpLLBlY04mwxqokTOxZbQ6-n8jk4qdmhvc');
            xml.send();
            xml.onload = function(){
                vm.pharmacies = JSON.parse(this.responseText).features;
                if (vm.pharmacies.length !== 0) {
                    vm.timeStamp = vm.pharmacies[0].properties.updated;
                    markers.clearLayers();
                    vm.pharAround();
                    vm.drawSpots(vm.pharmacies);
                    vm.appState = 'ready';
                } else {
                    vm.appState = 'error';
                }
            };
            xml.onerror = function() {
                vm.appState = 'error';
            }
        },
        getGPS: function() {
            var vm = this;
            vm.mode = 'gps';
            map.once('locationfound', function(event){
                vm.userLoc = event.latlng;
                vm.locMarker = L.marker(event.latlng);
                vm.pharAround(); // bug here
                map.addLayer(vm.locMarker);
            });
            map.locate({setView: true});
        },
        findAround: function() {
            if (this.mode == 'search') {
                map.removeLayer(this.locMarker);
                this.getGPS();
                this.mode = 'gps';
            }
        },
        pharAround: function (){
            var vm = this;
            this.chosen = this.pharmacies.filter( (item) => {
                let pharLoc = {lat: item.geometry.coordinates[1], lng:item.geometry.coordinates[0]};
                return map.distance(vm.userLoc, pharLoc) < 5000;
            });
        },
        drawSpots: function(arr) {
            let vm = this;
            arr.forEach(item => {
                let name = item.properties.name;
                let quan = [item.properties.mask_adult, item.properties.mask_child];
                let pharLoc = {lat: item.geometry.coordinates[1], lng:item.geometry.coordinates[0]};
                let specMask = vm.category == 'adult' ? quan[0] : quan[1];
                let tag;
                if (specMask > 100) {tag = greenIcon;} 
                else if (specMask > 50) {tag = orangeIcon}
                else if (specMask > 0) {tag = redIcon}
                else {tag = blackIcon}
                markers.addLayer(L.marker(pharLoc, {icon: tag}).bindPopup(`
                    <h5 class="text-center">${name}</h5>
                    <ul class="list-group flex-row mask-popup">
                        <li class="${vm.classify(quan[0])} list-group-item rounded border-0 mr-1 py-1 px-1 w-50 text-center h5">${quan[0]}</li>
                        <li class="${vm.classify(quan[1])} list-group-item rounded border-0 py-1 px-1 w-50 text-center h5">${quan[1]}</li>
                    </ul>
                    `
                ));
            });
            map.addLayer(markers);
        },
        centering: function(cor) {
            map.setView([cor[1], cor[0]]);
        },
        search: function(keyword) {
            if (keyword !== '') {
                let xml = new XMLHttpRequest();
                let searchAdd = `https://nominatim.openstreetmap.org/search?q=${keyword}&format=geojson`;
                let cor;
                let vm = this;

                xml.open('get', searchAdd);
                xml.send();
                xml.onload = function (){
                    cor = JSON.parse(this.responseText).features[0].geometry.coordinates;
                    map.setView([cor[1], cor[0]], 16);
                    vm.userLoc = {
                        lat: cor[1],
                        lng: cor[0]
                    };
                    vm.pharAround();
                    map.removeLayer(vm.locMarker);
                    vm.locMarker = L.marker(vm.userLoc);
                    map.addLayer(vm.locMarker);
                    if (vm.mode == 'gps') {
                        map.stopLocate();
                        vm.mode = 'search';
                    }
                    if (vm.chosen.length !== 0 && !vm.history.includes(keyword)) {
                        vm.history.push(keyword);
                        vm.searchText.pre = keyword;
                        vm.page = 'main';
                    } else if (vm.history.includes(keyword)) {
                        vm.searchText.pre = keyword;
                        vm.page = 'main';
                    }
                    else if (vm.chosen.length == 0) {
                        alert('沒有結果，建議更換關鍵字。')
                    }
                };
                xml.onerror = function(){
                    alert('搜尋引擎無回應，請稍後再試一次')
                }
            } else {
                alert('請輸入關鍵字')
            }
        },
        // functions for internal use
        classify: function(mask_quan) {
            if (mask_quan == 0) {return 'out-of-stock';}
            else if (mask_quan > 0 && mask_quan <= 100) {return 'short-supply';}
            else if (mask_quan > 100) {return 'in-stock';}
        },
        merit: function(item1, item2) {
            switch (this.category) {
                case 'distance':
                    let itemCor1 = [item1.geometry.coordinates[1], item1.geometry.coordinates[0]];
                    let itemCor2 = [item2.geometry.coordinates[1], item2.geometry.coordinates[0]];
                    return -(map.distance(itemCor1, this.userLoc) - map.distance(itemCor2, this.userLoc));
                case 'adult':
                    return item1.properties.mask_adult - item2.properties.mask_adult;
                case 'child':
                    return item1.properties.mask_child - item2.properties.mask_child;
            }
        },
        quickSort: function(arr, left, right) {
            if (left < right) {
                let pivot = arr[left];
                let i = left;
                let j = right+1;
                do {
                    do j--; while (this.merit(arr[j], pivot) < 0 );
                    do i++; while (i < j && this.merit(arr[i], pivot) >= 0);
                    if (i<j) { [arr[i], arr[j]] = [arr[j], arr[i]]; }
                } while (i<j);
                [arr[left], arr[j]] = [arr[j], arr[left]];
                this.quickSort(arr, left, j-1);
                this.quickSort(arr, j+1, right);
            }
            return arr;
        },
        scrollToTop: function() {
            $('.overflow-auto').animate({
                scrollTop: 0
            }, 2000);
        },
        whichDay: function() {
            let time = Date.now();
            this.weekDay = new Date(time).getDay();
        }
    },
    computed: {
        listPhar: function() {
            if (this.chosen.length !== 0) {
                if (this.itemNum > this.chosen.length) {this.itemNum = this.chosen.length;}
                this.chosen = this.quickSort(this.chosen, 0, this.chosen.length-1);
                return this.chosen.slice(0, this.itemNum);
            }
        },
        numPhar: function() {
            return this.chosen.length - this.itemNum;
        },
        avaliableDay: function() {
            if (this.weekDay == 0) {
                return '都能買';
            } else if (this.weekDay%2 == 0) {
                return '偶數';
            } else {
                return '奇數';
            }
        }
    },
    watch: {
        appState: function(cur, pre) {
            if (cur=='download') {
                this.getQuantity();
            }
        }
    },
    mounted: function() {
        this.whichDay();
        this.getGPS();
        this.getQuantity();
    }
});