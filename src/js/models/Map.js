import { Loader } from '@googlemaps/js-api-loader';
import { mapKey } from "./key";

const loader = new Loader(mapKey);

class Map {
    constructor(curpos) {
        this.busItem = [];
        this._loadMap.call(this, curpos);
    }

    _loadMap(currentPosition) {
        let map;
        const that = this;
        loader.load().then(() => {
            // const coord = { lat: 25.0485, lng: 121.5173 } // Taipei Train Station
            map = new google.maps.Map(document.getElementById("map"), {
                center: currentPosition,
                zoom: 13,
            });
            const centerMarker = new google.maps.Marker({
                position: currentPosition,
                label: "現在位置",
                animation: google.maps.Animation.DROP,
                map: map,
            });
            centerMarker.addListener('click', this._toggleBounce);
            that.map = map;
        });
    }

    _toggleBounce() {
        if (this.getAnimation() !== null) {
            this.setAnimation(null);
        } else {
            this.setAnimation(google.maps.Animation.BOUNCE);
        }
    }

    _renderMarkersAni(data, direction) {
        // const that = this;
        loader.load().then(() => {
            const busMarkers = data.map(el => {    // Set bus location at google map as marker
                return new google.maps.Marker({
                    position: el.location,
                    animation: google.maps.Animation.DROP,
                    map: this.map,
                    icon: './img/for-bus.png'
                })
            });

            const infowindow = data.map(el => {   // Render Infomartion at each marker
                return new google.maps.InfoWindow({
                    content: `<div>${el.plateNumber}<div>`
                })
            });

            busMarkers.forEach((el, index) => {
                el.addListener("click", () => {
                    infowindow[index].open(map, el)
                })
                infowindow[index].open(map, el)
            });

            this.busMarkers = busMarkers;

        })
    }


    _deleteMarkers(busMarkers, stopMarkers) {
        loader.load().then(() => {
            if (busMarkers) {
                busMarkers.forEach(el => {
                    el.setMap(null);
                })
            }

            if (stopMarkers) {
                stopMarkers.forEach(el => {
                    el.setMap(null);
                })
            }
        })

    }

    _zoomMarkers(location) {
        this.map.setCenter(location);
        this.map.setZoom(15);
    }

    _renderBusStop(data) {
        loader.load().then(() => {
            const stopMarkers = data.stopName.map(el => {    // Set bus location at google map as marker
                return new google.maps.Marker({
                    position: { lat: el.busLocation.PositionLat, lng: el.busLocation.PositionLon },
                    animation: google.maps.Animation.DROP,
                    map: this.map,
                    icon: './img/bus-stop.png'
                })
            });
            this.stopMarkers = stopMarkers;
            const infowindow = data.stopName.map(el => {
                return new google.maps.InfoWindow({
                    content: `<div>${el.name}<div>`
                })
            });
            this.stopInfoWindow = infowindow;
            stopMarkers.forEach((el, index) => {
                el.addListener("click", () => {
                    infowindow[index].open(map, el)
                })
            });


        })
    }



    _addInfo(data, markers) {
        const infowindow = data.map(el => {   // Render Infomartion at each marker
            return new google.maps.InfoWindow({
                content: `<div>${el.plateNumber}<div>`
            })
        });

        infowindow
        // markers.forEach((el, index) => {
        //     el.addListener("click", () => {
        //         infowindow[index].open(map, el)
        //     })
        //     infowindow[index].open(map, el)
        // });
    }
}



// function toggleBounce() {
//     if (this.getAnimation() !== null) {
//         this.setAnimation(null);
//     } else {
//         this.setAnimation(google.maps.Animation.BOUNCE);
//     }
// }


export default Map;
