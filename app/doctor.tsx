import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

export default function DoctorScreen() {
  const router = useRouter();
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [currentQueue, setCurrentQueue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  // Modal bệnh án
  const [showRecord, setShowRecord] = useState(false);
  const [recordAppt, setRecordAppt] = useState<any>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [recordNotes, setRecordNotes] = useState('');
  const [savingRecord, setSavingRecord] = useState(false);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);

  const getToken = () => AsyncStorage.getItem('token');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const headers = { 'Authorization': `Bearer ${token}` };
      const [meRes, qRes] = await Promise.all([
        fetch(`${API_URL}/api/doctor/me`, { headers }),
        fetch(`${API_URL}/api/doctor/queue?date=${selectedDate}`, { headers }),
      ]);
      const [me, q] = await Promise.all([meRes.json(), qRes.json()]);
      if (me.success) setDoctorInfo(me.data);
      if (q.success) { setQueue(q.data); setCurrentQueue(q.current_queue || 0); }
    } catch { Alert.alert('Lỗi', 'Không kết nối được server'); }
    setLoading(false);
  }, [selectedDate]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const logout = async () => { await AsyncStorage.clear(); router.replace('/'); };

  const callPatient = async (appt: any) => {
    Alert.alert('Gọi bệnh nhân', `Gọi số #${appt.queue_number} - ${appt.patient_name}?`, [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Gọi', onPress: async () => {
        const token = await getToken();
        const res = await fetch(`${API_URL}/api/doctor/appointments/${appt.id}/call`, {
          method: 'PUT', headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) { Alert.alert('✅', `Đã gọi số #${appt.queue_number}`); loadData(); }
        else Alert.alert('Lỗi', data.message);
      }},
    ]);
  };

  const openRecord = async (appt: any) => {
    setRecordAppt(appt);
    setDiagnosis(appt.diagnosis || '');
    setPrescription('');
    setRecordNotes('');
    setPatientHistory([]);
    setShowRecord(true);
    const token = await getToken();
    const headers = { 'Authorization': `Bearer ${token}` };
    // Load bệnh án hiện tại nếu đã có
    if (appt.record_id) {
      try {
        const res = await fetch(`${API_URL}/api/doctor/appointments/${appt.id}/record`, { headers });
        const data = await res.json();
        if (data.success) {
          setDiagnosis(data.data.diagnosis || '');
          setPrescription(data.data.prescription || '');
          setRecordNotes(data.data.notes || '');
        }
      } catch {}
    }
    // Load lịch sử khám cũ của bệnh nhân này (các lần khám khác, đã xong)
    try {
      const res = await fetch(
        `${API_URL}/api/doctor/patient-history/${appt.profile_id}?exclude=${appt.id}`,
        { headers }
      );
      const data = await res.json();
      if (data.success) setPatientHistory(data.data || []);
    } catch {}
  };

  const saveRecord = async () => {
    if (!diagnosis) return Alert.alert('Lỗi', 'Vui lòng nhập chẩn đoán');
    setSavingRecord(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/doctor/appointments/${recordAppt.id}/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ diagnosis, prescription, notes: recordNotes }),
      });
      const data = await res.json();
      if (data.success) { setShowRecord(false); loadData(); Alert.alert('✅', 'Đã lưu bệnh án'); }
      else Alert.alert('Lỗi', data.message);
    } catch { Alert.alert('Lỗi', 'Không kết nối được server'); }
    setSavingRecord(false);
  };

  const waitingList  = queue.filter(a => a.status === 'waiting');
  const inProgress   = queue.filter(a => a.status === 'in_progress');
  const doneList     = queue.filter(a => a.status === 'done');

  const calcAge = (dob: string) => {
    if (!dob) return '';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 3600 * 1000)) + ' tuổi';
  };

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>👨‍⚕️ {doctorInfo?.full_name || 'Bác sĩ'}</Text>
          <Text style={styles.headerSub}>{doctorInfo?.department_name} • {doctorInfo?.specialty}</Text>
        </View>
        <TouchableOpacity onPress={logout}><Text style={styles.logoutBtn}>Đăng xuất</Text></TouchableOpacity>
      </View>

      {/* Chọn ngày */}
      <View style={styles.dateRow}>
        <Text style={styles.dateLabel}>📅 Ngày làm việc:</Text>
        <TextInput
          style={styles.dateInput}
          value={selectedDate}
          onChangeText={setSelectedDate}
          placeholder="YYYY-MM-DD"
          onBlur={loadData}
        />
        <TouchableOpacity style={styles.refreshBtn} onPress={loadData}>
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: '#fff3e0' }]}>
          <Text style={styles.statNum}>{currentQueue}</Text>
          <Text style={styles.statLbl}>Đang gọi</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#e3f2fd' }]}>
          <Text style={styles.statNum}>{waitingList.length}</Text>
          <Text style={styles.statLbl}>Chờ khám</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#fce4ec' }]}>
          <Text style={styles.statNum}>{inProgress.length}</Text>
          <Text style={styles.statLbl}>Đang khám</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#e8f5e9' }]}>
          <Text style={styles.statNum}>{doneList.length}</Text>
          <Text style={styles.statLbl}>Đã xong</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1a73e8" style={{ flex: 1 }} />
      ) : (
        <ScrollView style={styles.body}>

          {/* Đang khám */}
          {inProgress.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>🟡 Đang khám</Text>
              {inProgress.map(a => (
                <View key={a.id} style={[styles.patientCard, { borderLeftColor: '#e8a01a' }]}>
                  <View style={styles.patientTop}>
                    <Text style={styles.qNum}>#{a.queue_number}</Text>
                    <Text style={styles.patientName}>{a.patient_name}</Text>
                    <Text style={styles.patientAge}>{calcAge(a.date_of_birth)}</Text>
                  </View>
                  {a.insurance_number ? <Text style={styles.patientInfo}>🏥 BHYT: {a.insurance_number}</Text> : null}
                  {a.patient_notes ? <Text style={styles.patientInfo}>📝 {a.patient_notes}</Text> : null}
                  <TouchableOpacity style={styles.recordBtn} onPress={() => openRecord(a)}>
                    <Text style={styles.recordBtnText}>📋 {a.record_id ? 'Xem/Sửa bệnh án' : 'Nhập bệnh án & Hoàn tất'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {/* Chờ khám */}
          <Text style={styles.sectionTitle}>🔵 Hàng đợi ({waitingList.length} người)</Text>
          {waitingList.length === 0 ? (
            <Text style={styles.emptyText}>Không có bệnh nhân chờ khám</Text>
          ) : waitingList.map(a => (
            <View key={a.id} style={[styles.patientCard, { borderLeftColor: '#1a73e8' }]}>
              <View style={styles.patientTop}>
                <Text style={styles.qNum}>#{a.queue_number}</Text>
                <Text style={styles.patientName}>{a.patient_name}</Text>
                <Text style={styles.patientAge}>{a.gender === 'male' ? '♂' : '♀'} {calcAge(a.date_of_birth)}</Text>
              </View>
              {a.insurance_number ? <Text style={styles.patientInfo}>🏥 BHYT: {a.insurance_number}</Text> : null}
              {a.patient_notes ? <Text style={styles.patientInfo}>📝 {a.patient_notes}</Text> : null}
              <TouchableOpacity style={styles.callBtn} onPress={() => callPatient(a)}>
                <Text style={styles.callBtnText}>📢 Gọi vào khám</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Đã xong */}
          {doneList.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>✅ Đã khám xong ({doneList.length})</Text>
              {doneList.map(a => (
                <View key={a.id} style={[styles.patientCard, { borderLeftColor: '#2e7d32', opacity: 0.75 }]}>
                  <View style={styles.patientTop}>
                    <Text style={styles.qNum}>#{a.queue_number}</Text>
                    <Text style={styles.patientName}>{a.patient_name}</Text>
                    <Text style={[styles.patientAge, { color: '#2e7d32' }]}>Xong</Text>
                  </View>
                  {a.diagnosis ? <Text style={styles.patientInfo}>🩺 {a.diagnosis}</Text> : null}
                </View>
              ))}
            </>
          )}

          {queue.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 48 }}>🗓️</Text>
              <Text style={styles.emptyTitle}>Không có lịch hẹn nào</Text>
              <Text style={styles.emptyText}>trong ngày {selectedDate}</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Modal nhập bệnh án */}
      <Modal visible={showRecord} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalBox}>
            <Text style={styles.modalTitle}>📋 Bệnh án</Text>
            <Text style={styles.modalPatient}>
              Bệnh nhân: <Text style={{ fontWeight: 'bold' }}>{recordAppt?.patient_name}</Text>  •  #{recordAppt?.queue_number}
            </Text>

            <Text style={styles.fieldLabel}>Chẩn đoán *</Text>
            <TextInput
              style={[styles.fieldInput, { height: 80 }]}
              value={diagnosis}
              onChangeText={setDiagnosis}
              placeholder="Nhập chẩn đoán của bác sĩ..."
              multiline
            />

            <Text style={styles.fieldLabel}>Đơn thuốc / Chỉ định</Text>
            <TextInput
              style={[styles.fieldInput, { height: 100 }]}
              value={prescription}
              onChangeText={setPrescription}
              placeholder="Thuốc, liều dùng, hướng dẫn..."
              multiline
            />

            <Text style={styles.fieldLabel}>Ghi chú thêm</Text>
            <TextInput
              style={[styles.fieldInput, { height: 60 }]}
              value={recordNotes}
              onChangeText={setRecordNotes}
              placeholder="Lịch tái khám, xét nghiệm cần làm..."
              multiline
            />

            {/* Lịch sử khám cũ */}
            {patientHistory.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={[styles.fieldLabel, { fontSize: 15, color: '#1a73e8' }]}>
                  📂 Lịch sử khám ({patientHistory.length} lần)
                </Text>
                {patientHistory.map((h: any, i: number) => (
                  <View key={i} style={styles.historyItem}>
                    <Text style={styles.historyDate}>
                      📅 {h.date}  •  {h.department_name}
                    </Text>
                    {h.diagnosis ? (
                      <Text style={styles.historyText}>🩺 {h.diagnosis}</Text>
                    ) : null}
                    {h.prescription ? (
                      <Text style={styles.historyText}>💊 {h.prescription}</Text>
                    ) : null}
                    {h.notes ? (
                      <Text style={styles.historyText}>📝 {h.notes}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#eee', flex: 1 }]} onPress={() => setShowRecord(false)}>
                <Text style={{ textAlign: 'center', color: '#333', fontWeight: 'bold' }}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { flex: 1 }]} onPress={saveRecord} disabled={savingRecord}>
                {savingRecord
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>✅ Lưu & Hoàn tất</Text>
                }
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1a73e8', padding: 16, paddingTop: 52, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: '#c8e0ff', marginTop: 2 },
  logoutBtn: { color: '#fff', fontSize: 13, opacity: 0.85, paddingTop: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  dateLabel: { fontSize: 13, color: '#555' },
  dateInput: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 8, fontSize: 14, borderWidth: 1, borderColor: '#ddd' },
  refreshBtn: { padding: 8 },
  refreshText: { fontSize: 20 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  statBox: { flex: 1, borderRadius: 10, padding: 10, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  statLbl: { fontSize: 10, color: '#666', marginTop: 2 },
  body: { flex: 1, padding: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#444', marginBottom: 8, marginTop: 4 },
  patientCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4 },
  patientTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 10 },
  qNum: { fontSize: 20, fontWeight: 'bold', color: '#1a73e8', minWidth: 44 },
  patientName: { fontSize: 15, fontWeight: 'bold', color: '#222', flex: 1 },
  patientAge: { fontSize: 13, color: '#888' },
  patientInfo: { fontSize: 13, color: '#555', marginBottom: 4 },
  callBtn: { backgroundColor: '#1a73e8', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 8 },
  callBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  recordBtn: { backgroundColor: '#e8f5e9', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 8 },
  recordBtnText: { color: '#2e7d32', fontSize: 14, fontWeight: 'bold' },
  historyItem: { backgroundColor: '#f0f6ff', borderRadius: 8, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#1a73e8' },
  historyDate: { fontSize: 13, fontWeight: 'bold', color: '#1a73e8', marginBottom: 4 },
  historyText: { fontSize: 13, color: '#333', marginTop: 2, lineHeight: 18 },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginTop: 12 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 6, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: '#222' },
  modalPatient: { fontSize: 14, color: '#666', marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: '#555', marginBottom: 6, fontWeight: '600' },
  fieldInput: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 14, borderWidth: 1, borderColor: '#eee', textAlignVertical: 'top' },
  modalBtn: { backgroundColor: '#1a73e8', borderRadius: 10, padding: 14 },
});