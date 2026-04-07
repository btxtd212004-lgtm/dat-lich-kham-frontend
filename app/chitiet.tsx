import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const contents: Record<string, string> = {
  'Quy định sử dụng': 'Người dùng cam kết sử dụng ứng dụng đúng mục đích, không sử dụng để gian lận hoặc vi phạm pháp luật...',
  'Chính sách bảo mật': 'Chúng tôi cam kết bảo mật thông tin cá nhân của người dùng. Thông tin sẽ không được chia sẻ cho bên thứ 3 khi chưa có sự đồng ý...',
  'Điều khoản dịch vụ': 'Bằng cách sử dụng ứng dụng, bạn đồng ý với các điều khoản dịch vụ của chúng tôi...',
  'Tổng đài CSKH 19002115': 'Liên hệ tổng đài hỗ trợ khách hàng: 111100000\nThời gian làm việc: 7:00 - 17:00 các ngày trong tuần.',
  'Đánh giá ứng dụng': 'Cảm ơn bạn đã sử dụng ứng dụng! Hãy đánh giá chúng tôi trên CH Play để ủng hộ nhé ⭐⭐⭐⭐⭐',
  'Chia sẻ ứng dụng': 'Chia sẻ ứng dụng đặt lịch khám với bạn bè và người thân để cùng trải nghiệm!',
  'Một số câu hỏi thường gặp': 'Q: Làm sao để đặt lịch khám?\nA: Vào trang chủ → Đặt lịch khám bệnh → Chọn bác sĩ → Chọn ngày giờ.\n\nQ: Làm sao để hủy lịch?\nA: Vào Hồ sơ → Lịch của tôi → Chọn lịch → Hủy lịch.',
};

export default function ChiTietScreen() {
  const router = useRouter();
  const { title } = useLocalSearchParams<{ title: string }>();

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.content}>{contents[title as string] ?? 'Đang cập nhật...'}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#1a73e8', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50 },
  back: { fontSize: 24, color: '#fff' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
  container: { padding: 20 },
  content: { fontSize: 15, color: '#333', lineHeight: 24 },
});