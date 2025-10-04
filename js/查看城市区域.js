console.log('引入查看城市区域js')

let city_polygon = null; // 全局变量保存当前显示的图层

// 添加定位点标记
function addPointMarker(lng, lat) {
    // 移除上一次图层
  if (city_polygon) {
    map.removeLayer(city_polygon);
    city_polygon = null;
  }

  const feature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat]))
  });

  const vectorSource = new ol.source.Vector({
    features: [feature]
  });

  city_polygon = new ol.layer.Vector({
    source: vectorSource,
    style: new ol.style.Style({
    image: new ol.style.Icon({
      src: '/imgs/point_marker.png',   // 自定义图标路径
      scale: 0.2,           // 图标缩放比例，可调大小
      anchor: [0.5, 1]    // 设置图片位置偏移
    })
  })
  });

  map.addLayer(city_polygon);

  // 自动缩放视图到点或要素范围
  map.getView().fit(vectorSource.getExtent(), {
    padding: [50,50,50,50], // 四周留白
    minResolution: 2,       // 可选，限制最小缩放
    maxZoom: 16             // 可选，限制最大缩放
  });
}

// 添加多边形标记
function addPolygonFromGaode(keywords) {
  // 移除上一次图层
  if (city_polygon) {
    map.removeLayer(city_polygon);
    city_polygon = null;
  }

  // 调用高德行政区查询 API
  fetch(`https://restapi.amap.com/v3/config/district?key=a0d13d2c33bb676e758d9e83e6a5148c&keywords=${encodeURIComponent(keywords)}&subdistrict=0&extensions=all`)
    .then(res => res.json())
    .then(data => {
      if (data.districts && data.districts.length > 0) {
        const polylineStr = data.districts[0].polyline; // 多段坐标字符串
        if (!polylineStr) return;

        // 高德 polyline 是 ; 分段，每段是 , 分隔的 lng,lat
        const polygons = polylineStr.split('|').map(seg => {
          return seg.split(';').map(coord => {
            const [lng, lat] = coord.split(',').map(Number);
            return ol.proj.fromLonLat([lng, lat]);
          });
        });

        // console.log(polygons)

        // 创建矢量图层显示
        const vectorSource = new ol.source.Vector({
          features: [new ol.Feature({
            geometry: new ol.geom.MultiPolygon([polygons])
          })]
        });

        city_polygon = new ol.layer.Vector({
          source: vectorSource,
          style: new ol.style.Style({
            stroke: new ol.style.Stroke({ color: 'red', width: 2 }),
            fill: new ol.style.Fill({ color: 'rgba(255,0,0,0)' })
          })
        });

        map.addLayer(city_polygon);
        // 调整视图到行政区范围
        map.getView().fit(vectorSource.getExtent(), { padding: [50,50,50,50] });
      }
    })
    .catch(err => console.error(err));
}