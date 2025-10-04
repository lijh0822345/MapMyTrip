// 延时请求
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 如果是经纬度直接转换，如果是地名则调用api
async function transform_coord(input_value, go_city) {
    if (input_value.includes(',')) {
        // 经纬度字符串，转换为数组
        let coords = input_value.split(',').map(Number);
        add_gothr_point_marker(coords[0], coords[1], [coords[0], coords[1]]);
        return coords;
    } else {
        // 普通文字 -> 调用 getLocation 异步获取
        console.log('go_city:', go_city)
        let coords = await getLocation(input_value, go_city);
        add_gothr_point_marker(coords[0], coords[1], [coords[0], coords[1]]);
        return coords;
    }
}


// 获取全部的道路点
async function fetchRoute(rows, go_city) {
    const origin = await getLocation(document.getElementById("start_point").value, go_city);
    await sleep(900);

    const destination = await getLocation(document.getElementById("end_point").value, go_city);
    await sleep(900);

    const way_points = [];
    for (const row of rows) {
        const input = row.querySelector('input');
        const val = input ? input.value : '';
        if (val) {
            const coord = await transform_coord(val, go_city);
            way_points.push(coord);
            await sleep(900); // 每个途经点请求间隔 0.5 秒
        }
    }

    // console.log('出发点', origin);
    // console.log('结束点', destination);
    // console.log('途经点', way_points);

    return {origin, destination, way_points};
}


