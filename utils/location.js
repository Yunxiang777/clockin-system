// GPS定位
// 確認使用者是否在公司
export function isNearCompany(lat, lng) {
  const companyLat = process.env.COMPANYLAT;
  const companyLng = process.env.COMPANYLNG;
  const distance = Math.sqrt(
    Math.pow(companyLat - lat, 2) + Math.pow(companyLng - lng, 2)
  );
  console.log(distance);

  return distance < 0.0005;
}
