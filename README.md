# 我的Portfolio-公車動態資訊查詢APP

## [公車動態資訊查詢APP](http://chiuweichung.github.io/BusApp)

* 使用 Vanilla JS 實作 MVC 架構
* 使用 Bootstrap 進行網頁布局
* Axios 串接交通部 [PTX API](https://ptx.transportdata.tw/MOTC) 以及 [Google Maps API](https://developers.google.com/maps/documentation/javascript/overview)
* 以 Webpack 進行前端打包

![bus-app-illustration](https://github.com/ChiuWeiChung/IMGTANK/blob/main/portfolio/bus-app/bus-app-illustration.gif?raw=true)

 這次的專案主要起源於本身是個搭公車的通勤族，上下班前都需要查詢公車的動態，所以才決定自己也來開發一個App，主要也是想檢視自己學習到目前內化了多少，算是一個小小成果。

## PTX Open API 以及 Google Maps API
 在這個App中，串接了兩個 API，一個是交通部 [PTX API](https://ptx.transportdata.tw/MOTC)，另一個是 [Google Maps API](https://developers.google.com/maps/documentation/javascript/overview)，首先會透過 PTX API 得到該公車的資訊(停靠站、公車位置、抵達時間...)，再將該公車以及站牌的位置渲染在 Google Map 上面。


## 心得
 在開發這個專案的過程中，除了審視對於 JavaScript 有多少了解以外，還可以訓練自己耐心地熟讀 API 說明書內有關 Library 的使用方法，未來可能會繼續接觸不同的 API ，並且累積閱讀文件的能力，以後在接觸陌生的框架或是 API 時比較可以在短時間內上手。
