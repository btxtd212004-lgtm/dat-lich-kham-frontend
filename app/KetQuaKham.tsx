import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

export default function KetQuaKhamScreen() {
  const router = useRouter();
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const [lichSu, setLichSu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDanhGia, setShowDanhGia] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadLichSu();
    }, [])
  );

  const loadLichSu = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments/my`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const filtered = data.data.filter((item: any) => {
          const now = new Date();
          const ngayKham = new Date(item.date);
          const [h, m] = item.end_time.split(':').map(Number);
          ngayKham.setHours(h, m, 0, 0);
          return now > ngayKham && item.status !== 'cancelled' &&
            String(item.profile_id) === String(profileId);
        });
        setLichSu(filtered);
      }
    } catch (err) {
      setLichSu([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const guiDanhGia = async (appointmentId: number, doctorId: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ appointment_id: appointmentId, doctor_id: doctorId, rating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Thành công', 'Cảm ơn bạn đã đánh giá!');
        setShowDanhGia(null);
        setRating(5);
        setComment('');
        loadLichSu();
      } else {
        Alert.alert('Lỗi', data.message);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không kết nối được server!');
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết quả khám bệnh</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 50 }} />
        ) : lichSu.length > 0 ? (
          lichSu.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.khoa}>{item.department_name}</Text>
                <Text style={styles.ngay}>{formatDate(item.date)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.label}>Bác sĩ</Text>
                <Text style={styles.value}>{item.doctor_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Giờ khám</Text>
                <Text style={styles.value}>{item.start_time?.slice(0,5)} - {item.end_time?.slice(0,5)}</Text>
              </View>
              {item.diagnosis ? (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Chẩn đoán</Text>
                    <Text style={styles.value}>{item.diagnosis}</Text>
                  </View>
                  {item.prescription && (
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Đơn thuốc</Text>
                      <Text style={styles.value}>{item.prescription}</Text>
                    </View>
                  )}
                  {item.treatment_notes && (
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Ghi chú</Text>
                      <Text style={styles.value}>{item.treatment_notes}</Text>
                    </View>
                  )}
                  {item.follow_up_date && (
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Tái khám</Text>
                      <Text style={styles.value}>{formatDate(item.follow_up_date)}</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.danhGiaBtn}
                    onPress={() => { setShowDanhGia(item.id); setRating(5); setComment(''); }}>
                    <Text style={styles.danhGiaBtnText}>⭐ Đánh giá bác sĩ</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.chuaCoKetQua}>Chưa có kết quả khám</Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Chưa có kết quả khám</Text>
            <Text style={styles.emptyDesc}>Lịch sử khám bệnh sẽ hiển thị tại đây</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showDanhGia !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Đánh giá bác sĩ</Text>
            <View style={styles.starRow}>
              {[1,2,3,4,5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Text style={{ fontSize: 36 }}>{s <= rating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.commentInput} placeholder="Nhận xét của bạn..."
              value={comment} onChangeText={setComment} multiline numberOfLines={3} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowDanhGia(null)}>
                <Text style={styles.cancelModalText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn}
                onPress={() => {
                  const item = lichSu.find(i => i.id === showDanhGia);
                  if (item) guiDanhGia(item.id, item.doctor_id);
                }}>
                <Text style={styles.submitBtnText}>Gửi đánh giá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1a73e8', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50 },
  back: { fontSize: 24, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  container: { flex: 1, padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  khoa: { fontSize: 16, fontWeight: 'bold', color: '#1a73e8', flex: 1 },
  ngay: { fontSize: 13, color: '#999' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 13, color: '#999', flex: 1 },
  value: { fontSize: 13, color: '#333', fontWeight: 'bold', flex: 2, textAlign: 'right' },
  chuaCoKetQua: { fontSize: 13, color: '#999', textAlign: 'center', marginTop: 8, fontStyle: 'italic' },
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#666', textAlign: 'center' },
  danhGiaBtn: { borderWidth: 1, borderColor: '#f0a500', borderRadius: 20, padding: 10, alignItems: 'center', marginTop: 10 },
  danhGiaBtnText: { color: '#f0a500', fontSize: 14, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 16 },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16, gap: 8 },
  commentInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 16, textAlignVertical: 'top' },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelModalBtn: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelModalText: { color: '#666', fontSize: 15 },
  submitBtn: { flex: 1, backgroundColor: '#1a73e8', borderRadius: 10, padding: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});