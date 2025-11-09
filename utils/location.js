export function isNearCompany(lat, lng) {
  const companyLat = 22.608238;
  const companyLng = 120.344137;
  const distance = Math.sqrt(
    Math.pow(companyLat - lat, 2) + Math.pow(companyLng - lng, 2)
  );
  return distance < 0.0005; // 約 50 公尺
}
