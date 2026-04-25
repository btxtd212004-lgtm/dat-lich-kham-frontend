import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

export default function LichKhamScreen() {
  const router = useRouter();
  const [lichKhams, setLichKhams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');

  useFocusEffect(useCallback(() => { loadLichKham(); }, []));

  const loadLichKham = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments/my`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setLichKhams(data.data);
      else setLichKhams([]);
    } catch { setLichKhams([]); }
    finally { setLoading(false); }
  };

  const upcomingList = lichKhams.filter((item: any) => {
    if (item.status === 'cancelled') return false;
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return itemDate >= today;
  });

  const historyList = lichKhams.filter((item: any) => {
    if (item.status === 'cancelled') return true;
    const itemDate = new Date(item.date);
    itemDate.setHours(23, 59, 59, 999);
    return itemDate < new Date();
  });

  const displayList = tab === 'upcoming' ? upcomingList : historyList;

  const huyLich = async (id: number, paymentMethod: string) => {
    const hoantien = paymentMethod === 'momo'
      ? 'Vì bạn đã thanh toán qua MoMo, vui lòng liên hệ quầy lễ tân để được hoàn tiền.'
      : paymentMethod === 'cash'
      ? 'Phí khám (nếu đã thanh toán) sẽ được hoàn tại quầy lễ tân.'
      : '';

    Alert.alert(
      'Hủy lịch khám',
      `Bạn có chắc muốn hủy lịch khám này?\n\n${hoantien}`,
      [
        { text: 'Không', style: 'cancel' },
        { text: 'Xác nhận hủy', style: 'destructive', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/appointments/${id}/cancel`, {
              method: 'PUT', headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) loadLichKham();
            else Alert.alert('Không thể hủy', data.message);
          } catch { Alert.alert('Lỗi', 'Không kết nối được server!'); }
        }},
      ]
    );
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
  };

  const getStatus = (item: any) => {
    if (item.status === 'cancelled') return { text: 'Đã huỷ', color: '#999' };
    if (item.status === 'done') return { text: 'Đã khám', color: '#2e7d32' };
    if (item.status === 'in_progress') return { text: 'Đang khám', color: '#e8a01a' };
    return { text: 'Chờ khám', color: '#1a73e8' };
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch khám</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'upcoming' && styles.tabActive]} onPress={() => setTab('upcoming')}>
          <Text style={[styles.tabText, tab === 'upcoming' && styles.tabTextActive]}>Sắp tới ({upcomingList.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'history' && styles.tabActive]} onPress={() => setTab('history')}>
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>Lịch sử ({historyList.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 50 }} />
        ) : displayList.length > 0 ? (
          displayList.map((item, index) => {
            const st = getStatus(item);
            return (
              <View key={`${item.id}-${index}`} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tenBenhNhan}>{item.department_name}</Text>
                    <Text style={{ fontSize: 13, color: '#555', marginTop: 2 }}>👤 {item.patient_name}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: st.color + '20' }]}>
                    <Text style={[styles.badgeText, { color: st.color }]}>{st.text}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>STT khám</Text>
                  <Text style={styles.stt}>#{item.queue_number}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Bác sĩ</Text>
                  <Text style={styles.infoValue}>{item.doctor_name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ngày khám</Text>
                  <Text style={styles.infoValue}>{formatDate(item.date)} | {item.start_time?.slice(0,5)} – {item.end_time?.slice(0,5)}</Text>
                </View>

                {item.status === 'waiting' && (
                  <TouchableOpacity
                    style={styles.trackBtn}
                    onPress={() => router.push({
                      pathname: '/queue-status',
                      params: {
                        scheduleId: String(item.schedule_id),
                        queueNumber: String(item.queue_number),
                        khoa: item.department_name,
                        ngay: formatDate(item.date),
                        gio: `${item.start_time?.slice(0,5)} – ${item.end_time?.slice(0,5)}`,
                      }
                    })}
                  >
                    <Text style={styles.trackBtnText}>📡 Theo dõi số thứ tự</Text>
                  </TouchableOpacity>
                )}

                {item.status === 'waiting' && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => huyLich(item.id, item.payment_method)}>
                    <Text style={styles.cancelText}>Hủy lịch</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>{tab === 'upcoming' ? 'Chưa có lịch khám sắp tới' : 'Chưa có lịch sử khám'}</Text>
            {tab === 'upcoming' && (
              <>
                <Text style={styles.emptyDesc}>Bấm Đặt lịch để đặt lịch khám</Text>
                <TouchableOpacity style={styles.datLichBtn} onPress={() => router.push('/Datlich')}>
                  <Text style={styles.datLichText}>Đặt lịch ngay</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/home')}>
          <Text style={styles.tabIcon}>🏠</Text><Text style={styles.tabBarText}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push({ pathname: '/ChonHoSo', params: { mode: 'quanly' } })}>
          <Text style={styles.tabIcon}>👤</Text><Text style={styles.tabBarText}>Hồ sơ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>📅</Text>
          <Text style={[styles.tabBarText, { color: '#1a73e8', fontWeight: 'bold' }]}>Lịch khám</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/taikhoan')}>
          <Text style={styles.tabIcon}>⚙️</Text><Text style={styles.tabBarText}>Tài khoản</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1a73e8', padding: 16, paddingTop: 50, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#1a73e8' },
  tabText: { fontSize: 14, color: '#999' },
  tabTextActive: { color: '#1a73e8', fontWeight: 'bold' },
  container: { flex: 1, padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tenBenhNhan: { fontSize: 16, fontWeight: 'bold', color: '#1a73e8' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 13, color: '#999' },
  infoValue: { fontSize: 13, color: '#333', fontWeight: 'bold', flex: 1, textAlign: 'right' },
  stt: { fontSize: 16, color: '#1a73e8', fontWeight: 'bold' },
  trackBtn: { backgroundColor: '#e3f2fd', borderRadius: 10, padding: 10, alignItems: 'center', marginTop: 10 },
  trackBtnText: { color: '#1a73e8', fontSize: 13, fontWeight: 'bold' },
  cancelBtn: { borderWidth: 1, borderColor: 'red', borderRadius: 20, padding: 10, alignItems: 'center', marginTop: 8 },
  cancelText: { color: 'red', fontSize: 13, fontWeight: 'bold' },
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#666', marginBottom: 24 },
  datLichBtn: { backgroundColor: '#1a73e8', padding: 16, borderRadius: 10, paddingHorizontal: 32 },
  datLichText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingVertical: 8, paddingBottom: 20 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22 },
  tabBarText: { fontSize: 11, color: '#999', marginTop: 2 },
});