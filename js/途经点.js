console.log('引入添加途径点')

let start_point_layer = null; // 全局变量保存当前显示的图层
let end_point_layer = null; 

// 添加定位点标记
function add_start_point_marker(lng, lat) {
    // 移除上一次图层
  if (start_point_layer) {
    map.removeLayer(start_point_layer);
    start_point_layer = null;
  }

  const feature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat]))
  });

  const vectorSource = new ol.source.Vector({
    features: [feature]
  });

  start_point_layer = new ol.layer.Vector({
    source: vectorSource,
    style: new ol.style.Style({
    image: new ol.style.Icon({
      src: '/imgs/起始点.png',   // 自定义图标路径
      scale: 1,           // 图标缩放比例，可调大小
      anchor: [0.5, 1]    // 设置图片位置偏移
    })
  })
  });

  map.addLayer(start_point_layer);
}

function add_end_point_marker(lng, lat) {
    // 移除上一次图层
  if (end_point_layer) {
    map.removeLayer(end_point_layer);
    end_point_layer = null;
  }

  const feature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat]))
  });

  const vectorSource = new ol.source.Vector({
    features: [feature]
  });

  end_point_layer = new ol.layer.Vector({
    source: vectorSource,
    style: new ol.style.Style({
    image: new ol.style.Icon({
      src: '/imgs/终点.png',   // 自定义图标路径
      scale: 1.25,           // 图标缩放比例，可调大小
      anchor: [0.5, 1]    // 设置图片位置偏移
    })
  })
  });

  map.addLayer(end_point_layer);
}


// 全局途经点图层
let gothr_point_source = new ol.source.Vector();
let gothr_point_layer = new ol.layer.Vector({
  source: gothr_point_source,
  style: new ol.style.Style({
    image: new ol.style.Icon({
      src: '/imgs/途经点.png',
      scale: 1.1,
      anchor: [0.5, 1]
    })
  })
});
// 假设 gothr_point_source 是全局的 vector source
const markerMap = new Map(); // key: row 或 input 元素，value: marker Feature

function add_gothr_point_marker(lng, lat, key) {
    key = `${lng},${lat}`;
//     // 移除上一次图层
//   if (gothr_point_layer) {
//     map.removeLayer(gothr_point_layer);
//     gothr_point_layer = null;
//   }
    // key 用来判断是否已经存在 marker
    if (markerMap.has(key)) {
        console.log('存在key')
        return markerMap.get(key); // 已有 marker，直接返回
    }
    console.log('不存在该key')
    console.log('markerMap', markerMap)
    console.log('判断条件',markerMap.has(key))

    const feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat]))
    });
    gothr_point_source.addFeature(feature);
    markerMap.set(key, feature); // 绑定 key

    // console.log('添加成功feature')
    // console.log('gothr_point_source',gothr_point_source)
    // console.log('gothr_point_layer',gothr_point_layer)
    return feature; // 把 marker 返回
}

// // 删除途经点
// function remove_gothr_point_marker(feature) {
//   gothr_point_source.removeFeature(feature);
// }

function zoom_to(lng, lat) {
  const feature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat]))
  });

  const vectorSource = new ol.source.Vector({
    features: [feature]
  });

  // 自动缩放视图到点或要素范围
  map.getView().fit(vectorSource.getExtent(), {
    padding: [50,50,50,50], // 四周留白
    minResolution: 2,       // 可选，限制最小缩放
    maxZoom: 16             // 可选，限制最大缩放
  });
}

// 删除途经点
function remove_gothr_point_marker(feature) {
  gothr_point_source.removeFeature(feature);
}

function add_gothr_poi_div(name, marker) {
    // 创建一行 div
    const row = document.createElement('div');
    row.className = 'waypoint-row';
    // 动态生成 input，填充点的 name
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '请输入途经点';  // 提示文字
    // 只有 coord 有值才赋给 value
    if (name) {
        input.value = name;
    } 
    // 动态生成button
    const btn = document.createElement('button');
    btn.textContent = '定位';

    // 删除按钮
    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.style.marginLeft = '5px';

    
    // 把 input 和 button 加到 row
    row.appendChild(input);
    row.appendChild(btn);
    row.appendChild(delBtn);

    // 把 row 加到gothr_div容器
    document.getElementById('gothr_div').appendChild(row);

    // // 把 marker 与 row 绑定
    // markerMap.set(row, marker);

    // 删除按钮的点击事件 -> 删除整个 row
    delBtn.onclick = () => {
        row.remove();
        remove_gothr_point_marker(marker);
    };
    
    btn.onclick = () => {
        let go_city = document.getElementById("regionInput").value;
        let name = input.value.trim();
        transform_coord(name, go_city)
        .then(lonlat => {
            map.getView().animate({
                center: ol.proj.fromLonLat(lonlat),
                zoom: 15
            });
        });
    };
};

