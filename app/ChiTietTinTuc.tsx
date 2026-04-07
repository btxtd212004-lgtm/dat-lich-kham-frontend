import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ChiTietTinTucScreen() {
  const router = useRouter();
  const { title, content, image_url, created_at } = useLocalSearchParams<{
    title: string;
    content: string;
    image_url: string;
    created_at: string;
  }>();

  const formatDate = (d: string) => {
    if (!d) return '';
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
  };

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin tức</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.container}>
        {/* Ảnh */}
        {image_url ? (
          <Image source={{ uri: image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}

        <View style={styles.body}>
          {/* Ngày đăng */}
          <Text style={styles.date}>🕐 {formatDate(created_at)}</Text>

          {/* Tiêu đề */}
          <Text style={styles.title}>{title}</Text>

          {/* Đường kẻ */}
          <View style={styles.divider} />

          {/* Nội dung */}
          <Text style={styles.content}>{content}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#1a73e8', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52 },
  backBtn: { width: 80 },
  backText: { color: '#fff', fontSize: 14 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  container: { flex: 1 },
  image: { width: '100%', height: 220 },
  imagePlaceholder: { width: '100%', height: 220, backgroundColor: '#ddd' },
  body: { padding: 20 },
  date: { fontSize: 13, color: '#999', marginBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#222', lineHeight: 28, marginBottom: 14 },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 16 },
  content: { fontSize: 15, color: '#444', lineHeight: 24 },
});