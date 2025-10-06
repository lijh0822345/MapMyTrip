console.log('引入 搜索热门景点js')

let hotspotLayer = null; // 全局变量保存当前显示的图层

async function fetchAllPois(city, type, maxPage = 1, pageSize = 20) {
  const key = 'a0d13d2c33bb676e758d9e83e6a5148c'; // 替换成你的key
  let allResults = [];

  for (let page = 1; page <= maxPage; page++) {
    const url = `https://restapi.amap.com/v5/place/text?key=${key}&city=${encodeURIComponent(city)}&types=${encodeURIComponent(type)}&page_size=${pageSize}&page_num=${page}&show_fields=business`;

    try {
      const resp = await fetch(url);
      const data = await resp.json();

      if (data.status !== "1") {
        console.error("请求失败：", data.info);
        break;
      }

      if (data.pois && data.pois.length > 0) {
        allResults = allResults.concat(data.pois);
      } else {
        break; // 没有更多数据，提前退出
      }
    } catch (e) {
      console.error("请求错误：", e);
      break;
    }
  }

  return allResults;
}

function showHotSpots(city) {
  // 移除上一次热点图层
  if (hotspotLayer) {
    map.removeLayer(hotspotLayer);
    hotspotLayer = null;
  }

    // 使用示例
    fetchAllPois(city, "风景名胜", 2, 20).then(results => {
    console.log("总共获取到的POI数量：", results.length);
    console.log(results);

    if (results && results.length > 0) {

        // 1️⃣ 按 rating 从高到低排序
        const sortedPois = results.sort((a, b) => {
            // 使用可选链(?.)和空值合并(??)来处理可能不存在 business 或 rating 的情况，避免程序出错
            const ratingA = parseFloat(a.business?.rating ?? 0);
            const ratingB = parseFloat(b.business?.rating ?? 0);

            // 对于降序（从高到低），用 b 的评分减去 a 的评分
            return ratingB - ratingA;
        });

        console.log('sortedPois', sortedPois);

        // 2️⃣ 只取前十个
        const top10Pois = sortedPois.slice(0, 15);

        // console.log(top10Pois);

        let features = [];

        top10Pois.forEach(poi => {
          const [lng, lat] = poi.location.split(',').map(Number); // ✅ 解析 location

          const feature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat])),
            type: 'hotspot_point',
            name: poi.name
          });

          feature.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
              src: '/imgs/热门景点.png', // 自定义图标
              scale: 0.8,
              anchor: [0.5, 1]
            }),
            text: new ol.style.Text({
              text: poi.name,
              offsetY: -25,
              font: '16px Arial',   // 👈 设置字体大小和字体
              fill: new ol.style.Fill({ color: 'black' }),
              stroke: new ol.style.Stroke({ color: 'white', width: 2 })
            })
          }));

          features.push(feature);
        });

        // 创建单一矢量源和图层
        let vectorSource = new ol.source.Vector({
          features: features
        });

        hotspotLayer = new ol.layer.Vector({
          source: vectorSource
        });

        map.addLayer(hotspotLayer);
      }
    });
}

function filterStationsByTypecode(pois, typecode) {
    return pois.filter(poi => poi.typecode === typecode);
}
let buspotLayer = null; // 全局变量保存当前显示的图层
let railwaypotLayer = null; // 全局变量保存当前显示的图层
let airplanepotLayer = null; // 全局变量保存当前显示的图层
function show_transports(city, typecode) {
    if (typecode === '150400') {
        // 移除上一次热点图层
        if (buspotLayer) {
            map.removeLayer(buspotLayer);
            buspotLayer = null;
        }
    } else if (typecode === '150200') {
        // 移除上一次热点图层
        if (railwaypotLayer) {
            map.removeLayer(railwaypotLayer);
            railwaypotLayer = null;
        }
    } else if (typecode === '150104') {
        // 移除上一次热点图层
        if (airplanepotLayer) {
            map.removeLayer(airplanepotLayer);
            airplanepotLayer = null;
        }
    }
  
    // 使用示例
    fetchAllPois(city, typecode, 1, 10).then(results => {
    // let stations = filterStations(results);
    console.log("总共获取到的POI数量：", results.length);
    console.log(results);
    let filteded_results = filterStationsByTypecode(results, typecode);
    console.log("总共获取到的POI数量：", filteded_results.length);
    console.log(filteded_results);

    if (filteded_results && filteded_results.length > 0) {

        let features = [];

        filteded_results.forEach(poi => {
          const [lng, lat] = poi.location.split(',').map(Number); // ✅ 解析 location

          const feature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat])),
            type: 'hotspot_point',
            name: poi.name
          });

          const typeIconMap = {
            '150400': '/imgs/长途汽车站.png',
            '150200': '/imgs/火车站.png',
            '150104': '/imgs/飞机场.png'
          };

          feature.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
              src: typeIconMap[typecode], // 自定义图标
              scale: 0.8,
              anchor: [0.5, 1]
            }),
            text: new ol.style.Text({
              text: poi.name,
              offsetY: -25,
              font: '16px Arial',   // 👈 设置字体大小和字体
              fill: new ol.style.Fill({ color: 'black' }),
              stroke: new ol.style.Stroke({ color: 'white', width: 2 })
            })
          }));

          features.push(feature);
        });

        // 创建单一矢量源和图层
        let vectorSource = new ol.source.Vector({
          features: features
        });

        if (typecode === '150400') {
            buspotLayer = new ol.layer.Vector({
                source: vectorSource
            });
            map.addLayer(buspotLayer);
        } else if (typecode === '150200') {
            railwaypotLayer = new ol.layer.Vector({
                source: vectorSource
            });
            map.addLayer(railwaypotLayer);
        } else if (typecode === '150104') {
            airplanepotLayer = new ol.layer.Vector({
                source: vectorSource
            });
            map.addLayer(airplanepotLayer);
        }
        // buspotLayer = new ol.layer.Vector({
        //   source: vectorSource
        // });

        // map.addLayer(buspotLayer);
      }
    });
}

function closeHotSpots() {
  // 移除上一次热点图层
  if (hotspotLayer) {
    map.removeLayer(hotspotLayer);
    hotspotLayer = null;
  }
}

function close_transports_layer(typecode) {
  if (typecode === '150400') {
        // 移除上一次热点图层
        if (buspotLayer) {
            map.removeLayer(buspotLayer);
            buspotLayer = null;
        }
    } else if (typecode === '150200') {
        // 移除上一次热点图层
        if (railwaypotLayer) {
            map.removeLayer(railwaypotLayer);
            railwaypotLayer = null;
        }
    } else if (typecode === '150104') {
        // 移除上一次热点图层
        if (airplanepotLayer) {
            map.removeLayer(airplanepotLayer);
            airplanepotLayer = null;
        }
    }
}
