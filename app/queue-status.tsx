import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

export default function QueueStatusScreen() {
  const router = useRouter();
  const { scheduleId, queueNumber, khoa, ngay, gio } = useLocalSearchParams<{
    scheduleId: string;
    queueNumber: string;
    khoa: string;
    ngay: string;
    gio: string;
  }>();

  const [queueInfo, setQueueInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<any>(null);

  const myNum = parseInt(queueNumber || '0');

  const fetchQueue = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/queue/${scheduleId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setQueueInfo(data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchQueue();
    // Tự động cập nhật mỗi 15 giây
    intervalRef.current = setInterval(fetchQueue, 15000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const current   = queueInfo?.current_queue || 0;
  const remaining = Math.max(0, myNum - current);
  const isCalled  = current >= myNum && myNum > 0;
  const isWaiting = !isCalled && myNum > 0;

  const getStatusColor = () => {
    if (isCalled) return '#2e7d32';
    if (remaining <= 3) return '#e8a01a';
    return '#1a73e8';
  };

  const getStatusText = () => {
    if (isCalled) return '🔔 ĐẾN LƯỢT BẠN!';
    if (remaining === 0 && current === 0) return '⏳ Chưa bắt đầu khám';
    if (remaining <= 3) return '⚡ Sắp đến lượt bạn!';
    return '⏳ Đang chờ...';
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo dõi số thứ tự</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.body}>
        {/* Thông tin lịch */}
        <View style={styles.infoCard}>
          <Text style={styles.infoKhoa}>{khoa}</Text>
          <Text style={styles.infoTime}>📅 {ngay} • {gio}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Status banner */}
            <View style={[styles.statusBanner, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>

            {/* Số của tôi vs đang gọi */}
            <View style={styles.numbersRow}>
              <View style={styles.numberBox}>
                <Text style={styles.numberLabel}>Số của bạn</Text>
                <Text style={[styles.bigNumber, { color: '#1a73e8' }]}>#{myNum}</Text>
              </View>
              <View style={styles.dividerV} />
              <View style={styles.numberBox}>
                <Text style={styles.numberLabel}>Đang gọi</Text>
                <Text style={[styles.bigNumber, { color: isCalled ? '#2e7d32' : '#e8a01a' }]}>
                  #{current || '—'}
                </Text>
              </View>
            </View>

            {/* Số người chờ trước */}
            {isWaiting && remaining > 0 && (
              <View style={styles.waitBox}>
                <Text style={styles.waitNum}>{remaining}</Text>
                <Text style={styles.waitLabel}>người trước bạn</Text>
                {current > 0 && (
                  <Text style={styles.waitNote}>~ {remaining * 10} phút dự kiến</Text>
                )}
              </View>
            )}

            {isWaiting && remaining === 0 && current === 0 && (
              <View style={styles.waitBox}>
                <Text style={styles.waitLabel}>Hàng đợi chưa bắt đầu</Text>
                <Text style={styles.waitNote}>Vui lòng có mặt đúng giờ</Text>
              </View>
            )}

            {isCalled && (
              <View style={styles.calledBox}>
                <Text style={styles.calledIcon}>🏃</Text>
                <Text style={styles.calledText}>Vui lòng đến phòng khám ngay!</Text>
              </View>
            )}

            {/* Thống kê nhỏ */}
            {queueInfo && (
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>{queueInfo.waiting_count}</Text>
                  <Text style={styles.statLabel}>Đang chờ</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>{queueInfo.done_count}</Text>
                  <Text style={styles.statLabel}>Đã khám xong</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>{queueInfo.max_patients}</Text>
                  <Text style={styles.statLabel}>Tổng slot</Text>
                </View>
              </View>
            )}

            <Text style={styles.autoRefresh}>🔄 Tự động cập nhật mỗi 15 giây</Text>
            <TouchableOpacity style={styles.manualRefresh} onPress={fetchQueue}>
              <Text style={styles.manualRefreshText}>Cập nhật ngay</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1a73e8', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52 },
  back: { fontSize: 24, color: '#fff' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  body: { flex: 1, padding: 16 },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center' },
  infoKhoa: { fontSize: 16, fontWeight: 'bold', color: '#1a73e8' },
  infoTime: { fontSize: 13, color: '#666', marginTop: 4 },
  statusBanner: { borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  statusText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  numbersRow: { backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row', alignItems: 'center', padding: 20, marginBottom: 12 },
  numberBox: { flex: 1, alignItems: 'center' },
  numberLabel: { fontSize: 13, color: '#999', marginBottom: 8 },
  bigNumber: { fontSize: 48, fontWeight: 'bold' },
  dividerV: { width: 1, height: 70, backgroundColor: '#eee', marginHorizontal: 16 },
  waitBox: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 12 },
  waitNum: { fontSize: 40, fontWeight: 'bold', color: '#e8a01a' },
  waitLabel: { fontSize: 15, color: '#555', marginTop: 4 },
  waitNote: { fontSize: 12, color: '#999', marginTop: 6 },
  calledBox: { backgroundColor: '#e8f5e9', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 12 },
  calledIcon: { fontSize: 40, marginBottom: 8 },
  calledText: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32', textAlign: 'center' },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 11, color: '#999', marginTop: 2 },
  autoRefresh: { textAlign: 'center', color: '#999', fontSize: 12, marginBottom: 12 },
  manualRefresh: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#1a73e8', borderRadius: 10, padding: 12, alignItems: 'center' },
  manualRefreshText: { color: '#1a73e8', fontWeight: 'bold', fontSize: 14 },
});