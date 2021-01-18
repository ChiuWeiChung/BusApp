import { Loader } from '@googlemaps/js-api-loader';
import {mapKey} from "./key";

const loader = new Loader(mapKey);

class Map {
    constructor(curpos) {
        this.busItem = [];
        this._loadMap.call(this, curpos);
    }

    _loadMap(currentPosition) {
        let map;
        const that = this;
        // console.log(currentPosition);
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
            centerMarker.addListener('click', toggleBounce);
            that.map = map;
        });

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
        // console.log(data);
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

export default Map;

// function loadMap(curpos) {

//     loader.load().then(() => {
//         // const coord = { lat: 25.0485, lng: 121.5173 } // Taipei Train Station
//         map = new google.maps.Map(document.getElementById("map"), {
//             center: curpos,
//             zoom: 16,
//         });
//         const centerMarker = new google.maps.Marker({
//             position: curpos,
//             label: "現在位置",
//             animation: google.maps.Animation.DROP,
//             map: map,
//         });

//         // console.log(centerMarker);
//         centerMarker.addListener('click', toggleBounce)

//         // create multiple markers =========================
//         const locations = [
//             { lat: 25.032, lng: 121.565 },
//             { lat: 25.032, lng: 121.555 },
//             { lat: 25.032, lng: 121.545 },
//             { lat: 25.032, lng: 121.535 },
//             { lat: 25.032, lng: 121.525 },
//         ];

//         // Information window ============================
//         const htmlInfo = `
//     <div class="busInfo">
//         <div class="bus-number">
//             981
//         </div>
//         <div class="bus-status">
//             OK
//         </div>
//     </div>
//     `;
//         const infowindow = new google.maps.InfoWindow({
//             content: htmlInfo,
//         })

//         // ==============================Render Markers ==============================
//         renderMarkersAni(locations, infowindow)
//         // const markers = renderMarkers(locations);

//         // =====================Render Markers Polyline =====================

//         // const flightPath = new google.maps.Polyline({
//         //     path: locations,
//         //     geodesic: true,
//         //     strokeColor: "#FF0000",
//         //     strokeOpacity: 1.0,
//         //     strokeWeight: 2,
//         //     map
//         // });
//         // flightPath.setMap(map);

//         // console.log(markers);
//         // markers.forEach(el => {
//         //     // console.log(el);
//         //     el.addListener('click', () => {
//         //         infowindow.open(map, el)
//         //     })
//         // })

//         // ==============================Delete Markers =============================
//         // deleteMarkers(markers);
//         // console.log('markers deleted');

//     });
// }

//========================= function =========================
function renderMarkersAni(locations, infowindow) {
    let markers = [];
    for (let i = 0; i < locations.length; i++) {
        setTimeout(function () {
            let marker = new google.maps.Marker({
                position: locations[i],
                animation: google.maps.Animation.DROP,
                map,
                icon: './img/bus.png',
            });
            markers.push(marker);
            marker.addListener('click', function () {
                infowindow.open(map, marker);
                // toggleBounce.call(marker);
            })
        }, i * 100);

    }
    // console.log(markers);
    return markers;
}

// function renderMarkers(coordArr) {
//     const markers = coordArr.map((el, index) => {
//         return new google.maps.Marker({
//             position: el,
//             label: 'hi',
//             // map: map
//         })
//     })
//     markers.forEach(el => el.setMap(map));
//     return markers;
// };

function deleteMarkers(markers) {
    markers.forEach(el => {
        el.setMap(null);
    })
}



function toggleBounce() {
    if (this.getAnimation() !== null) {
        this.setAnimation(null);
    } else {
        this.setAnimation(google.maps.Animation.BOUNCE);
    }
}

// export default loadMap;