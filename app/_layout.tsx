import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="dk" />
      <Stack.Screen name="qmk" />
      <Stack.Screen name="home" />
      <Stack.Screen name="taikhoan" />
      <Stack.Screen name="thongbao" />
      <Stack.Screen name="chitiet" />
      <Stack.Screen name="themhoso" />
      <Stack.Screen name="ChonHoSo" />
      <Stack.Screen name="ChonHoSoDatLich" />
      <Stack.Screen name="ChonThongTin" />
      <Stack.Screen name="Datlich" />
      <Stack.Screen name="ChiTietHoSo" />
      <Stack.Screen name="MomoPay" />
      <Stack.Screen name="HuongDan" />
      <Stack.Screen name="XacNhan" />
      <Stack.Screen name="ThanhToan" />
      <Stack.Screen name="PhieuKham" />
      <Stack.Screen name="KetQuaKham" />
      <Stack.Screen name="queue-status" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="doctor" />
    </Stack>
  );
}
