import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const buocs = [
    {
    so: '1',
    ten: 'Chọn dịch vụ',
    icon: '💊',
    moTa: 'Chọn dịch vụ phù hợp với bạn.',
    chiTiet: [
      'Đặt lịch khám bệnh: Thứ 2 đến Thứ 6',
      'Đặt khám ngoài giờ: Thứ bảy và Chủ nhật',
    ],
  },
  {
    so: '2',
    ten: 'Chọn thông tin khám',
    icon: '🏥',
    moTa: 'Chọn chuyên khoa, dịch vụ khám, ngày và giờ khám phù hợp với bạn.',
    chiTiet: [
      'Chọn chuyên khoa phù hợp với tình trạng sức khỏe',
      'Chọn dịch vụ: Khám dịch vụ hoặc Khám VIP',
      'Chọn ngày khám (Thứ 2 - Thứ 6)',
      'Chọn khung giờ còn trống',
    ],
  },
  {
    so: '3',
    ten: 'Chọn hồ sơ bệnh nhân',
    icon: '👤',
    moTa: 'Chọn hồ sơ của người cần khám bệnh.',
    chiTiet: [
      'Chọn hồ sơ có sẵn hoặc tạo hồ sơ mới',
      'Kiểm tra thông tin bệnh nhân chính xác',
      'Xác nhận thông tin trước khi đặt lịch',
    ],
  },
  {
    so: '4',
    ten: 'Thanh toán',
    icon: '💳',
    moTa: 'Chọn phương thức thanh toán phù hợp.',
    chiTiet: [
      'Tiền mặt: Thanh toán tại quầy lễ tân',
      'Ví MoMo: Thanh toán trực tuyến nhanh chóng',
      'Nhận xác nhận đặt lịch sau khi thanh toán',
    ],
  },
  {
    so: '5',
    ten: 'Đến khám đúng giờ',
    icon: '⏰',
    moTa: 'Đến bệnh viện đúng giờ và xuất trình phiếu khám.',
    chiTiet: [
      'Đến trước giờ khám 15-30 phút',
      'Xuất trình CCCD / thẻ BHYT',
      'Chờ gọi số thứ tự tại khoa',
    ],
  },
];

export default function HuongDanScreen() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hướng dẫn đặt khám</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.subtitle}>Các bước đặt lịch khám bệnh trực tuyến</Text>

        {buocs.map((buoc, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.soWrapper}>
                <Text style={styles.so}>{buoc.so}</Text>
              </View>
              <Text style={styles.icon}>{buoc.icon}</Text>
              <Text style={styles.ten}>{buoc.ten}</Text>
            </View>
            <Text style={styles.moTa}>{buoc.moTa}</Text>
            {buoc.chiTiet.map((ct, i) => (
              <View key={i} style={styles.chiTietRow}>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.chiTietText}>{ct}</Text>
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.datLichBtn} onPress={() => router.push('/Datlich')}>
          <Text style={styles.datLichText}>📅 Đặt lịch khám ngay</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1a73e8', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50 },
  back: { fontSize: 24, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  container: { flex: 1, padding: 16 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  soWrapper: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1a73e8', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  so: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  icon: { fontSize: 20, marginRight: 8 },
  ten: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  moTa: { fontSize: 13, color: '#666', marginBottom: 8 },
  chiTietRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  dot: { fontSize: 16, color: '#1a73e8', marginRight: 8 },
  chiTietText: { fontSize: 13, color: '#333', flex: 1 },
  datLichBtn: { backgroundColor: '#1a73e8', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  datLichText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});