import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { API_URL } from '../constants/api';
import * as Calendar from 'expo-calendar';

export default function MomoPayScreen() {
  const router = useRouter();
  const { queueNumber, khoa, ngay, gio, buoi, gia, profileId, phuongThuc } = useLocalSearchParams<{
    queueNumber: string;
    khoa: string;
    ngay: string;
    gio: string;
    buoi: string;
    gia: string;
    profileId: string;
    phuongThuc: string;
  }>();

  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) setUser(JSON.parse(userStr));
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data.profiles) {
        const p = profileId
          ? data.data.profiles.find((x: any) => String(x.id) === String(profileId))
          : data.data.profiles[0];
        setProfile(p || null);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const themVaoLich = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần cấp quyền truy cập lịch!');
        return;
      }
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(c => c.allowsModifications) || calendars[0];
      const parts = (ngay as string).split('/');
      const gioStart = (gio as string).split(' - ')[0];
      const gioParts = gioStart.split(':');
      const startDate = new Date(
        parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]),
        parseInt(gioParts[0]), parseInt(gioParts[1])
      );
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      await Calendar.createEventAsync(defaultCalendar.id, {
        title: `Lịch khám - ${khoa}`,
        startDate,
        endDate,
        notes: `Chuyên khoa: ${khoa}\nSTT: #${queueNumber}`,
        alarms: [{ relativeOffset: -60 }],
      });
      Alert.alert('Thành công', 'Đã thêm vào lịch điện thoại!');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể thêm vào lịch!');
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin thanh toán</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1a73e8" style={{ flex: 1 }} />
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.infoBar}>
            <Text style={styles.infoText}>ⓘ Vui lòng kiểm tra lại thông tin thanh toán</Text>
          </View>

          <Text style={styles.sectionTitle}>Thông tin người bệnh</Text>
          <View style={styles.card}>
            <View style={styles.row}><Text style={styles.icon}>👤</Text><Text style={styles.rowText}>{profile?.full_name?.toUpperCase() || 'Chưa cập nhật'}</Text></View>
            <View style={styles.row}><Text style={styles.icon}>🎂</Text><Text style={styles.rowText}>{formatDate(profile?.date_of_birth)}</Text></View>
            <View style={styles.row}><Text style={styles.icon}>📱</Text><Text style={styles.rowText}>{user?.phone || 'Chưa cập nhật'}</Text></View>
            <View style={styles.row}><Text style={styles.icon}>📍</Text><Text style={styles.rowText}>{profile?.address || 'Chưa cập nhật'}</Text></View>
          </View>

          <Text style={styles.sectionTitle}>Thông tin đặt khám</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}><Text style={styles.label}>Chuyên khoa:</Text><Text style={styles.value}>{khoa}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Ngày khám:</Text><Text style={styles.value}>{ngay}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Giờ khám:</Text><Text style={styles.value}>{buoi} - {gio}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Số thứ tự:</Text><Text style={styles.value}>#{queueNumber}</Text></View>
          </View>

          <View style={styles.momoBar}>
            {phuongThuc === 'tienmat' ? (
              <Text style={styles.momoText}>💵 Vui lòng thanh toán tại quầy sau khi hoàn tất khám chữa bệnh</Text>
            ) : (
              <>
                <Text style={styles.momoText}>📱 Ví MoMo</Text>
                <Text style={styles.momoArrow}>›</Text>
              </>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.costRow}><Text style={styles.costLabel}>Tiền khám:</Text><Text style={styles.costValue}>{gia}</Text></View>
            <View style={styles.costRow}><Text style={styles.costLabel}>Phí tiện ích:</Text><Text style={styles.costValue}>0đ</Text></View>
            <View style={[styles.costRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng tiền:</Text>
              <Text style={styles.totalValue}>{gia}</Text>
            </View>
          </View>

          <View style={styles.noteBar}>
            <Text style={styles.noteIcon}>✅</Text>
            <Text style={styles.noteText}>Bằng việc nhấn vào "Thanh toán", bạn đồng ý với các điều khoản sử dụng dịch vụ.</Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <TouchableOpacity style={styles.payBtn} onPress={() => {
  Alert.alert('Thanh toán thành công! 🎉', `Số thứ tự: #${queueNumber}\nVui lòng đến đúng giờ!`, [
    { text: 'Về trang chủ', onPress: () => router.push('/home') },
    { text: '📅 Thêm vào lịch', onPress: async () => {
      await themVaoLich();
      router.push('/home');
    }},
  ]);
}}>
        <Text style={styles.payText}>THANH TOÁN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1a73e8', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50 },
  back: { fontSize: 24, color: '#fff' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  container: { flex: 1, padding: 16 },
  infoBar: { backgroundColor: '#e8f4fd', padding: 12, borderRadius: 8, marginBottom: 12 },
  infoText: { fontSize: 13, color: '#1a73e8' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1a73e8', marginBottom: 8, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  icon: { fontSize: 16, marginRight: 10, marginTop: 2 },
  rowText: { fontSize: 14, color: '#333', flex: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#999' },
  value: { fontSize: 14, color: '#333', fontWeight: 'bold' },
  momoBar: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  momoText: { fontSize: 15, fontWeight: 'bold', color: '#1a73e8' },
  momoArrow: { fontSize: 20, color: '#1a73e8' },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  costLabel: { fontSize: 14, color: '#666' },
  costValue: { fontSize: 14, color: '#333' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, marginTop: 4 },
  totalLabel: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 15, fontWeight: 'bold', color: '#e8a01a' },
  noteBar: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  noteIcon: { fontSize: 16, marginRight: 8 },
  noteText: { fontSize: 12, color: '#666', flex: 1 },
  payBtn: { backgroundColor: '#1a73e8', padding: 18, alignItems: 'center' },
  payText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});