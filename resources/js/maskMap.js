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
        locMarker: {},
        usedLoc: { 
            position: {
                pre: {},
                cur: {}
            },
            searchLoc: []
        },
        appControl: {
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
        },
        pharData: {
            pharmacies: [],
            timeStamp: ''
        }   
    },
    methods: {
        getQuantity: function (){
            let xml = new XMLHttpRequest();
            let vm = this;

            xml.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json?fbclid=IwAR24jhHb_hRsjl7yLeyUOaEE6QpLLBlY04mwxqokTOxZbQ6-n8jk4qdmhvc');
            xml.send();
            xml.onload = function(){
                vm.pharData.pharmacies = JSON.parse(this.responseText).features;
                if (vm.pharData.pharmacies.length !== 0) {
                    vm.pharData.timeStamp = vm.pharData.pharmacies[0].properties.updated;
                    markers.clearLayers();
                    if (vm.usedLoc.position.cur.lat) {
                        vm.pharAround();
                    }
                    vm.drawSpots(vm.pharData.pharmacies);
                    vm.appControl.dataState = 'ready';
                } else {
                    vm.appControl.dataState = 'error';
                }
            };
            xml.onerror = function() {
                vm.appControl.dataState = 'error';
            }
        },
        getGPS: function() {
            var vm = this;
            vm.appControl.mode = 'gps';
            map.once('locationfound', function(event){
                vm.usedLoc.position.cur = event.latlng;
                vm.usedLoc.position.pre = $.extend(true, {}, event.latlng);
                vm.pharAround();
                map.removeLayer(vm.locMarker);
                vm.locMarker = L.marker(event.latlng);
                map.addLayer(vm.locMarker);
            });
            map.once('locationerror', function(){
                if (vm.usedLoc.position.pre.lat) {
                    alert('無法順利取得您現在的位置，將使用舊定位');
                    vm.usedLoc.position.cur = $.extend({}, vm.usedLoc.position.pre);
                    vm.pharAround();
                    map.removeLayer(vm.locMarker);
                    vm.locMarker = L.marker(vm.usedLoc.position.cur);
                    map.addLayer(vm.locMarker);
                } else {
                    alert('無法定位，請允許存取位置或稍後重試');
                }
            });
            map.locate({setView: true});
        },
        findAround: function() {
            if (this.appControl.mode == 'search') {
                map.removeLayer(this.locMarker);
                this.getGPS();
                this.appControl.mode = 'gps';
                this.appControl.page = 'main';
            }
        },
        pharAround: function (){
            var vm = this;
            this.appControl.chosen = this.pharData.pharmacies.filter( (item) => {
                let pharLoc = {lat: item.geometry.coordinates[1], lng:item.geometry.coordinates[0]};
                return map.distance(vm.usedLoc.position.cur, pharLoc) < 5000;
            });
        },
        drawSpots: function(arr) {
            let vm = this;
            arr.forEach(item => {
                let name = item.properties.name;
                let quan = [item.properties.mask_adult, item.properties.mask_child];
                let pharLoc = {lat: item.geometry.coordinates[1], lng:item.geometry.coordinates[0]};
                let specMask = vm.appControl.category == 'adult' ? quan[0] : quan[1];
                let tag;
                if (specMask > 100) {tag = greenIcon;} 
                else if (specMask > 50) {tag = orangeIcon}
                else if (specMask > 0) {tag = redIcon}
                else {tag = blackIcon}
                let markerLayer = L.marker(pharLoc, {icon: tag});
                markers.addLayer(markerLayer.bindPopup(`
                    <h6 class="text-center">${name}</h5>
                    <ul class="d-flex mask-popup list-unstyled mb-2">
                        <li class="${vm.classify(quan[0])} rounded border-0 mr-1 py-1 px-1 w-50 text-center h5">${quan[0]}</li>
                        <li class="${vm.classify(quan[1])} rounded border-0 py-1 px-1 w-50 text-center h5">${quan[1]}</li>
                    </ul>
                    <dl class="row no-gutters info-popup mb-2">
                        <dt class="col-3 text-secondary">口罩</dt>
                        <dd class="col-9">${item.properties.note}</dd>
                        <dt class="col-3 text-secondary">備註</dt>
                        <dd class="col-9">${item.properties.custom_note}</dd>
                    </dl>
                    <div class="d-flex w-100">
                        <a class="flex-grow-1 text-primary text-center mr-1" href="https://www.google.com/maps/search/?api=1&query=${item.properties.name}+${item.properties.address}" target="_blank">
                            <i class="fas fa-clock"></i>
                            營業時間
                        </a>
                        <a class="flex-grow-1 text-primary text-center" href="tel:${item.properties.phone}" class="text-secondary">
                            <i class="fas fa-phone"></i>
                            打電話
                        </a>
                    </div>
                    `
                ));
                vm.$set(item, 'layerId', markers.getLayerId(markerLayer));
            });
            map.addLayer(markers);
        },
        centering: function(item) {
            map.flyTo({
                lat: item.geometry.coordinates[1],
                lng: item.geometry.coordinates[0]
            }, 18);
            map.once('moveend', () => {
                markers.getLayer(item.layerId).openPopup();
            })
        },
        search: function(keyword) {
            if (keyword !== '') {
                let xml = new XMLHttpRequest();
                let searchAdd = `https://nominatim.openstreetmap.org/search?q=${keyword}&format=geojson`;
                let cor;
                let vm = this;
                let searched = [];

                vm.usedLoc.searchLoc.forEach(function(item) {
                    searched.push(item.name);
                })
                xml.open('get', searchAdd);
                xml.send();
                xml.onload = function (){
                    cor = JSON.parse(this.responseText).features[0].geometry.coordinates;
                    map.setView([cor[1], cor[0]], 16);
                    vm.usedLoc.position.cur = {
                        lat: cor[1],
                        lng: cor[0]
                    };
                    vm.pharAround();
                    map.removeLayer(vm.locMarker);
                    vm.locMarker = L.marker(vm.usedLoc.position.cur);
                    map.addLayer(vm.locMarker);
                    if (vm.appControl.mode == 'gps') {
                        map.stopLocate();
                        vm.appControl.mode = 'search';
                    }
                    if (vm.appControl.chosen.length !== 0 && !searched.includes(keyword)) {
                        vm.usedLoc.searchLoc.push({
                            name: keyword,
                            coordinates: {
                                lat: cor[1],
                                lng: cor[0]
                            }
                        });
                        vm.appControl.searchText.pre = keyword;
                        vm.appControl.page = 'main';
                    } else if (searched.includes(keyword)) {
                        vm.appControl.searchText.pre = keyword;
                        vm.appControl.page = 'main';
                    }
                    else if (vm.appControl.chosen.length == 0) {
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
        searchRecord: function(record) {
            this.usedLoc.position.cur = record.coordinates;
            map.setView(record.coordinates);
            this.pharAround();
            this.appControl.searchText.pre = record.name;
            map.removeLayer(this.locMarker);
            this.locMarker = L.marker(this.usedLoc.position.cur);
            map.addLayer(this.locMarker);
            this.appControl.mode = 'search';
            this.appControl.page = 'main';
        },
        // functions for internal use
        classify: function(mask_quan) {
            if (mask_quan == 0) {return 'out-of-stock';}
            else if (mask_quan > 0 && mask_quan <= 100) {return 'short-supply';}
            else if (mask_quan > 100) {return 'in-stock';}
        },
        merit: function(item1, item2) {
            switch (this.appControl.category) {
                case 'distance':
                    let itemCor1 = [item1.geometry.coordinates[1], item1.geometry.coordinates[0]];
                    let itemCor2 = [item2.geometry.coordinates[1], item2.geometry.coordinates[0]];
                    return -(map.distance(itemCor1, this.usedLoc.position.cur) - map.distance(itemCor2, this.usedLoc.position.cur));
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
            this.appControl.weekDay = new Date(time).getDay();
        }
    },
    computed: {
        listPhar: function() {
            if (this.appControl.chosen.length !== 0) {
                if (this.appControl.itemNum > this.appControl.chosen.length) {this.appControl.itemNum = this.appControl.chosen.length;}
                this.appControl.chosen = this.quickSort(this.appControl.chosen, 0, this.appControl.chosen.length-1);
                return this.appControl.chosen.slice(0, this.appControl.itemNum);
            }
        },
        numPhar: function() {
            return this.appControl.chosen.length - this.appControl.itemNum;
        },
        avaliableDay: function() {
            if (this.appControl.weekDay == 0) {
                return '都能買';
            } else if (this.appControl.weekDay%2 == 0) {
                return '偶數';
            } else {
                return '奇數';
            }
        },
    },
    watch: {
        'appControl.dataState': function(cur) {
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