import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { API_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const dichVus = [
  { id: '1', ten: 'Khám dịch vụ', gia: '130.000đ', lichKham: 'Thứ 2, 3, 4, 5, 6' },
  { id: '2', ten: 'Khám VIP', gia: '360.000đ', lichKham: 'Thứ 2, 3, 4, 5, 6, 7, CN' },
];

const gioSang = ['07:30 - 08:30', '08:30 - 09:30', '09:30 - 10:30', '10:30 - 10:45'];
const gioChieu = ['12:30 - 13:30', '13:30 - 14:30', '14:30 - 15:30', '15:30 - 15:45'];

export default function ChonThongTinScreen() {
  const router = useRouter();
  const { loai } = useLocalSearchParams<{ loai: string }>();
  const isNgoaiGio = loai === 'ngoaigio';

  const [chuyenKhoas, setChuyenKhoas] = useState<any[]>([]);

  const [schedules, setSchedules] = useState<any[]>([]);

const loadSchedules = async (departmentId: string, ngay: string) => {
  try {
    const token = await AsyncStorage.getItem('token');
    // Chuyển DD/MM/YYYY sang YYYY-MM-DD
    const parts = ngay.split('/');
    const dateForApi = `${parts[2]}-${parts[1]}-${parts[0]}`;
    const res = await fetch(`${API_URL}/api/schedules?department_id=${departmentId}&date=${dateForApi}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setSchedules(data.data);
    else setSchedules([]);
  } catch (err) {
    setSchedules([]);
  }
};

useEffect(() => {
  const loadDepartments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/schedules/departments`);
      const data = await res.json();
      if (data.success) {
        setChuyenKhoas(data.data.map((d: any) => ({
          id: String(d.id),
          ten: d.name,
          mota: d.description || '',
        })));
      }
    } catch (err) {
    }
  };
  loadDepartments();
}, []);

  const [selectedCK, setSelectedCK] = useState<any>(null);
  const [selectedDV, setSelectedDV] = useState<any>(null);
  const [selectedNgay, setSelectedNgay] = useState<string>('');
  const [selectedGio, setSelectedGio] = useState<{ gio: string; buoi: string; scheduleId?: number } | null>(null);
  const [showCKModal, setShowCKModal] = useState(false);
  const [searchCK, setSearchCK] = useState('');

  // Tự động load lịch khi đã có cả chuyên khoa lẫn ngày (dù chọn theo thứ tự nào)
  useEffect(() => {
    if (selectedCK && selectedNgay) {
      loadSchedules(selectedCK.id, selectedNgay);
    }
  }, [selectedCK, selectedNgay]);

  const [expandCK, setExpandCK] = useState(true);
  const [expandDV, setExpandDV] = useState(true);
  const [expandNgay, setExpandNgay] = useState(true);
  const [expandGio, setExpandGio] = useState(true);

  const [showHuongDan, setShowHuongDan] = useState(false);
  const [buocHD, setBuocHD] = useState(0);
  const [showMonthYear, setShowMonthYear] = useState(false);
  const [selectingYear, setSelectingYear] = useState(true);
  const huongDans = [
   { buoc: 'Bước 1', title: 'Chọn chuyên khoa', mota: 'Chọn chuyên khoa phù hợp với tình trạng sức khỏe của bạn' },
   { buoc: 'Bước 2', title: 'Chọn dịch vụ', mota: 'Chọn loại dịch vụ khám phù hợp: Khám thường, Khám dịch vụ hoặc Khám VIP' },
   { buoc: 'Bước 3', title: 'Chọn ngày', mota: 'Chọn ngày khám phù hợp trong lịch' },
   { buoc: 'Bước 4', title: 'Chọn giờ', mota: 'Chọn khung giờ còn trống để đặt lịch hẹn' },
  ];

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

  const isValidDay = (day: number) => {
    const date = new Date(year, month, day);
    const dow = (date.getDay() + 6) % 7;
    if (isNgoaiGio) return dow === 5 || dow === 6; // T7, CN
    return dow >= 0 && dow <= 4; // T2 - T6
  };

  const isPast = (day: number) => {
  const date = new Date(year, month, day);
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  return date < tomorrow;
};

  const filteredCK = chuyenKhoas.filter(ck =>
    ck.ten.toLowerCase().includes(searchCK.toLowerCase())
  );

  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i);
  const tenThang = [ 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const resetAll = () => {
    setSelectedCK(null);
    setSelectedDV(null);
    setSelectedNgay('');
    setSelectedGio(null);
    setExpandCK(true);
    setExpandDV(true);
    setExpandNgay(true);
    setExpandGio(true);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/Datlich')}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn thông tin khám</Text>
        <TouchableOpacity onPress={() => router.push('/home')}>
          <Text style={styles.homeIcon}>🏠</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>

        {/* Hướng dẫn */}
        <View style={styles.guideBar}>
          <Text style={styles.guideText}>ⓘ Xem hướng dẫn cách đặt lịch khám bệnh </Text>
          <TouchableOpacity onPress={() => { setShowHuongDan(true); setBuocHD(0); }}>
            <Text style={styles.guideLink}>Tại đây</Text>
          </TouchableOpacity>
        </View>

        {/* Thông tin đặt khám + Chọn lại */}
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>Thông tin đặt khám</Text>
          <TouchableOpacity onPress={resetAll}>
            <Text style={styles.resetText}>♦ Chọn lại</Text>
          </TouchableOpacity>
        </View>

        {/* Chuyên khoa */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => { if (selectedCK && !expandCK) setShowCKModal(true); else setExpandCK(!expandCK); }}>
            <Text style={styles.sectionTitle}>Chuyên khoa</Text>
            <Text style={styles.arrow}>{expandCK ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {expandCK ? (
            selectedCK ? (
              <TouchableOpacity style={styles.selectedItem} onPress={() => setShowCKModal(true)}>
                <Text style={styles.selectedText}>{selectedCK.ten}</Text>
                <Text style={styles.check}>✅</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TextInput style={styles.searchInline} placeholder="🔍 Tìm nhanh chuyên khoa" value={searchCK} onChangeText={setSearchCK} />
                {filteredCK.map(item => (
                  <TouchableOpacity key={item.id} style={styles.ckItem} onPress={() => { setSelectedCK(item); setExpandCK(false); setSearchCK(''); }}>
                    <Text style={styles.ckTen}>{item.ten}</Text>
                    <Text style={styles.ckMota}>{item.mota}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )
          ) : (
            selectedCK && (
              <View style={styles.selectedItem}>
                <Text style={styles.selectedText}>{selectedCK.ten}</Text>
                <Text style={styles.check}>✅</Text>
              </View>
            )
          )}
        </View>

        {/* Dịch vụ */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => { setSelectedDV(null); setExpandDV(true); }}>
            <Text style={styles.sectionTitle}>Dịch vụ</Text>
            <Text style={styles.arrow}>{expandDV ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {expandDV ? (
            selectedDV ? (
              <TouchableOpacity style={styles.selectedItem} onPress={() => setSelectedDV(null)}>
                <Text style={styles.selectedText}>{selectedDV.ten}</Text>
                <Text style={styles.check}>✅</Text>
              </TouchableOpacity>
            ) : (
              dichVus.map(dv => (
                <TouchableOpacity key={dv.id} style={styles.dvCard} onPress={() => { setSelectedDV(dv); setExpandDV(false); }}>
                  <View style={styles.dvInfo}>
                    <Text style={styles.dvTen}>{dv.ten}</Text>
                    <Text style={styles.dvMota}>Lịch khám: {dv.lichKham}</Text>
                  </View>
                  <Text style={styles.dvGia}>{dv.gia}</Text>
                </TouchableOpacity>
              ))
            )
          ) : (
            selectedDV && (
              <View style={styles.selectedItem}>
                <Text style={styles.selectedText}>{selectedDV.ten}</Text>
                <Text style={styles.check}>✅</Text>
              </View>
            )
          )}
        </View>

        {/* Ngày khám */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => { setSelectedNgay(''); setExpandNgay(true); }}>
            <Text style={styles.sectionTitle}>Ngày khám</Text>
            <Text style={styles.arrow}>{expandNgay ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          
          {expandNgay ? (
            selectedNgay ? (
              <TouchableOpacity style={styles.selectedItem} onPress={() => setSelectedNgay('')}>
                <Text style={styles.selectedText}>📅 {selectedNgay}</Text>
                <Text style={styles.check}>✅</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.calendar}>
                <Text style={{ fontSize: 12, color: '#e8a01a', marginBottom: 8 }}>
                  ⚠️ Vui lòng đặt lịch trước ít nhất 1 ngày
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
  
              <TouchableOpacity onPress={() => {
               if (month === 0) {
                setMonth(11);
                setYear(year - 1);
               } else { setMonth(month - 1); } }}>
              <Text style={{ fontSize: 18 }}>◀</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setShowMonthYear(true); setSelectingYear(true); }}>
              <Text style={styles.calendarTitle}>
                  {tenThang[month]} – {year}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {
               if (month === 11) {
                setMonth(0);
                setYear(year + 1);
               } else { setMonth(month + 1); } }}>
                <Text style={{ fontSize: 18 }}>▶</Text>
              </TouchableOpacity>

              </View>
                <View style={styles.dayHeaders}>
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7' , 'CN' ].map(d => (
                    <Text key={d} style={styles.dayHeader}>{d}</Text>
                  ))}
                </View>
                <View style={styles.daysGrid}>
                  {Array(firstDay).fill(null).map((_, i) => <View key={`e${i}`} style={styles.dayCell} />)}
                  {Array(daysInMonth).fill(null).map((_, i) => {
                    const day = i + 1;
                    const valid = isValidDay(day) && !isPast(day);
                    const dateStr = `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
                    const isToday =
                      day === today.getDate() &&
                      month === today.getMonth() &&
                      year === today.getFullYear();
                    return (
                      <TouchableOpacity key={day} style={[styles.dayCell, !valid && styles.disabledDay]}
                        onPress={() => { if (valid) { setSelectedNgay(dateStr); setExpandNgay(false); } }} disabled={!valid}>
                        <Text style={[styles.dayText, isToday && { textDecorationLine: 'underline' }, !valid && styles.disabledDayText]}>{day}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )
          ) : (
            selectedNgay && (
              <View style={styles.selectedItem}>
                <Text style={styles.selectedText}>📅 {selectedNgay}</Text>
                <Text style={styles.check}>✅</Text>
              </View>
            )
          )}
        </View>

        {/* Giờ khám */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => { setSelectedGio(null); setExpandGio(true); }}>
            <Text style={styles.sectionTitle}>Giờ khám</Text>
            <Text style={styles.arrow}>{expandGio ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {expandGio ? (
            selectedGio ? (
              <TouchableOpacity style={styles.selectedItem} onPress={() => setSelectedGio(null)}>
                <Text style={styles.selectedText}>🕐 {selectedGio.buoi} - {selectedGio.gio}</Text>
                <Text style={styles.check}>✅</Text>
              </TouchableOpacity>
            ) : (
              <>
               {schedules.length === 0 ? (
  <Text style={{ color: '#999', textAlign: 'center', marginTop: 8 }}>
    {selectedCK && selectedNgay ? 'Không có lịch trực trong ngày này' : 'Vui lòng chọn chuyên khoa và ngày trước'}
  </Text>
) : (
  <>
    {schedules.filter(s => parseInt(s.start_time.split(':')[0]) < 12 && (s.max_patients - s.booked_count) > 0).length > 0 && (
      <>
        <Text style={styles.buoiTitle}>Buổi sáng</Text>
        <View style={styles.gioGrid}>
          {schedules
            .filter(s => parseInt(s.start_time.split(':')[0]) < 12 && (s.max_patients - s.booked_count) > 0)
            .map(s => (
              <TouchableOpacity
                key={s.id}
                style={styles.gioBtn}
                onPress={() => {
                  setSelectedGio({
                    gio: `${s.start_time.slice(0,5)} - ${s.end_time.slice(0,5)}`,
                    buoi: 'Buổi sáng',
                    scheduleId: s.id
                  });
                  setExpandGio(false);
                }}
              >
                <Text style={styles.gioText}>
                  {s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}
                </Text>
                <Text style={{ fontSize: 11, color: '#1a73e8' }}>
                  Còn {Number(s.max_patients) - Number(s.booked_count)} chỗ
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </>
    )}

    {schedules.filter(s => parseInt(s.start_time.split(':')[0]) >= 12 && (s.max_patients - s.booked_count) > 0).length > 0 && (
      <>
        <Text style={styles.buoiTitle}>Buổi chiều</Text>
        <View style={styles.gioGrid}>
          {schedules
            .filter(s => parseInt(s.start_time.split(':')[0]) >= 12 && (s.max_patients - s.booked_count) > 0)
            .map(s => (
              <TouchableOpacity
                key={s.id}
                style={styles.gioBtn}
                onPress={() => {
                  setSelectedGio({
                    gio: `${s.start_time.slice(0,5)} - ${s.end_time.slice(0,5)}`,
                    buoi: 'Buổi chiều',
                    scheduleId: s.id
                  });
                  setExpandGio(false);
                }}
              >
                <Text style={styles.gioText}>
                  {s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}
                </Text>
                <Text style={{ fontSize: 11, color: '#1a73e8' }}>
                  Còn {s.max_patients - s.booked_count} chỗ
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </>
    )}
  </>
)}
              </>
            )
          ) : (
            selectedGio && (
              <View style={styles.selectedItem}>
                <Text style={styles.selectedText}>
                  🕐 {selectedGio.buoi} - {selectedGio.gio}
                </Text>
                <Text style={styles.check}>✅</Text>
              </View>
            )
          )}
        </View>

        {/* Xác nhận */}
        {selectedCK && selectedDV && selectedNgay && selectedGio && (
          <View style={styles.section}>
            <View style={styles.warningBar}>
              <Text style={styles.warningText}>ⓘ Vui lòng kiểm tra lại thông tin trước khi đặt lịch</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí khám bệnh</Text>
              <Text style={styles.summaryValue}>{selectedDV?.gia} VND</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={[styles.summaryValue, { color: '#e8a01a' }]}>{selectedDV?.gia} VND</Text>
            </View>
            <TouchableOpacity style={styles.confirmBtn} onPress={() => {
              router.push({
                pathname: '/ChonHoSoDatLich',
                params: {
                scheduleId: selectedGio?.scheduleId,
                khoa: selectedCK?.ten,
                dichVu: selectedDV?.ten,
                ngay: selectedNgay,
                gio: selectedGio?.gio,
                buoi: selectedGio?.buoi,
                gia: selectedDV?.gia,
               }
              });
            }}>
              <Text style={styles.confirmText}>TIẾP TỤC</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Modal Hướng dẫn */}
      <Modal visible={showHuongDan} transparent animationType="fade">
        <View style={styles.hdOverlay}>
          <View style={styles.hdModal}>
            <Text style={styles.hdTitle}>HƯỚNG DẪN ĐẶT KHÁM</Text>
            <Text style={styles.hdBuoc}>{huongDans[buocHD].buoc}: {huongDans[buocHD].title}</Text>
            <View style={styles.hdDots}>
              {huongDans.map((_, i) => (
                <View key={i} style={[styles.hdDot, i === buocHD && styles.hdDotActive]} />
              ))}
            </View>
            <View style={styles.hdButtons}>
              {buocHD > 0 ? (
                <TouchableOpacity onPress={() => setBuocHD(buocHD - 1)}>
                  <Text style={styles.hdBack}>Quay lại</Text>
                </TouchableOpacity>
              ) : <View style={{ width: 60 }} />}
              <TouchableOpacity style={styles.hdNextBtn} onPress={() => {
                if (buocHD < huongDans.length - 1) setBuocHD(buocHD + 1);
                else setShowHuongDan(false);
              }}>
                <Text style={styles.hdNextText}>{buocHD < huongDans.length - 1 ? 'Tiếp tục' : 'Bắt đầu'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowHuongDan(false)}>
                <Text style={styles.hdSkip}>Bỏ qua</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Chuyên khoa */}
      <Modal visible={showCKModal} animationType="slide">
        <View style={styles.modalWrapper}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn chuyên khoa</Text>
            <TouchableOpacity onPress={() => setShowCKModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput style={styles.searchInput} placeholder="Tìm nhanh chuyên khoa" value={searchCK} onChangeText={setSearchCK} />
          <FlatList data={filteredCK} keyExtractor={item => item.id} renderItem={({ item }) => (
            <TouchableOpacity style={styles.ckItem} onPress={() => { setSelectedCK(item); setShowCKModal(false); setSearchCK(''); setExpandCK(false); }}>
              <Text style={styles.ckTen}>{item.ten}</Text>
              <Text style={styles.ckMota}>{item.mota}</Text>
            </TouchableOpacity>
          )} />
        </View>
      </Modal>
      {/* ✅ Modal chọn tháng năm */}
<Modal visible={showMonthYear} transparent animationType="slide">
  <View style={styles.hdOverlay}>
    <View style={styles.hdModal}>
      <Text style={styles.hdTitle}>
        {selectingYear ? 'Chọn năm' : 'Chọn tháng'}
      </Text>

      <ScrollView>
        {(selectingYear ? years : tenThang).map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{ padding: 12, alignItems: 'center' }}
            onPress={() => {
              if (selectingYear) {
                setYear(Number(item));
                setSelectingYear(false);
              } else {
                setMonth(index);
                setShowMonthYear(false);
                setSelectingYear(true);
              }
            }}
          >
            <Text style={{ fontSize: 16 }}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity onPress={() => { setShowMonthYear(false); setSelectingYear(true); }}>
        <Text style={{ textAlign: 'center', marginTop: 10, color: 'red' }}>
          Đóng
        </Text>
      </TouchableOpacity>
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
  homeIcon: { fontSize: 22 },
  container: { flex: 1 },
  guideBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f4fd', padding: 12, marginHorizontal: 12, marginTop: 12, borderRadius: 8 },
  guideText: { fontSize: 13, color: '#555', flex: 1 },
  guideLink: { fontSize: 13, color: '#1a73e8', fontWeight: 'bold' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  topBarTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a73e8' },
  resetText: { fontSize: 14, color: '#333' },
  section: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 12, borderRadius: 12, padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  arrow: { fontSize: 12, color: '#999' },
  searchInline: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, fontSize: 14, marginBottom: 10 },
  selectedItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0f5ff', padding: 12, borderRadius: 10 },
  selectedText: { fontSize: 14, color: '#1a73e8', flex: 1 },
  check: { fontSize: 16 },
  dvCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  dvInfo: { flex: 1 },
  dvTen: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  dvMota: { fontSize: 12, color: '#999', marginTop: 4 },
  dvGia: { fontSize: 15, color: '#1a73e8', fontWeight: 'bold' },
  calendar: { backgroundColor: '#fff' },
  calendarTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#1a73e8', marginBottom: 12 },
  dayHeaders: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  dayHeader: { width: 36, textAlign: 'center', fontSize: 12, color: '#666' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', alignItems: 'center', paddingVertical: 6 },
  dayText: { fontSize: 14, color: '#333' },
  today: { backgroundColor: '#1a73e8', borderRadius: 18 },
  todayText: { color: '#fff', fontWeight: 'bold' },
  disabledDay: { opacity: 0.3 },
  disabledDayText: { color: '#999' },
  buoiTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 8 },
  gioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gioBtn: { borderWidth: 1, borderColor: '#1a73e8', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  gioText: { color: '#1a73e8', fontSize: 13 },
  warningBar: { backgroundColor: '#e8f4fd', padding: 10, borderRadius: 8, marginBottom: 12 },
  warningText: { fontSize: 13, color: '#1a73e8' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  confirmBtn: { backgroundColor: '#1a73e8', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalWrapper: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 50, backgroundColor: '#1a73e8' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  modalClose: { fontSize: 20, color: '#fff' },
  searchInput: { margin: 16, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15 },
  ckItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  ckTen: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  ckMota: { fontSize: 13, color: '#999', marginTop: 4 },
  hdOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  hdModal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  hdTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: 12 },
  hdBuoc: { fontSize: 15, color: '#555', textAlign: 'center', marginBottom: 20 },
  hdDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  hdDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ddd' },
  hdDotActive: { backgroundColor: '#1a73e8' },
  hdButtons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hdBack: { fontSize: 14, color: '#666' },
  hdNextBtn: { backgroundColor: '#1a73e8', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20 },
  hdNextText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  hdSkip: { fontSize: 14, color: '#666' },
});