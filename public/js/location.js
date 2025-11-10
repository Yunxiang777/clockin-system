// public/js/gps.js

function updateGPS() {
  if (!navigator.geolocation) {
    alert("您的瀏覽器不支援定位功能。");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      document
        .querySelectorAll("#lat")
        .forEach((i) => (i.value = pos.coords.latitude));
      document
        .querySelectorAll("#lng")
        .forEach((i) => (i.value = pos.coords.longitude));
    },
    (err) => {
      alert("⚠️ 請開啟定位功能才能打卡。");
    }
  );
}

// 頁面載入執行
document.addEventListener("DOMContentLoaded", updateGPS);
