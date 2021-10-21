
const inputColumn = document.querySelector('.input-column');

export function renderInfo(busData, busNum, depAndDes) {
    const html = `
    <div class="bus-info mt-1 text-light ">
        <div class="info text-left border-bottom ml-3 ">${busNum} 動態資訊</div>
        <div class="direction-btn d-flex mt-3">
            <div class="forward btn btn-primary direction clicked" data-direction='go'>去程 (往${depAndDes.destination})</div>
            <div class="backward btn btn-secondary direction" data-direction='back'>回程 (往${depAndDes.departure})</div>
        </div>
        <div class="bus-status mx-2 my-3 text-center">
            <div class=" title d-flex align-items-center d-flex justify-content-around ">
                <div class="station-info  col-sm-4 bg-light text-dark">
                    站名
                </div>
                <div class="station-info  col-sm-2 bg-light text-dark">
                    車號
                </div>
                <div class="station-info  col-sm-4 bg-light text-dark">
                    預計時間
                </div>
            </div>            
        </div>
    </div>
    `;
    inputColumn.insertAdjacentHTML('beforeend', html);

    addBusItem(busData, 'forward');
}

export function infoClear() {
    const busInfo = document.querySelector('.bus-info');
    if (busInfo) {
        inputColumn.removeChild(busInfo);
    }
}

// ======== correlation function ========

export function changeStyle(e) {
    e.target.classList.remove('btn-secondary');
    e.target.classList.add('btn-primary');
    e.target.classList.toggle('clicked')
    if (e.target.className.includes('forward')) {
        e.target.nextElementSibling.classList.remove('btn-primary');
        e.target.nextElementSibling.classList.add('btn-secondary');
        e.target.nextElementSibling.classList.toggle('clicked');
    } else {
        e.target.previousElementSibling.classList.remove('btn-primary');
        e.target.previousElementSibling.classList.add('btn-secondary');
        e.target.previousElementSibling.classList.toggle('clicked');
    }
};

export function addBusItem(data, direction = 'forward') {
    const sequence = data.stopSequence.find(el => el.direction === direction);

    sequence.stopName.forEach(el => {
        const markup = `
        <div class="bus-item d-flex align-items-center border-bottom my-2" data-id=${el.stopId}>
            <div class="station-name btn btn-light mr-2 my-1 text-dark col-sm-4 ">
                ${el.name}
            </div>
            <div class="station-status text-white my-1 col-sm-4 ">
                
            </div>
            <div class="bus-icon col-sm-4 ">

            </div>
        </div>
        `;
        document.querySelector('.bus-status').insertAdjacentHTML('beforeend', markup);
    });
    renderTimeAndPlateNumber(data.estimatedTime[direction], data.nearbyStop[direction]);
}

export function renderToggler() {
    const searchBtn = document.querySelector('.search-btn');
    searchBtn.classList.remove('d-none');
    const operator = searchBtn.textContent==="展開搜尋欄"?"收起搜尋欄":"展開搜尋欄";
    searchBtn.textContent= operator;
    
    document.querySelector('form').classList.toggle('show');
    document.querySelector('.bus-info').classList.toggle('extend');
}

export function renderLoader() {
    const markup = `
    <div class="loader text-center my-3">
        <img src="img/loading.png" alt="">
    </div>
    `;

    document.querySelector('form').insertAdjacentHTML('afterend', markup);
}

export function removeLoader() {
    document.querySelector('.loader').remove();
}

export function wait() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, 500)
    })
}

function renderTimeAndPlateNumber(estimatedTimeData, nearbyStopData) {
    // render estimated Time to info column
    estimatedTimeData.forEach(el => {
        const timeStatusElement = [...document.querySelector(`[data-id="${el.stopId}"]`).children][2];
        timeStatusElement.textContent += handleTime(el.estimatedTime);
    });

    // render PlateNumber to info column
    const plateNumberElement = [...document.querySelectorAll('.station-status')];
    plateNumberElement.forEach((el, index) => {
        if (nearbyStopData.length === 0) {
            return el.textContent = `尚未發車`
        };
        const data = nearbyStopData.find(item => item.stopSequence - 1 === index);
        if (data) {
            el.classList.add('btn', 'btn-info')
            el.textContent+= `${data.plateNumber}`;
            if (data.isGetIn) {
                el.nextElementSibling.textContent = "進站中";
            }

        }

    })
}

function handleTime(time) {
    if (!time) {
        return `----`
    } else if (time < 3) {
        return `即將到站`
    };
    return `預計${time}分鐘`;
}




export function deleteBusItem() {
    document.querySelectorAll('.bus-item').forEach(el => el.remove());
}

export function isOneWay(backward) {
    if (backward.direction === undefined) {
        document.querySelector('.backward').style.display = 'none';
        document.querySelector('.forward').style.width = "80%";
    }
}

export function renderError(str) {
    const errorInfo = document.querySelector('.error-info');
    if (str === 'showError') {
        errorInfo.classList.remove('d-none');
    } else {
        errorInfo.classList.add('d-none');
    }

}