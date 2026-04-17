import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

export default function XacNhanScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { profileId, scheduleId, khoa, dichVu, ngay, gio, buoi, gia } = useLocalSearchParams<{
  profileId: string;
  scheduleId: string;
  khoa: string;
  dichVu: string;
  ngay: string;
  gio: string;
  buoi: string;
  gia: string;
}>();

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
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Chưa cập nhật';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận thông tin</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1a73e8" style={{ flex: 1 }} />
      ) : (
        <ScrollView style={styles.container}>
          <Text style={styles.sectionTitle}>THÔNG TIN BỆNH NHÂN</Text>
          <View style={styles.table}>
            <View style={styles.row}><Text style={styles.label}>Họ và tên</Text><Text style={styles.value}>{profile?.full_name?.toUpperCase() || 'Chưa cập nhật'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Ngày sinh</Text><Text style={styles.value}>{formatDate(profile?.date_of_birth)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Giới tính</Text><Text style={styles.value}>{profile?.gender === 'male' ? 'Nam' : profile?.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>CMND/CCCD</Text><Text style={styles.value}>{profile?.cccd || 'Chưa cập nhật'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Mã BHYT</Text><Text style={styles.value}>{profile?.insurance_number || 'Chưa cập nhật'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Nghề nghiệp</Text><Text style={styles.value}>{profile?.occupation || 'Chưa cập nhật'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Số điện thoại</Text><Text style={styles.value}>{user?.phone || 'Chưa cập nhật'}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Địa chỉ</Text><Text style={styles.value}>{profile?.address || 'Chưa cập nhật'}</Text></View>
          </View>

        <Text style={styles.sectionTitle}>THÔNG TIN LỊCH KHÁM</Text>
        <View style={styles.table}>
          <View style={styles.row}><Text style={styles.label}>Chuyên khoa</Text><Text style={styles.value}>{khoa}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Dịch vụ</Text><Text style={styles.value}>{dichVu}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Ngày khám</Text><Text style={styles.value}>{ngay}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Buổi & Giờ</Text><Text style={styles.value}>{buoi} - {gio}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Phí khám</Text><Text style={styles.value}>{gia}</Text></View>
        </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <TouchableOpacity style={styles.datKhamBtn} onPress={() => router.push({
        pathname: '/ThanhToan',
        params: { scheduleId, profileId, khoa, dichVu, ngay, gio, buoi, gia }
      })}>
        <Text style={styles.datKhamText}>ĐẶT KHÁM</Text>
      </TouchableOpacity>
         </View>
       );
      }

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#1a73e8', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50 },
  back: { fontSize: 24, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  container: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 16, marginBottom: 8 },
  table: { borderTopWidth: 1, borderTopColor: '#eee' },
  row: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  label: { fontSize: 14, color: '#999', width: 140 },
  value: { fontSize: 14, color: '#333', flex: 1 },
  datKhamBtn: { backgroundColor: '#1a73e8', padding: 18, alignItems: 'center', position: 'absolute', bottom: 0, left: 0, right: 0 },
  datKhamText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});