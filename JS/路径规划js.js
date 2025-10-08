async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// steps转换为坐标点位
function parseStepsToCoords(steps) {
    let coords = [];
    let distances = [];

    steps.forEach(step => {
        let stepCoords = step.polyline.split(";").map(item => {
            const [lng, lat] = item.split(",").map(Number);
            return ol.proj.fromLonLat([lng, lat]);
            // return [lng, lat];
        })
        coords.push(...stepCoords);
        distances.push(step.step_distance);
    });

    return {coords, distances}; // 返回一个对象，包含两个数组
}

// 数据清洗，去除重复点位
function removeConsecutiveDuplicateCoords(arr) {
    return arr.filter((item, i) => {
        if (i === 0) return true; // 第一个点保留
        const prev = arr[i - 1];
        // 如果 x 和 y 都相等，则认为重复
        return item[0] !== prev[0] || item[1] !== prev[1];
    });
}
function addIconsAlongLine(coords, vectorSource, stepMeters = 100) {
    let distanceSinceLastIcon = 0;

    for (let i = 0; i < coords.length - 1; i++) {
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const segmentLength = Math.sqrt(dx*dx + dy*dy);

        let segmentStart = 0;

        while (distanceSinceLastIcon + segmentLength - segmentStart >= stepMeters) {
            const ratio = (stepMeters - distanceSinceLastIcon + segmentStart) / segmentLength;
            const x = p1[0] + dx * ratio;
            const y = p1[1] + dy * ratio;

            const iconFeature = new ol.Feature({
                geometry: new ol.geom.Point([x, y])
            });
            iconFeature.setStyle(new ol.style.Style({
                image: new ol.style.Icon({
                    src: '/imgs/箭头.png',
                    scale: 0.3,
                    rotation: Math.atan2(dx, dy)  // 箭头朝向线段方向
                })
            }));
            vectorSource.addFeature(iconFeature);

            segmentStart += (stepMeters - distanceSinceLastIcon);
            distanceSinceLastIcon = 0;
        }

        distanceSinceLastIcon += segmentLength - segmentStart;
    }
}
let routeLayer = null;
function drawRoute(steps) {
    
    if (routeLayer) {
    map.removeLayer(routeLayer);
    routeLayer = null;
    }

    let { coords, distances } = parseStepsToCoords(steps);
    // console.log('coords', coords)
    coords = removeConsecutiveDuplicateCoords(coords)
    console.log('coords', coords)
    // console.log('distances', distances)

    // 路线 source
    let vectorSource = new ol.source.Vector();
    // console.log('vectorSource', vectorSource.getFeatures())

    const routeFeature = new ol.Feature({
        geometry: new ol.geom.LineString(coords)
    });
    // 路线样式（虚线）
    routeFeature.setStyle(new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgb(71, 137, 227)',
            width: 10,
            // lineDash: [10, 10]  // [虚线长度, 空隙长度]
        })
    }));
    vectorSource.addFeature(routeFeature);
    // console.log('vectorSource', vectorSource.getFeatures())

    addIconsAlongLine(coords, vectorSource, 1000);
    // console.log('vectorSource', vectorSource.getFeatures())

    // 图层
    routeLayer = new ol.layer.Vector({
        source: vectorSource
    });

    map.addLayer(routeLayer);

    // 缩放地图到路线范围
    map.getView().fit(vectorSource.getExtent(), { padding: [50,50,50,50], duration: 1500 });
}


// 获得标准市的名字
async function get_formal_city(go_city) {
    // 调用高德地理编码 API
    const response = await fetch(`https://restapi.amap.com/v3/geocode/geo?key=a0d13d2c33bb676e758d9e83e6a5148c&address=${go_city}&output=JSON`);
    const data = await response.json();

    // console.log('查询go_city', data.geocodes[0].city);

    let formal_city = data.geocodes[0].city;
    return formal_city; // 这里返回值能传递出去
}

// 获得经纬度
async function getLocation(point, go_city) {
    console.log('point', point);
    console.log('go_city', go_city);
    // const point_val = name.value;

    if (!point) {
        console.log('没有输入位置！');
        mapLoading.style.display = 'none'; // 关闭图层
        alert("未找到该区域");
        return Promise.reject('没有输入位置'); // 如果没有输入，直接 reject
    };
    // 调用高德地理编码 API
    let url = `https://restapi.amap.com/v3/geocode/geo?key=a0d13d2c33bb676e758d9e83e6a5148c&address=${encodeURIComponent(point)}&output=JSON`;
    
    // 如果输入去的城市，查询结果更精准
    if (go_city) {
        let formal_city = await get_formal_city(go_city);
        url += `&city=${formal_city}`;
    }
    // console.log(url);
    return fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log('点位信息', data);
        if (data.geocodes && data.geocodes.length > 0) {
            const location = data.geocodes[0].location; // "lng,lat"
            console.log('get_location返回结果', location);
            // console.log(location);
            let lng = parseFloat(location.split(",")[0]);
            // console.log(lng);
            let lat = parseFloat(location.split(",")[1]);
            return [lng, lat];  // [lng,lat]

        } else {
        mapLoading.style.display = 'none'; // 关闭图层
        alert('未找到位置: ' + point)
        throw new Error('未找到位置: ' + point);
        }
    })
    .catch(err => {
            console.error(err);
            throw err; // 抛出错误，保证 Promise 链不会中断
        }); 
}


