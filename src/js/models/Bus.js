import jsSHA from 'jssha';
import axios from "axios";
import { busKey } from "./key";



class Bus {
    constructor(busNum,region) {
        this.busNum = busNum.trim();
        this.region = region
    }

    _getAuthorizationHeader() {

        var GMTString = new Date().toGMTString();
        var ShaObj = new jsSHA('SHA-1', 'TEXT');
        ShaObj.setHMACKey(busKey.AppKey, 'TEXT');
        ShaObj.update('x-date: ' + GMTString);
        var HMAC = ShaObj.getHMAC('B64');
        var Authorization = 'hmac username=\"' + busKey.AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';

        return { 'Authorization': Authorization, 'X-Date': GMTString };
    }

    _getData() {
        return Promise.all([this._fetchLocation(), this._fetchNearStop(), this._fetchEstimatedTime(), this._fetchStopRoute()]);
    }


    _fetchLocation() {
        return new Promise((resolve, reject) => {
            axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeByFrequency/City/${this.region}/${this.busNum}?$format=JSON`, {
                headers: this._getAuthorizationHeader(),
                params: {
                    "$top": 30,
                    "$filter": `RouteID eq '${this.routeID}'`
                }
            }).then(res => {
                if (res.data.length === 0) resolve(false);
                const dataFilter = res.data.filter((item) => item.RouteName.Zh_tw === this.busNum);
                const dataArr = res.data.map(el => {
                    return {
                        location: { lat: el.BusPosition.PositionLat, lng: el.BusPosition.PositionLon },
                        direction: el.Direction,
                        plateNumber: el.PlateNumb,
                        routeId: el.RouteID,
                    }
                })
                this.busData = dataArr;
                resolve(dataArr);
            }).catch(err => {
                reject(err);
            })
        })
    }

    _fetchNearStop() {
        return new Promise((resolve, reject) => {
            axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeNearStop/City/${this.region}/${this.busNum}?$format=JSON`, {
                headers: this._getAuthorizationHeader(),
                params: {
                    "$top": 30,
                    "$filter": `RouteID eq '${this.routeID}'`
                }
            }).then(res => {
                if (res.data.length === 0) resolve(false);
                const dataFilter = res.data.filter((item) => item.RouteName.Zh_tw === this.busNum);
                const dataNearStop = dataFilter.map(el => {
                    return {
                        plateNumber: el.PlateNumb,
                        direction: el.Direction,
                        isGetIn: el.A2EventType === 1 ? true : false,
                        stopName: el.StopName.Zh_tw,
                        stopSequence: el.StopSequence
                    }
                })
                resolve(dataNearStop);
            }).catch(err => {
                reject(err);
            })
        })
    }

    _fetchEstimatedTime() {
        return new Promise((resolve, reject) => {
            axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/${this.region}/${this.busNum}?$format=JSON`, {
                headers: this._getAuthorizationHeader(),
                params: {
                    "$top": "200",
                    "$filter": `RouteID eq '${this.routeID}'`,
                }
            }).then(res => {
                if (res.data.length === 0) resolve(false);
                const dataFilter = res.data.filter((item) => item.RouteName.Zh_tw === this.busNum);
                const timeData = dataFilter.map(el => {
                    return {
                        estimatedTime: el.EstimateTime === undefined ? null : Math.round(el.EstimateTime / 60),
                        stopId: el.StopID,
                        stopName: el.StopName.Zh_tw,
                        direction: el.Direction,
                    }
                })
                resolve(timeData);
            }).catch(err => {
                reject(err);
            })
        })

    }

    _fetchStopRoute() {
        return new Promise((resolve, reject) => {
            axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${this.region}/${this.busNum}?$format=JSON`, {
                headers: this._getAuthorizationHeader(),
                params: {
                    "$top": 30,
                    "$filter": `RouteID eq '${this.routeID}'`
                }
            }).then(res => {
                if (res.data.length === 0) resolve(false);
                // console.log(res);

                let dataFilter;
                if (res.data.length === 1) {
                    dataFilter = res.data
                } else if (res.data.length === 2) {
                    dataFilter = res.data.filter((item) => item.RouteName.Zh_tw === this.busNum).slice(0, 2);
                } else if (res.data.length > 3) {
                    dataFilter = res.data.filter((item) => item.RouteName.Zh_tw === this.busNum).slice(2, 4);
                }

                const forward = {};
                const backward = {};
                dataFilter.forEach(el => {
                    if (el.Direction === 0) {
                        forward.direction = 'forward';
                        forward.stopName = el.Stops.map(el => {
                            return { stopId: el.StopID, sequence: el.StopSequence, name: el.StopName.Zh_tw, busLocation: el.StopPosition };
                        });
                    } else {
                        backward.direction = 'backward';
                        backward.stopName = el.Stops.map(el => {
                            return { stopId: el.StopID, sequence: el.StopSequence, name: el.StopName.Zh_tw, busLocation: el.StopPosition };
                        });
                    }
                })
                resolve([forward, backward]);
            }).catch(err => {
                reject(err);
            })
        })

    }

    _getRouteID(id) {
        return new Promise((resolve, reject) => {
            axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${this.region}/${this.busNum}?$format=JSON`, {
                headers: this._getAuthorizationHeader(),
                params: {
                    "$top": 20
                }
            }).then(res => {
                if (res.data.length === 0) resolve(false);
                // console.log(res.data);                
                const busData = res.data.find(el => {
                    return el.RouteName.Zh_tw === this.busNum.trim()
                });
                if(!busData) resolve(false);
                this.routeID = busData.RouteID;
                resolve({ departure: busData.DepartureStopNameZh, destination: busData.DestinationStopNameZh });
                // resolve(busData);
            }).catch(err => {
                reject(err);
            })
        })
    }



}

export default Bus;