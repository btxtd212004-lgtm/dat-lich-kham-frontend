import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function ThanhToanScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>('');

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn phương thức thanh toán</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.subtitle}>Vui lòng chọn phương thức thanh toán</Text>

        {/* Tiền mặt */}
        <TouchableOpacity style={[styles.card, selected === 'tienmat' && styles.cardSelected]} onPress={() => setSelected('tienmat')}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardIcon}>💵</Text>
            <View>
              <Text style={styles.cardTitle}>Tiền mặt</Text>
              <Text style={styles.cardDesc}>Thanh toán tại quầy lễ tân</Text>
            </View>
          </View>
          <View style={[styles.radio, selected === 'tienmat' && styles.radioSelected]}>
            {selected === 'tienmat' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        {/* Momo */}
        <TouchableOpacity style={[styles.card, selected === 'momo' && styles.cardSelected]} onPress={() => setSelected('momo')}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardIcon}>📱</Text>
            <View>
              <Text style={styles.cardTitle}>Ví MoMo</Text>
              <Text style={styles.cardDesc}>Thanh toán qua ví điện tử MoMo</Text>
            </View>
          </View>
          <View style={[styles.radio, selected === 'momo' && styles.radioSelected]}>
            {selected === 'momo' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        {/* Tóm tắt */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí khám bệnh</Text>
            <Text style={styles.summaryValue}>130.000đ</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={[styles.summaryValue, { color: '#e8a01a' }]}>130.000đ</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.confirmBtn, !selected && styles.confirmBtnDisabled]}
        onPress={() => selected && router.push('/phieukham')}
        disabled={!selected}>
        <Text style={styles.confirmText}>XÁC NHẬN THANH TOÁN</Text>
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
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: '#eee' },
  cardSelected: { borderColor: '#1a73e8', backgroundColor: '#f0f5ff' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { fontSize: 28 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  cardDesc: { fontSize: 12, color: '#999', marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: '#1a73e8' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1a73e8' },
  summary: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  confirmBtn: { backgroundColor: '#1a73e8', padding: 18, alignItems: 'center' },
  confirmBtnDisabled: { backgroundColor: '#aaa' },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});