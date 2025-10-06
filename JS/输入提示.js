
// 获取输入提示
function get_input_tips(inputId, go_city_id) {
    console.log('可以显示提示')
    let tip_input;
    tip_input = document.getElementById(inputId);
    
    // const tip_input = document.getElementById(inputId);
    const suggestionBox = tip_input.parentNode.querySelector('.suggestion-box');
    let debounceTimer = null;

    tip_input.addEventListener("input", function () {
        // console.log(tip_input.value)
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(async () => {
            const keywords = tip_input.value.trim();
            if (!keywords) {
                suggestionBox.style.display = "none";
                suggestionBox.innerHTML = "";
                return;
            }

            const go_city = document.getElementById(go_city_id).value;
            let tip_url = `https://restapi.amap.com/v3/assistant/inputtips?key=${api_key}&keywords=${keywords}`;

            if (go_city) {
                try {
                    const formal_city = await get_formal_city(go_city);  // ✅ 异步获取正式市名
                    tip_url += `&city=${formal_city}`;
                } catch (e) {
                    console.error("获取城市失败：", e);
                }
            }

            try {
                const res = await fetch(tip_url);
                const data = await res.json();

                suggestionBox.innerHTML = "";
                if (data.tips && data.tips.length > 0) {
                    data.tips.forEach(tip => {
                        if (!tip.name) return;
                        const div = document.createElement("div");
                        div.textContent = tip.name + (tip.district ? `（${tip.district}）` : "");
                        div.addEventListener("click", () => {
                            let tip_name = tip.name
                            let coords = tip.location.length>0 ? tip.location.split(",").map(Number) : [];
                            console.log('coords', coords)
                            console.log('name', tip_name)
                            ptsMap.set(inputId, create_property({name:tip_name, coords:coords}))
                            tip_input.value = tip_name;
                            
                            suggestionBox.style.display = "none";
                            suggestionBox.innerHTML = "";
                            console.log('ptsMap', ptsMap)
                        });
                        suggestionBox.appendChild(div);
                    });
                    suggestionBox.style.display = "block";
                } else {
                    suggestionBox.style.display = "none";
                    suggestionBox.innerHTML = "";
                }
            } catch (err) {
                console.error("获取提示失败：", err);
                suggestionBox.style.display = "none";
            }

        }, 800); // ✅ 延迟 1 秒触发请求
    });

    // 点击页面其他地方隐藏提示框
    document.addEventListener("click", function (e) {
        if (!suggestionBox.contains(e.target) && e.target !== tip_input) {
            suggestionBox.style.display = "none";
        }
    });
}