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
// const markerMap = new Map(); // key: row 或 input 元素，value: marker Feature
const ptsMap = new Map();
// 定义一个函数，用于创建完整的对象
function create_property({name=null, coords=null, marker=null} = {}) {
  return {name, coords, marker};
}

function add_gothr_point_marker(coords, marker_id, vis_name) {
    // coords = `${lng},${lat}`;
    console.log('ptsMap', ptsMap);
    // marker_id 用来判断是否已经存在 marker
    if (ptsMap.has(marker_id)) {
        console.log('存在marker_id,删除原marker')
        remove_gothr_point_marker(ptsMap.get(marker_id).marker)
    }
    // console.log('不存在该marker_id,需要新建key')

    const marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([coords[0], coords[1]]))
    });
    gothr_point_source.addFeature(marker);
    console.log('旧ptsMap', ptsMap)
    ptsMap.set(marker_id, create_property({name:vis_name, coords:coords, marker:marker})); // 绑定 marker_id
    console.log('新ptsMap', ptsMap)

    return marker; // 把 marker 返回
}



let marker_counter = 0;
function add_gothr_poi_div(name, coords) {
    // 创建一行 div
    const row = document.createElement('div');
    row.className = 'waypoint-row';

    // 创建 wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';  // 设置 class
    // 动态生成 input，填充点的 name
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '请输入途经点';  // 提示文字
    input.id = `marker_${marker_counter}`;
    marker_counter += 1
    let marker_id = input.id
    console.log('marker_id', marker_id)
    // 只有 coord 有值才赋给 value
    if (name) {
        input.value = name;
    } 
    // 创建 suggestion box
    const suggestionBox = document.createElement('div');
    suggestionBox.className = 'suggestion-box';
    // 将 input 和 suggestionBox 添加到 wrapper
    wrapper.appendChild(input);
    wrapper.appendChild(suggestionBox);

    // 动态生成button
    const btn = document.createElement('button');
    btn.textContent = '定位';

    // 删除按钮
    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.style.marginLeft = '5px';

    
    // 把 input 和 button 加到 row
    row.appendChild(wrapper);
    row.appendChild(btn);
    row.appendChild(delBtn);

    // 把 row 加到gothr_div容器
    document.getElementById('gothr_div').appendChild(row);

    get_input_tips(input.id, "regionInput")
    console.log('原始name', name)

    if (Array.isArray(name)) {
      name = name.join(',')
    }else{name = name}
    console.log('转换后name', name)
    if (coords) {
        add_gothr_point_marker(coords, marker_id, name);
    } 

    // 删除按钮的点击事件 -> 删除整个 row
    delBtn.onclick = () => {
        row.remove();
        // coords = `${coords[0]},${coords[1]}`;
        // console.log('删除', coords)
        remove_gothr_point_marker(ptsMap.get(marker_id).marker);
        ptsMap.delete(marker_id);
        console.log('ptsMap', ptsMap)
    };
    
    btn.onclick = () => {
      if (ptsMap.has(marker_id)) {
        console.log('存在marker_id,删除原marker')
        remove_gothr_point_marker(ptsMap.get(marker_id).marker)
      }
      let foundEntry = null;
      let gothr_pt_name = document.getElementById(marker_id).value;
      let go_city = document.getElementById("regionInput").value;
      console.log('ptsMap', ptsMap)
      // 遍历 Map，找到符合 name 的项
      for (let [key, value] of ptsMap.entries()) {
          if (value.name === gothr_pt_name) {
              foundEntry = { key, value };
              break;
          }
      }
      // 判断是否找到
      if (foundEntry) {
          console.log("已存在:", foundEntry.key, "对应属性为:", foundEntry.value);
          if(foundEntry.value.coords.length > 0) {
              console.log('ptsMap存在该点位,且有coords,直接查询')
              coords = foundEntry.value.coords;
              console.log('查询的coords', coords);
              
              add_gothr_point_marker(coords, marker_id, foundEntry.value.name);
              zoom_to(coords[0], coords[1]);
          }else {
              console.log('ptsMap存在该点位,但没有coords,需要地理编码搜索,并更新ptsMap')
              getLocation(gothr_pt_name, go_city)
              .then(gothr_point_loc => {
                  ptsMap.get(marker_id).coords = gothr_point_loc;
                  add_gothr_point_marker(gothr_point_loc, marker_id, gothr_pt_name);
                  zoom_to(gothr_point_loc[0], gothr_point_loc[1]);
              })
              console.log('ptsMap更新完成', ptsMap)
          }
      } else {
          console.log("ptsMap 中不存在该点位,需要地理编码搜索,并创建新key");
          getLocation(gothr_pt_name, go_city)
          .then(gothr_point_loc => {
              ptsMap.set(marker_id, create_property({name:gothr_pt_name, coords:gothr_point_loc, marker:null}));
              add_gothr_point_marker(gothr_point_loc, marker_id, gothr_pt_name);
              zoom_to(gothr_point_loc[0], gothr_point_loc[1]);
              console.log('ptsMap新key创建完成', ptsMap)
          }) 
      }




        // if(ptsMap.get(input.id)) {
        //   tip_coords_str = ptsMap.get(input.id).coords
        //   console.log('tip_coords_str', tip_coords_str)
        //   console.log('tip_coords_str.length', tip_coords_str.length)
          
        //   tip_coords = tip_coords_str.split(",").map(Number)
        //   tip_vis_name = ptsMap.get(input.id).vis_name
        //   add_gothr_point_marker(tip_coords, marker_id, tip_vis_name)
        //   zoom_to(tip_coords[0], tip_coords[1]);

        //   console.log('ptsMap', ptsMap)
          
        // }else{
        //   let go_city = document.getElementById("regionInput").value;
        //   let name = input.value.trim();
        //   transform_coord(name, go_city, marker_id)
        //   .then(lonlat => {
        //       map.getView().animate({
        //           center: ol.proj.fromLonLat(lonlat),
        //           zoom: 15
        //       });
        // });
        // }
        
        // console.log('ptsMap', ptsMap)
    };
};

