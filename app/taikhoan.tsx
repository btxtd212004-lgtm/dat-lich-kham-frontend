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
  const [userPhone, setUserPhone] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.full_name || '');
        setUserPhone(user.phone || '');
      }
    };
    loadUser();
  }, []);

  const avatarLetter = userName ? userName.trim().split(' ').pop()?.charAt(0).toUpperCase() || '?' : '?';

  return (
    <View style={styles.wrapper}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <Text style={styles.name}>{userName || 'Tài khoản'}</Text>
          {userPhone ? <Text style={styles.phone}>{userPhone}</Text> : null}
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

        <View style={{ height: 20 }} />
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
          <Text style={styles.tabIcon}>📅</Text>
          <Text style={styles.tabText}>Lịch khám</Text>
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
  header: { backgroundColor: '#1a73e8', paddingTop: 60, paddingBottom: 28, alignItems: 'center' },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#1a73e8' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  phone: { fontSize: 14, color: '#c8e0ff', marginTop: 4 },
  section: { backgroundColor: '#fff', marginTop: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuIcon: { fontSize: 22, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, color: '#333' },
  arrow: { fontSize: 20, color: '#ccc' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingVertical: 8, paddingBottom: 20 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22 },
  tabText: { fontSize: 11, color: '#999', marginTop: 2 },
});