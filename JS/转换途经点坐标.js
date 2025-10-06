// 延时请求
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 如果是经纬度直接转换，如果是地名则调用api
async function transform_coord(input_value, go_city, marker_id) {
    if (input_value.includes(',')) {
        // 经纬度字符串，转换为数组
        let coords = input_value.split(',').map(Number);
        add_gothr_point_marker(coords, marker_id, input_value);
        return coords;
    } else {
        // 普通文字 -> 调用 getLocation 异步获取
        console.log('go_city:', go_city)
        let coords = await getLocation(input_value, go_city);
        add_gothr_point_marker(coords, marker_id, input_value);
        return coords;
    }
}


// 获取全部的道路点
async function fetchRoute(rows, go_city) {
    let origin;
    let destination;

    // 获取起始点坐标
    origin_name = document.getElementById("start_point").value
    if (origin_name === ptsMap.get('start_point')?.name && ptsMap.get('start_point')?.coords?.length > 0){
        origin = ptsMap.get('start_point').coords
    }else{
        origin = await getLocation(origin_name, go_city);
        ptsMap.set('start_point', create_property({name:origin_name, coords:origin, marker:null}))
        await sleep(900);
    }
    add_start_point_marker(origin[0], origin[1]);
    // 获取结束点坐标
    des_name = document.getElementById("end_point").value
    if (des_name === ptsMap.get('end_point')?.name && ptsMap.get('end_point')?.coords?.length > 0){
        destination = ptsMap.get('end_point').coords
    }else{
        destination = await getLocation(des_name, go_city);
        ptsMap.set('end_point', create_property({name:des_name, coords:destination, marker:null}))
        await sleep(900);
        console.log('ptsMap', ptsMap)
    }
    add_end_point_marker(destination[0], destination[1]);
    // 获取途经点坐标
    const way_points = [];
    
    // console.log('不能检测出ptsMap里含有marker')
    for (const row of rows) {
        const input = row.querySelector('input');
        const val = input ? input.value : '';
        if (val) {
            let foundEntry = null;
            for (let [key, value] of ptsMap.entries()) {
                if (value.name === val) {
                    foundEntry = { key, value };
                    break;
                }
            }
            if (foundEntry) {
                way_points.push(foundEntry.value.coords);
                add_gothr_point_marker(foundEntry.value.coords, foundEntry.key, foundEntry.value.name);
            }else{
                marker_id = input.id
                const coord = await transform_coord(val, go_city, marker_id);
                way_points.push(coord);
                await sleep(900); // 每个途经点请求间隔 0.5 秒
            }   
        }
    }
    
    return {origin, destination, way_points};
}


