(() => {
  const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  window.API_BASE = isLocal ? "https://restapi.amap.com" : "/api/amap";

  // 默认不写 key（防止你上传到云时误带 key）
  // 本地开发用的 key 放到 config.local.js 里覆盖
  window.AMAP_KEY = window.AMAP_KEY || "";
})();
