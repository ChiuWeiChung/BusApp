'use strict';
//==========models==========
import Bus from './models/Bus';
import Map from './models/Map';
//==========views==========
import * as infoView from './views/infoView';



const form = document.querySelector('form');
const busInput = document.querySelector('.bus-input');



class App {
    constructor() {
        this.googleMap;
        this.busSearch = [];
        this.checkDirection = 'forward';
        this._renderMap.call(this);  // Render Google Map
        form.addEventListener('submit', this._newBus.bind(this));

    }

    async _newBus(e) {
        e.preventDefault();
        this.checkDirection = 'forward';
        let bus;
        const busNumber = busInput.value;
        bus = new Bus(busNumber);
        const dataFetchAll = await bus._getData();
        // Remove existed information column
        infoView.infoClear();
        // Render error message if fetch process is failed
        if (!dataFetchAll[0] || !dataFetchAll[1]) {
            console.log(`Data can't be found`);
            infoView.renderError('showError');
            this.googleMap._deleteMarkers(this.googleMap.busMarkers, this.googleMap.stopMarkers);
        } else {
            // ======= build up the database =======
            const busData = {
                location: { forward: dataFetchAll[0].filter(el => el.direction === 0), backward: dataFetchAll[0].filter(el => el.direction === 1) },
                nearbyStop: this._checkBusNearby(dataFetchAll[1]),
                estimatedTime: { forward: dataFetchAll[2].filter(el => el.direction === 0), backward: dataFetchAll[2].filter(el => el.direction === 1) },
                stopSequence: dataFetchAll[3]
            };
            window.busData = busData;
            this.busSearch = busData;

            // ======= Information column section =======
            infoView.renderInfo(busData);
            infoView.renderError();
            // Check the bus route has round-trip or not
            infoView.isOneWay(busData.stopSequence[1]);
            // add event handler on direction button
            document.querySelector('.bus-info').addEventListener('click', this._directionBtnHandler.bind(this));

            // ========== Google Map Section ==========
            // Remove existed old markers and render new markers
            this.googleMap._deleteMarkers(this.googleMap.busMarkers, this.googleMap.stopMarkers);
            this.googleMap._renderMarkersAni(busData.location[this.checkDirection]);   // Render Bus location on Google Map Api
            const stopData = busData.stopSequence.find(el => el.direction === this.checkDirection);
            await this.googleMap._renderBusStop(stopData);
            // add event handler on station-status button
            this._statusClicker();

        }
    }



    _statusClicker() {
        // console.log(this);
        let that = this;
        const busStatusElement = [...document.querySelectorAll('.station-status')];

        // attach event listener to stopName element
        const stopNameElement = busStatusElement.map(el => el.previousElementSibling);
        const stopSequenceArr = this.busSearch.stopSequence.find(el => el.direction === this.checkDirection);
        stopSequenceArr.stopName.forEach(el => {
            let location = { lat: el.busLocation.PositionLat, lng: el.busLocation.PositionLon };
            stopNameElement[el.sequence - 1].addEventListener('click', (e) => {
                this.googleMap._zoomMarkers(location);
                this.googleMap.stopInfoWindow[el.sequence - 1].open(map, this.googleMap.stopMarkers[el.sequence - 1])
            })
        })
        // console.log(this.googleMap.stopMarkers);
        console.log(this.googleMap.stopInfoWindow);

        // attach event listner to plateNumber element
        const hasBusArr = this.busSearch.nearbyStop[this.checkDirection].map(el => el.stopSequence);
        hasBusArr.forEach(el => {
            busStatusElement[el - 1].classList.add('btn', 'btn-info');
            busStatusElement[el - 1].addEventListener('click', function () {
                const plateNum = this.textContent.split(" ").find(el => el.length > 2);
                const target = that.busSearch.location[that.checkDirection].find(item => item.plateNumber === plateNum);
                if (target) {
                    that.googleMap._zoomMarkers(target.location);
                }
            })

        })
    }

    _directionBtnHandler(e) {
        let initialSign = this.checkDirection;
        if (e.target.className.includes('btn-secondary')) {
            infoView.changeStyle(e);
            this.checkDirection = e.target.dataset.direction === 'go' ? 'forward' : 'backward';
            if (initialSign === this.checkDirection) return
            // Remove existed bus item in previous direction infomation and add new bus item
            infoView.deleteBusItem();
            infoView.addBusItem(this.busSearch, this.checkDirection);
            this._statusClicker();
            // Remove existed old markers and render new markers
            this.googleMap._deleteMarkers(this.googleMap.busMarkers, this.googleMap.stopMarkers);
            this.googleMap._renderMarkersAni(this.busSearch.location[this.checkDirection]);
            // console.log(this.busSearch.stopSequence[1])
            const stopData = busData.stopSequence.find(el => el.direction === this.checkDirection);
            this.googleMap._renderBusStop(stopData);
        }
    }

    _checkBusNearby(isNearby) {
        if (!isNearby) {
            return { forward: [], backward: [] }
        }
        return {
            forward: isNearby.filter(el => el.direction === 0),
            backward: isNearby.filter(el => el.direction === 1)
        };
    }


    _renderMap() {
        const that = this;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                let currentPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
                that.currentPosition = currentPosition;
                let googleMap;
                googleMap = new Map(currentPosition);
                that.googleMap = googleMap;
            })
        }
    }

}
const app = new App();
window.app = app;


