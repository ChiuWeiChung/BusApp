'use strict';
//==========models==========
import Bus from './models/Bus';
import Map from './models/Map';
//==========views==========
import * as infoView from './views/infoView';



const form = document.querySelector('form');
const regionSelector = document.querySelector('select');
const busInput = document.querySelector('.bus-input');
const searchBtn = document.querySelector('.search-btn');



class App {
    constructor() {
        this.googleMap;
        this.busSearch = {};
        this.region;
        this.busNumber;
        this.depAndDes;
        this.checkDirection = 'forward';
        this._renderMap.call(this);  // Render Google Map
        form.addEventListener('submit', this._newBus.bind(this));
        searchBtn.addEventListener('click', infoView.renderToggler);
    }

    async _newBus(e) {
        e.preventDefault();
        this.checkDirection = 'forward';
        let bus;
        const region = regionSelector.value;
        const busNumber = busInput.value.trim();
        this.region = region;
        this.busNumber = busNumber;
        busInput.value = "";
        bus = new Bus(busNumber, region);

        // Remove existed information column and render loader for few seconds
        infoView.renderLoader();
        infoView.infoClear();
        await infoView.wait();

        //  Fetch Bus Information from BUS API
        this.depAndDes = await bus._getRouteID();
        if (!this.depAndDes) return this._errorHandler();
        const dataFetchAll = await bus._getData();

        if (!dataFetchAll[0] || !dataFetchAll[1]) { // Render error message if fetch process is failed
            this._errorHandler()
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
            infoView.removeLoader();
            infoView.renderInfo(busData, busNumber, this.depAndDes);
            infoView.renderError();
            // Check the bus route has round-trip or not
            infoView.isOneWay(busData.stopSequence[1]);
            // add event handler on direction button
            document.querySelector('.bus-info').addEventListener('click', this._directionBtnHandler.bind(this));
            // shrink the input form 
            infoView.renderToggler();
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
        const stopSequenceArr = this.busSearch.stopSequence.find(el => el.direction === this.checkDirection);
        stopSequenceArr.stopName.forEach(el => {
            const busItem = document.querySelector(`[data-id="${el.stopId}"]`).children;
            let location = { lat: el.busLocation.PositionLat, lng: el.busLocation.PositionLon };
            // attach event listener to stopName element
            busItem[0].addEventListener('click', () => {
                this.googleMap._zoomMarkers(location);
                const index = this.googleMap.stopInfoWindow.findIndex(item => item.content.includes(el.name));
                this.googleMap.stopInfoWindow[index].open(map, this.googleMap.stopMarkers[index]);
            })
            // attach event listner to plateNumber element
            const plateTarget = this.busSearch.location[this.checkDirection].find(item => item.plateNumber === busItem[1].textContent.trim());
            if (plateTarget) {
                busItem[1].classList.add('btn', 'btn-info');
                busItem[1].addEventListener('click', () => {
                    this.googleMap._zoomMarkers(plateTarget.location);
                })
            }

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

    _errorHandler() {
        console.log(`Data can't be found`);
        infoView.removeLoader();
        infoView.renderError('showError');
        this.googleMap._deleteMarkers(this.googleMap.busMarkers, this.googleMap.stopMarkers);
    }

}
const app = new App();
window.app = app;


