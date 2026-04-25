import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, Modal, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../constants/api';

type Tab = 'dashboard' | 'schedules' | 'doctors' | 'appointments' | 'news';

export default function AdminScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal thêm bác sĩ
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState<any>(null);
  const [dFullName, setDFullName] = useState('');
  const [dPhone, setDPhone] = useState('');
  const [dPassword, setDPassword] = useState('');
  const [dSpecialty, setDSpecialty] = useState('');
  const [dBio, setDBio] = useState('');
  const [dDeptId, setDDeptId] = useState('');

  // Modal thêm lịch
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editSchedule, setEditSchedule] = useState<any>(null);
  const [sDoctorId, setSDoctorId] = useState('');
  const [sDeptId, setSDeptId] = useState('');
  const [sDate, setSDate] = useState('');
  const [sStart, setSStart] = useState('');
  const [sEnd, setSEnd] = useState('');
  const [sMax, setSMax] = useState('20');

  // Lọc lịch hẹn
  const [apptDate, setApptDate] = useState('');

  // ── TIN TỨC ──
  const [news, setNews] = useState<any[]>([]);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editNews, setEditNews] = useState<any>(null);
  const [nTitle, setNTitle] = useState('');
  const [nContent, setNContent] = useState('');
  const [nImageUrl, setNImageUrl] = useState('');
  const [nImageUri, setNImageUri] = useState(''); // local preview

  const getToken = () => AsyncStorage.getItem('token');

  const loadAll = useCallback(async () => {
    setLoading(true);
    const token = await getToken();
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [sRes, docRes, depRes, apptRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, { headers }),
        fetch(`${API_URL}/api/admin/doctors`, { headers }),
        fetch(`${API_URL}/api/admin/departments`, { headers }),
        fetch(`${API_URL}/api/admin/schedules`, { headers }),
      ]);
      const [s, d, dep, sch] = await Promise.all([sRes.json(), docRes.json(), depRes.json(), apptRes.json()]);
      if (s.success) setStats(s.data);
      if (d.success) setDoctors(d.data);
      if (dep.success) setDepartments(dep.data);
      if (sch.success) setSchedules(sch.data);
    } catch { Alert.alert('Lỗi', 'Không kết nối được server'); }
    setLoading(false);
  }, []);

  const loadAppointments = useCallback(async () => {
    const token = await getToken();
    const url = apptDate
      ? `${API_URL}/api/admin/appointments?date=${apptDate}`
      : `${API_URL}/api/admin/appointments`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (data.success) setAppointments(data.data);
  }, [apptDate]);

  const loadNews = useCallback(async () => {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/admin/news`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (data.success) setNews(data.data);
  }, []);

  useFocusEffect(useCallback(() => { loadAll(); }, [loadAll]));

  const logout = async () => {
    await AsyncStorage.clear();
    router.replace('/');
  };

  // ─── BÁC SĨ ─────────────────────────────────────────────
  const openAddDoctor = () => {
    setEditDoctor(null);
    setDFullName(''); setDPhone(''); setDPassword('');
    setDSpecialty(''); setDBio(''); setDDeptId('');
    setShowDoctorModal(true);
  };
  const openEditDoctor = (d: any) => {
    setEditDoctor(d);
    setDFullName(d.full_name); setDPhone(d.phone); setDPassword('');
    setDSpecialty(d.specialty || ''); setDBio(d.bio || ''); setDDeptId(String(d.department_id || ''));
    setShowDoctorModal(true);
  };
  const saveDoctor = async () => {
    if (!dFullName || !dDeptId) return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
    const token = await getToken();
    if (editDoctor) {
      const res = await fetch(`${API_URL}/api/admin/doctors/${editDoctor.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ full_name: dFullName, department_id: dDeptId, specialty: dSpecialty, bio: dBio, password: dPassword || undefined }),
      });
      const data = await res.json();
      if (data.success) { setShowDoctorModal(false); loadAll(); }
      else Alert.alert('Lỗi', data.message);
    } else {
      if (!dPhone || !dPassword) return Alert.alert('Lỗi', 'Vui lòng nhập SĐT và mật khẩu');
      const res = await fetch(`${API_URL}/api/admin/doctors`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ full_name: dFullName, phone: dPhone, password: dPassword, department_id: dDeptId, specialty: dSpecialty, bio: dBio }),
      });
      const data = await res.json();
      if (data.success) { setShowDoctorModal(false); loadAll(); Alert.alert('Thành công', 'Đã tạo tài khoản bác sĩ'); }
      else Alert.alert('Lỗi', data.message);
    }
  };
  const deleteDoctor = (d: any) => {
    Alert.alert('Xoá bác sĩ', `Xoá bác sĩ ${d.full_name}?`, [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: async () => {
        const token = await getToken();
        const res = await fetch(`${API_URL}/api/admin/doctors/${d.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) loadAll();
        else Alert.alert('Lỗi', data.message);
      }},
    ]);
  };

  // ─── LỊCH LÀM VIỆC ──────────────────────────────────────
  const openAddSchedule = () => {
    setEditSchedule(null);
    setSDoctorId(''); setSDeptId(''); setSDate(''); setSStart(''); setSEnd(''); setSMax('20');
    setShowScheduleModal(true);
  };
  const openEditSchedule = (s: any) => {
    setEditSchedule(s);
    setSDoctorId(String(s.doctor_id)); setSDeptId(String(s.department_id));
    setSDate(s.date?.slice(0,10)); setSStart(s.start_time?.slice(0,5)); setSEnd(s.end_time?.slice(0,5)); setSMax(String(s.max_patients));
    setShowScheduleModal(true);
  };
  const saveSchedule = async () => {
    if (!sDoctorId || !sDeptId || !sDate || !sStart || !sEnd)
      return Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
    const token = await getToken();
    const body = { doctor_id: sDoctorId, department_id: sDeptId, date: sDate, start_time: sStart, end_time: sEnd, max_patients: parseInt(sMax) || 20 };
    const url = editSchedule ? `${API_URL}/api/admin/schedules/${editSchedule.id}` : `${API_URL}/api/admin/schedules`;
    const res = await fetch(url, {
      method: editSchedule ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) { setShowScheduleModal(false); loadAll(); }
    else Alert.alert('Lỗi', data.message);
  };
  const deleteSchedule = (s: any) => {
    Alert.alert('Xoá lịch', `Xoá lịch ngày ${s.date?.slice(0,10)}?`, [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: async () => {
        const token = await getToken();
        const res = await fetch(`${API_URL}/api/admin/schedules/${s.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) loadAll();
        else Alert.alert('Lỗi', data.message);
      }},
    ]);
  };

  // ─── TIN TỨC ────────────────────────────────────────────
  const openAddNews = () => {
    setEditNews(null);
    setNTitle(''); setNContent(''); setNImageUrl(''); setNImageUri('');
    setShowNewsModal(true);
  };
  const openEditNews = (n: any) => {
    setEditNews(n);
    setNTitle(n.title); setNContent(n.content);
    setNImageUrl(n.image_url || ''); setNImageUri(n.image_url || '');
    setShowNewsModal(true);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      // Dùng base64 data URI để preview và gửi lên server
      const base64Uri = `data:image/jpeg;base64,${asset.base64}`;
      setNImageUri(asset.uri);
      setNImageUrl(base64Uri);
    }
  };

  const saveNews = async () => {
    if (!nTitle || !nContent) return Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề và nội dung');
    const token = await getToken();
    const url = editNews ? `${API_URL}/api/admin/news/${editNews.id}` : `${API_URL}/api/admin/news`;
    const res = await fetch(url, {
      method: editNews ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: nTitle, content: nContent, image_url: nImageUrl || null }),
    });
    const data = await res.json();
    if (data.success) { setShowNewsModal(false); loadNews(); Alert.alert('Thành công', editNews ? 'Đã cập nhật tin tức' : 'Đã thêm tin tức'); }
    else Alert.alert('Lỗi', data.message);
  };

  const deleteNews = (n: any) => {
    Alert.alert('Xoá tin tức', `Xoá "${n.title}"?`, [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: async () => {
        const token = await getToken();
        const res = await fetch(`${API_URL}/api/admin/news/${n.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) loadNews();
        else Alert.alert('Lỗi', data.message);
      }},
    ]);
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    const dt = new Date(d); return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
  };

  // ─── RENDER ──────────────────────────────────────────────
  return (
    <View style={styles.wrapper}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>🛡️ Quản trị viên</Text>
        <TouchableOpacity onPress={logout}><Text style={styles.logoutBtn}>Đăng xuất</Text></TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['dashboard','schedules','doctors','appointments','news'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab===t && styles.tabActive]} onPress={() => {
            setTab(t);
            if (t === 'appointments') loadAppointments();
            if (t === 'news') loadNews();
          }}>
            <Text style={[styles.tabText, tab===t && styles.tabTextActive]}>
              {t==='dashboard'?'📊':t==='schedules'?'📅':t==='doctors'?'👨‍⚕️':t==='appointments'?'📋':'📰'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator size="large" color="#1a73e8" style={{ flex: 1 }} /> : (

        <ScrollView style={styles.body}>

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && stats && (
            <View>
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
                  <Text style={styles.statNum}>{stats.total_doctors}</Text>
                  <Text style={styles.statLabel}>Bác sĩ</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
                  <Text style={styles.statNum}>{stats.total_schedules}</Text>
                  <Text style={styles.statLabel}>Lịch hôm nay</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
                  <Text style={styles.statNum}>{stats.waiting}</Text>
                  <Text style={styles.statLabel}>Đang chờ</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#fce4ec' }]}>
                  <Text style={styles.statNum}>{stats.total_patients}</Text>
                  <Text style={styles.statLabel}>Bệnh nhân</Text>
                </View>
              </View>
              <Text style={styles.sectionTitle}>Lịch hôm nay</Text>
              {schedules.filter(s => s.date?.slice(0,10) === new Date().toISOString().slice(0,10)).map(s => (
                <View key={s.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{s.doctor_name}</Text>
                  <Text style={styles.cardSub}>{s.department_name} • {s.start_time?.slice(0,5)}–{s.end_time?.slice(0,5)}</Text>
                  <Text style={styles.cardSub}>{s.booked_count}/{s.max_patients} bệnh nhân đã đặt</Text>
                </View>
              ))}
            </View>
          )}

          {/* ── LỊCH LÀM VIỆC ── */}
          {tab === 'schedules' && (
            <View>
              <TouchableOpacity style={styles.addBtn} onPress={openAddSchedule}>
                <Text style={styles.addBtnText}>+ Thêm lịch mới</Text>
              </TouchableOpacity>
              {schedules.map(s => (
                <View key={s.id} style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{s.doctor_name}</Text>
                      <Text style={styles.cardSub}>{s.department_name}</Text>
                      <Text style={styles.cardSub}>📅 {formatDate(s.date)} • {s.start_time?.slice(0,5)}–{s.end_time?.slice(0,5)}</Text>
                      <Text style={styles.cardSub}>👥 {s.booked_count}/{s.max_patients} bệnh nhân</Text>
                    </View>
                    <View>
                      <TouchableOpacity style={styles.editBtn} onPress={() => openEditSchedule(s)}>
                        <Text style={styles.editBtnText}>Sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.delBtn} onPress={() => deleteSchedule(s)}>
                        <Text style={styles.delBtnText}>Xoá</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── BÁC SĨ ── */}
          {tab === 'doctors' && (
            <View>
              <TouchableOpacity style={styles.addBtn} onPress={openAddDoctor}>
                <Text style={styles.addBtnText}>+ Thêm bác sĩ mới</Text>
              </TouchableOpacity>
              {doctors.map(d => (
                <View key={d.id} style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{d.full_name}</Text>
                      <Text style={styles.cardSub}>📱 {d.phone}</Text>
                      <Text style={styles.cardSub}>🏥 {d.department_name}</Text>
                      <Text style={styles.cardSub}>🎓 {d.specialty || 'Chưa cập nhật'}</Text>
                    </View>
                    <View>
                      <TouchableOpacity style={styles.editBtn} onPress={() => openEditDoctor(d)}>
                        <Text style={styles.editBtnText}>Sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.delBtn} onPress={() => deleteDoctor(d)}>
                        <Text style={styles.delBtnText}>Xoá</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── LỊCH HẸN ── */}
          {tab === 'appointments' && (
            <View>
              <View style={styles.filterRow}>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Lọc theo ngày YYYY-MM-DD"
                  value={apptDate}
                  onChangeText={setApptDate}
                />
                <TouchableOpacity style={styles.filterBtn} onPress={loadAppointments}>
                  <Text style={styles.filterBtnText}>Lọc</Text>
                </TouchableOpacity>
              </View>
              {appointments.map(a => (
                <View key={a.id} style={styles.card}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={styles.cardTitle}>#{a.queue_number} • {a.patient_name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor(a.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: statusColor(a.status) }]}>{statusLabel(a.status)}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardSub}>👨‍⚕️ {a.doctor_name} • {a.department_name}</Text>
                  <Text style={styles.cardSub}>📅 {formatDate(a.date)} • {a.start_time?.slice(0,5)}–{a.end_time?.slice(0,5)}</Text>
                </View>
              ))}
              {appointments.length === 0 && (
                <Text style={styles.emptyText}>Không có lịch hẹn nào{apptDate ? ' cho ngày này' : ''}</Text>
              )}
            </View>
          )}

          {/* ── TIN TỨC ── */}
          {tab === 'news' && (
            <View>
              <TouchableOpacity style={styles.addBtn} onPress={openAddNews}>
                <Text style={styles.addBtnText}>+ Thêm tin tức mới</Text>
              </TouchableOpacity>
              {news.length === 0 && (
                <Text style={styles.emptyText}>Chưa có tin tức nào</Text>
              )}
              {news.map(n => (
                <View key={n.id} style={styles.card}>
                  {n.image_url ? (
                    <Image source={{ uri: n.image_url }} style={styles.newsImage} resizeMode="cover" />
                  ) : null}
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{n.title}</Text>
                      <Text style={styles.cardSub} numberOfLines={2}>{n.content}</Text>
                      <Text style={[styles.cardSub, { color: '#aaa', marginTop: 4 }]}>🕐 {formatDate(n.created_at)}</Text>
                    </View>
                    <View>
                      <TouchableOpacity style={styles.editBtn} onPress={() => openEditNews(n)}>
                        <Text style={styles.editBtnText}>Sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.delBtn} onPress={() => deleteNews(n)}>
                        <Text style={styles.delBtnText}>Xoá</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Modal thêm/sửa bác sĩ */}
      <Modal visible={showDoctorModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editDoctor ? 'Sửa thông tin bác sĩ' : 'Thêm bác sĩ mới'}</Text>

            <Text style={styles.fieldLabel}>Họ và tên *</Text>
            <TextInput style={styles.fieldInput} value={dFullName} onChangeText={setDFullName} placeholder="Nguyễn Văn An" />

            {!editDoctor && <>
              <Text style={styles.fieldLabel}>Số điện thoại *</Text>
              <TextInput style={styles.fieldInput} value={dPhone} onChangeText={setDPhone} keyboardType="phone-pad" placeholder="0901234567" />
            </>}

            <Text style={styles.fieldLabel}>{editDoctor ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}</Text>
            <TextInput style={styles.fieldInput} value={dPassword} onChangeText={setDPassword} secureTextEntry placeholder="Mật khẩu" />

            <Text style={styles.fieldLabel}>Chuyên khoa *</Text>
            <View style={styles.deptList}>
              {departments.map(d => (
                <TouchableOpacity key={d.id} style={[styles.deptItem, dDeptId === String(d.id) && styles.deptItemActive]}
                  onPress={() => setDDeptId(String(d.id))}>
                  <Text style={[styles.deptItemText, dDeptId === String(d.id) && styles.deptItemTextActive]}>{d.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Chuyên môn</Text>
            <TextInput style={styles.fieldInput} value={dSpecialty} onChangeText={setDSpecialty} placeholder="VD: Nội tổng quát" />

            <Text style={styles.fieldLabel}>Giới thiệu</Text>
            <TextInput style={[styles.fieldInput, { height: 80 }]} value={dBio} onChangeText={setDBio} placeholder="Mô tả ngắn về bác sĩ..." multiline />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#eee', flex: 1 }]} onPress={() => setShowDoctorModal(false)}>
                <Text style={{ textAlign: 'center', color: '#333', fontWeight: 'bold' }}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { flex: 1 }]} onPress={saveDoctor}>
                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Modal thêm/sửa lịch */}
      <Modal visible={showScheduleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editSchedule ? 'Sửa lịch làm việc' : 'Thêm lịch làm việc'}</Text>

            <Text style={styles.fieldLabel}>Chọn bác sĩ *</Text>
            <View style={styles.deptList}>
              {doctors.map(d => (
                <TouchableOpacity key={d.id} style={[styles.deptItem, sDoctorId === String(d.id) && styles.deptItemActive]}
                  onPress={() => { setSDoctorId(String(d.id)); setSDeptId(String(d.department_id)); }}>
                  <Text style={[styles.deptItemText, sDoctorId === String(d.id) && styles.deptItemTextActive]}>
                    {d.full_name}
                    {d.department_name ? ` — ${d.department_name}` : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Chuyên khoa *</Text>
            {sDoctorId ? (
              // Khi đã chọn bác sĩ → hiện khoa của bác sĩ đó, không cho đổi
              (() => {
                const selectedDoc = doctors.find(d => String(d.id) === sDoctorId);
                return (
                  <View style={[styles.deptItem, styles.deptItemActive, { marginBottom: 4 }]}>
                    <Text style={[styles.deptItemText, styles.deptItemTextActive]}>
                      {selectedDoc?.department_name || 'Không rõ khoa'}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                      🔒 Tự động theo bác sĩ đã chọn
                    </Text>
                  </View>
                );
              })()
            ) : (
              <View style={[styles.deptItem, { opacity: 0.4 }]}>
                <Text style={styles.deptItemText}>← Chọn bác sĩ trước</Text>
              </View>
            )}

            <Text style={styles.fieldLabel}>Ngày làm việc * (YYYY-MM-DD)</Text>
            <TextInput style={styles.fieldInput} value={sDate} onChangeText={setSDate} placeholder="2026-04-10" />

            <Text style={styles.fieldLabel}>Giờ bắt đầu * (HH:MM)</Text>
            <TextInput style={styles.fieldInput} value={sStart} onChangeText={setSStart} placeholder="07:30" />

            <Text style={styles.fieldLabel}>Giờ kết thúc * (HH:MM)</Text>
            <TextInput style={styles.fieldInput} value={sEnd} onChangeText={setSEnd} placeholder="11:30" />

            <Text style={styles.fieldLabel}>Số bệnh nhân tối đa</Text>
            <TextInput style={styles.fieldInput} value={sMax} onChangeText={setSMax} keyboardType="numeric" placeholder="20" />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#eee', flex: 1 }]} onPress={() => setShowScheduleModal(false)}>
                <Text style={{ textAlign: 'center', color: '#333', fontWeight: 'bold' }}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { flex: 1 }]} onPress={saveSchedule}>
                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Modal thêm/sửa tin tức */}
      <Modal visible={showNewsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editNews ? 'Sửa tin tức' : 'Thêm tin tức mới'}</Text>

            <Text style={styles.fieldLabel}>Tiêu đề *</Text>
            <TextInput style={styles.fieldInput} value={nTitle} onChangeText={setNTitle} placeholder="Tiêu đề tin tức..." />

            <Text style={styles.fieldLabel}>Nội dung *</Text>
            <TextInput
              style={[styles.fieldInput, { height: 120 }]}
              value={nContent}
              onChangeText={setNContent}
              placeholder="Nội dung tin tức..."
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.fieldLabel}>Ảnh đại diện</Text>

            {/* Preview ảnh */}
            {nImageUri ? (
              <View style={{ marginBottom: 10 }}>
                <Image source={{ uri: nImageUri }} style={styles.imagePreview} resizeMode="cover" />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => { setNImageUri(''); setNImageUrl(''); }}>
                  <Text style={styles.removeImageText}>✕ Xoá ảnh</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Chọn ảnh từ thư viện */}
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
              <Text style={styles.imagePickerText}>🖼️ Chọn ảnh từ thư viện</Text>
            </TouchableOpacity>

            {/* Hoặc nhập URL */}
            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Hoặc nhập URL ảnh</Text>
            <TextInput
              style={styles.fieldInput}
              value={nImageUrl.startsWith('data:') ? '' : nImageUrl}
              onChangeText={(text) => { setNImageUrl(text); setNImageUri(text); }}
              placeholder="https://example.com/image.jpg"
              autoCapitalize="none"
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#eee', flex: 1 }]} onPress={() => setShowNewsModal(false)}>
                <Text style={{ textAlign: 'center', color: '#333', fontWeight: 'bold' }}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { flex: 1 }]} onPress={saveNews}>
                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function statusColor(s: string) {
  if (s === 'waiting') return '#1a73e8';
  if (s === 'in_progress') return '#e8a01a';
  if (s === 'done') return '#2e7d32';
  return '#999';
}
function statusLabel(s: string) {
  if (s === 'waiting') return 'Chờ khám';
  if (s === 'in_progress') return 'Đang khám';
  if (s === 'done') return 'Đã khám';
  return 'Đã huỷ';
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },
  topBar: { backgroundColor: '#1a73e8', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 52 },
  topTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  logoutBtn: { color: '#fff', fontSize: 14, opacity: 0.85 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#1a73e8' },
  tabText: { fontSize: 20 },
  tabTextActive: {},
  body: { flex: 1, padding: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  statCard: { borderRadius: 12, padding: 16, flex: 1, minWidth: '43%', alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#666', marginBottom: 2 },
  addBtn: { backgroundColor: '#1a73e8', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 12 },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  editBtn: { backgroundColor: '#e3f2fd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 6 },
  editBtnText: { color: '#1a73e8', fontSize: 13, fontWeight: 'bold' },
  delBtn: { backgroundColor: '#fce4ec', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  delBtnText: { color: '#e53935', fontSize: 13, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  filterInput: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#ddd' },
  filterBtn: { backgroundColor: '#1a73e8', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  filterBtnText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },
  newsImage: { width: '100%', height: 160, borderRadius: 10, marginBottom: 10 },
  imagePreview: { width: '100%', height: 180, borderRadius: 10 },
  removeImageBtn: { alignSelf: 'flex-end', marginTop: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fce4ec', borderRadius: 8 },
  removeImageText: { color: '#e53935', fontSize: 13, fontWeight: 'bold' },
  imagePickerBtn: { backgroundColor: '#f0f4ff', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#c5d5f5', borderStyle: 'dashed' },
  imagePickerText: { color: '#1a73e8', fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#222' },
  fieldLabel: { fontSize: 13, color: '#555', marginBottom: 6, fontWeight: '600' },
  fieldInput: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 14, borderWidth: 1, borderColor: '#eee' },
  deptList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  deptItem: { backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#ddd' },
  deptItemActive: { backgroundColor: '#1a73e8', borderColor: '#1a73e8' },
  deptItemText: { fontSize: 13, color: '#333' },
  deptItemTextActive: { color: '#fff', fontWeight: 'bold' },
  modalBtn: { backgroundColor: '#1a73e8', borderRadius: 10, padding: 14 },
});