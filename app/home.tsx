import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, BackHandler, Alert, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

const today = new Date();
const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const dateStr = `${dayNames[today.getDay()]}, ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [nearestAppt, setNearestAppt] = useState<any>(null);
  const [queueInfo, setQueueInfo] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [newsList, setNewsList] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.full_name || user.phone || '');
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments/my?status=waiting`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const appt = data.data[0];
        setNearestAppt(appt);
        const qRes = await fetch(`${API_URL}/api/queue/${appt.schedule_id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const qData = await qRes.json();
        if (qData.success) setQueueInfo(qData.data);
      } else {
        setNearestAppt(null);
        setQueueInfo(null);
      }
    } catch { /* ignore */ }

    try {
      const newsRes = await fetch(`${API_URL}/api/news`);
      const newsData = await newsRes.json();
      if (newsData.success) setNewsList(newsData.data);
    } catch { /* ignore */ }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => { loadData(); }, []);

  useFocusEffect(useCallback(() => {
    loadData();
    const backAction = () => {
      Alert.alert('Thoát ứng dụng', 'Bạn có muốn thoát không?', [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Thoát', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [loadData]));

  const formatDate = (d: string) => {
    if (!d) return '';
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a73e8']} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Xin chào, {userName || 'Bạn'} 👋</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>

        {/* Card lịch đang chờ + STT */}
        {nearestAppt && (
          <TouchableOpacity style={styles.queueCard} onPress={() => router.push('/thongbao')}>
            <View style={styles.queueTop}>
              <Text style={styles.queueTitle}>📋 Lịch khám sắp tới</Text>
              <Text style={styles.queueDept}>{nearestAppt.department_name}</Text>
            </View>
            <View style={styles.queueBody}>
              <View style={styles.queueLeft}>
                <Text style={styles.queueLabel}>Số thứ tự của bạn</Text>
                <Text style={styles.queueNumber}>#{nearestAppt.queue_number}</Text>
                <Text style={styles.queueDate}>{formatDate(nearestAppt.date)} • {nearestAppt.start_time?.slice(0,5)}</Text>
              </View>
              <View style={styles.queueRight}>
                {queueInfo ? (
                  <>
                    <Text style={styles.queueLabel}>Đang gọi số</Text>
                    <Text style={styles.queueCurrent}>#{queueInfo.current_queue || '—'}</Text>
                    <Text style={styles.queueWaiting}>
                      Còn {Math.max(0, nearestAppt.queue_number - (queueInfo.current_queue || 0))} người trước bạn
                    </Text>
                  </>
                ) : (
                  <Text style={styles.queueWaiting}>Chưa bắt đầu khám</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Nút đặt lịch */}
        <TouchableOpacity style={styles.bookingButton} onPress={() => router.push('/Datlich')}>
          <Text style={styles.bookingIcon}>📅</Text>
          <Text style={styles.bookingText}>ĐẶT LỊCH KHÁM BỆNH</Text>
        </TouchableOpacity>

        {/* Grid dịch vụ */}
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/thongbao')}>
            <Text style={styles.gridIcon}>📋</Text>
            <Text style={styles.gridText}>Lịch đặt của tôi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => router.push({ pathname: '/ChonHoSo', params: { mode: 'quanly' } })}>
            <Text style={styles.gridIcon}>👤</Text>
            <Text style={styles.gridText}>Hồ sơ sức khỏe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/HuongDan')}>
            <Text style={styles.gridIcon}>📖</Text>
            <Text style={styles.gridText}>Hướng dẫn đặt khám</Text>
          </TouchableOpacity>
        </View>

        {/* Tin tức */}
        <View style={styles.newsHeader}>
          <Text style={styles.newsTitle}>Tin tức mới nhất</Text>
        </View>
        {newsList.length === 0 ? (
          <Text style={styles.emptyNews}>Chưa có tin tức nào</Text>
        ) : (
          newsList.map(n => (
            <TouchableOpacity key={n.id} style={styles.newsCard} onPress={() => router.push({
              pathname: '/ChiTietTinTuc',
              params: { title: n.title, content: n.content, image_url: n.image_url || '', created_at: n.created_at }
            })}>
              {n.image_url
                ? <Image source={{ uri: n.image_url }} style={styles.newsImage} resizeMode="cover" />
                : <View style={styles.newsImagePlaceholder} />
              }
              <View style={styles.newsContent}>
                <Text style={styles.newsText} numberOfLines={2}>{n.title}</Text>
                <Text style={styles.newsDate}>{formatDate(n.created_at)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabActiveText}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push({ pathname: '/ChonHoSo', params: { mode: 'quanly' } })}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabText}>Hồ sơ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/thongbao')}>
          <Text style={styles.tabIcon}>📅</Text>
          <Text style={styles.tabText}>Lịch khám</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/taikhoan')}>
          <Text style={styles.tabIcon}>⚙️</Text>
          <Text style={styles.tabText}>Tài khoản</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1 },
  header: { backgroundColor: '#1a73e8', padding: 20, paddingTop: 50 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  date: { fontSize: 14, color: '#c8e0ff', marginTop: 4 },
  queueCard: { backgroundColor: '#fff', margin: 16, marginBottom: 8, borderRadius: 14, padding: 16, borderLeftWidth: 4, borderLeftColor: '#1a73e8', elevation: 2 },
  queueTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  queueTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  queueDept: { fontSize: 12, color: '#1a73e8', fontWeight: '600' },
  queueBody: { flexDirection: 'row', justifyContent: 'space-between' },
  queueLeft: { flex: 1 },
  queueRight: { flex: 1, alignItems: 'flex-end' },
  queueLabel: { fontSize: 11, color: '#999', marginBottom: 2 },
  queueNumber: { fontSize: 28, fontWeight: 'bold', color: '#1a73e8' },
  queueDate: { fontSize: 11, color: '#666', marginTop: 2 },
  queueCurrent: { fontSize: 28, fontWeight: 'bold', color: '#e8a01a' },
  queueWaiting: { fontSize: 12, color: '#666', textAlign: 'right' },
  bookingButton: { backgroundColor: '#1a73e8', margin: 16, marginTop: 8, padding: 18, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  bookingIcon: { fontSize: 22 },
  bookingText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 8 },
  gridItem: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', flex: 1, minWidth: '28%' },
  gridIcon: { fontSize: 28, marginBottom: 8 },
  gridText: { fontSize: 11, textAlign: 'center', color: '#333' },
  newsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  newsTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  newsCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, flexDirection: 'row', overflow: 'hidden', marginBottom: 8 },
  newsImage: { width: 100, height: 80 },
  newsImagePlaceholder: { width: 100, height: 80, backgroundColor: '#ddd' },
  newsContent: { flex: 1, padding: 10, justifyContent: 'center' },
  newsText: { fontSize: 14, color: '#333', marginBottom: 4 },
  newsDate: { fontSize: 12, color: '#999' },
  emptyNews: { textAlign: 'center', color: '#999', marginTop: 10, marginBottom: 10 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingVertical: 8 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22 },
  tabText: { fontSize: 11, color: '#999', marginTop: 2 },
  tabActiveText: { fontSize: 11, color: '#1a73e8', fontWeight: 'bold', marginTop: 2 },
});