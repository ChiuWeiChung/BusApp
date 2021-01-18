import jsSHA from 'jssha';
import axios from "axios";
import {busKey} from "./key";



class Bus {
    constructor(busNum) {
        // this.busData=[];
        // this._getData.call(this, busNum);
        this.busNum = busNum;
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
            axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeByFrequency/City/NewTaipei/${this.busNum}?$format=JSON`, {
                headers: this._getAuthorizationHeader(),
                params: {
                    "$top": 10,
                }
            }).then(res => {
                if (res.data.length === 0) resolve(false);
                // console.log(res.data);
                const dataArr = res.data.map(el => {
                    return {
                        location: { lat: el.BusPosition.PositionLat, lng: el.BusPosition.PositionLon },
                        direction: el.Direction,
                        plateNumber: el.PlateNumb
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
            axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeNearStop/City/NewTaipei/${this.busNum}?$format=JSON`, {
                headers: this._getAuthorizationHeader(),
                params: {
                    "$top": 10,
                }
            }).then(res => {
                if (res.data.length === 0) resolve(false);
                // console.log(res.data);
                const dataNearStop = res.data.map(el => {
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
            axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/NewTaipei/${this.busNum}?$format=JSON`, {
                headers: this._getAuthorizationHeader(),
                params: {
                    "$top": 120,
                }
            }).then(res => {
                if (res.data.length === 0) resolve(false);
                const timeData = res.data.map(el => {
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
            axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/NewTaipei/${this.busNum}?$format=JSON`, {
                headers: this._getAuthorizationHeader(),
                params: {
                    "$top": 10,
                }
            }).then(res => {
                if (res.data.length === 0) resolve(false);
                // console.log(res.data);
                const forward = {};
                const backward = {};
                res.data.forEach(el => {
                    if (el.Direction === 0) {
                        forward.direction = 'forward';
                        forward.stopName = el.Stops.map(el => {
                            return { stopId: el.StopID, sequence: el.StopSequence, name: el.StopName.Zh_tw, busLocation:el.StopPosition };
                        });
                    } else {
                        backward.direction = 'backward';
                        backward.stopName = el.Stops.map(el => {
                            return { stopId: el.StopID, sequence: el.StopSequence, name: el.StopName.Zh_tw, busLocation:el.StopPosition };
                        });
                    }
                })
                resolve([forward, backward]);
            }).catch(err => {
                reject(err);
            })
        })

    }



}

export default Bus;