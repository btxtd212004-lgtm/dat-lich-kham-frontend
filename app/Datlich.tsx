import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function DatLichScreen() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);

  return (
    <View style={styles.wrapper}>
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>CHỌN DỊCH VỤ</Text>

            <TouchableOpacity style={styles.serviceButton} onPress={() => {
              setShowModal(false);
              router.replace({ pathname: '/ChonThongTin', params: { loai: 'thuong' } });
            }}>
              <Text style={styles.serviceText}>ĐẶT LỊCH KHÁM BỆNH</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceButton} onPress={() => {
              setShowModal(false);
              router.replace({ pathname: '/ChonThongTin', params: { loai: 'ngoaigio' } });
            }}>
              <Text style={styles.serviceText}>ĐẶT KHÁM NGOÀI GIỜ</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setShowModal(false); router.back(); }}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  serviceButton: { backgroundColor: '#1a73e8', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  serviceText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelText: { textAlign: 'center', color: '#999', fontSize: 15, marginTop: 8 },
});