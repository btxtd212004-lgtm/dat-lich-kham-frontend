import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const menuItems = [
  { icon: '🛡️', label: 'Quy định sử dụng' },
  { icon: '🔒', label: 'Chính sách bảo mật' },
  { icon: '📋', label: 'Điều khoản dịch vụ' },
  { icon: '📞', label: 'Tổng đài CSKH 19002115' },
  { icon: '👍', label: 'Đánh giá ứng dụng' },
  { icon: '📤', label: 'Chia sẻ ứng dụng' },
  { icon: '❓', label: 'Một số câu hỏi thường gặp' },
];

export default function TaiKhoanScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');

useEffect(() => {
  const loadUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.phone || '');
    }
  };
  loadUser();
}, []);

  return (
    <View style={styles.wrapper}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.name}>{userName || 'Tài khoản'}</Text>
        </View>

        <View style={styles.section}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={() => router.push({ pathname: '/chitiet', params: { title: item.label } })}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={async () => {
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('token');
          router.replace('/');
        }}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuLabel, { color: 'red' }]}>Đăng xuất</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.hospitalSection}>
          <View style={styles.hospitalCard}>
            <View style={styles.hospitalRow}>
              <Text style={styles.hospitalIcon}>🏢</Text>
              <View>
                <Text style={styles.hospitalName}>Bệnh viện Đa khoa ABC</Text>
                <Text style={styles.hospitalSub}>Chăm sóc sức khỏe toàn diện</Text>
              </View>
            </View>
            <View style={styles.hospitalRow}>
              <Text style={styles.hospitalIcon}>📍</Text>
              <Text style={styles.hospitalInfo}>123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM</Text>
            </View>
            <View style={styles.hospitalRow}>
              <Text style={styles.hospitalIcon}>📞</Text>
              <Text style={styles.hospitalInfo}>Hotline: 1900 2115</Text>
            </View>
            <View style={styles.hospitalRow}>
              <Text style={styles.hospitalIcon}>🕐</Text>
              <Text style={styles.hospitalInfo}>Thứ 2 - Thứ 6: 7:00 - 17:00{'\n'}Thứ 7 - Chủ nhật: 7:00 - 12:00</Text>
            </View>
            <View style={styles.hospitalRow}>
              <Text style={styles.hospitalIcon}>🌐</Text>
              <Text style={styles.hospitalInfo}>www.benhvienabc.vn</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/home')}>
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabText}>Trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push({ pathname: '/ChonHoSo', params: { mode: 'quanly' } })}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabText}>Hồ sơ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/thongbao')}>
          <Text style={styles.tabIcon}>🔔</Text>
          <Text style={styles.tabText}>Thông báo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>⚙️</Text>
          <Text style={[styles.tabText, { color: '#1a73e8', fontWeight: 'bold' }]}>Tài khoản</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1a73e8', padding: 40, alignItems: 'center', paddingTop: 60 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  section: { backgroundColor: '#fff', marginTop: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuIcon: { fontSize: 22, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, color: '#333' },
  arrow: { fontSize: 20, color: '#ccc' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingVertical: 8 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22 },
  tabText: { fontSize: 11, color: '#999', marginTop: 2 },
  hospitalSection: { marginTop: 8, marginBottom: 8 },
hospitalCard: { backgroundColor: '#1a73e8', padding: 16 },
hospitalRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
hospitalIcon: { fontSize: 14, marginRight: 8, marginTop: 2 },
hospitalName: { fontSize: 13, fontWeight: 'bold', color: '#fff' },
hospitalSub: { fontSize: 11, color: '#c8e0ff', marginTop: 1 },
hospitalInfo: { fontSize: 12, color: '#fff', flex: 1 },
});