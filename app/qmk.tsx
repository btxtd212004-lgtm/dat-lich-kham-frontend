import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL } from '../constants/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const phoneValid = /^0\d{9}$/.test(phone);
  const hasMinLength = newPassword.length >= 6;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordValid = hasMinLength && hasUpperCase && hasNumber;
  const confirmValid = confirmPassword === newPassword && confirmPassword !== '';

  const handleForgotPassword = async () => {
    if (!phoneValid) return Alert.alert('Lỗi', 'Số điện thoại không hợp lệ!');
    if (!passwordValid) return Alert.alert('Lỗi', 'Mật khẩu chưa đủ yêu cầu!');
    if (!confirmValid) return Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, new_password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Thành công', 'Đổi mật khẩu thành công!', [
          { text: 'OK', onPress: () => router.replace('/') }
        ]);
      } else {
        Alert.alert('Lỗi', data.message);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không kết nối được server!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <Text style={styles.subtitle}>Nhập thông tin để đặt lại mật khẩu</Text>

      <TextInput
        style={[styles.input, phone.length > 0 && !phoneValid && styles.inputError]}
        placeholder="Số điện thoại"
        keyboardType="phone-pad"
        placeholderTextColor="#999"
        value={phone}
        maxLength={10}
        onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
      />
      {phone.length > 0 && !phoneValid && (
        <Text style={styles.errorText}>⚠️ SĐT phải có 10 số và bắt đầu từ số 0</Text>
      )}

      <View style={[styles.inputRow, newPassword.length > 0 && !passwordValid && styles.inputError]}>
        <TextInput
          style={styles.inputFlex}
          placeholder="Mật khẩu mới"
          secureTextEntry={!showPassword}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.eye}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      {newPassword.length > 0 && (
        <View style={styles.requireBox}>
          <Text style={hasMinLength ? styles.reqOk : styles.reqFail}>{hasMinLength ? '✅' : '❌'} Ít nhất 6 ký tự</Text>
          <Text style={hasUpperCase ? styles.reqOk : styles.reqFail}>{hasUpperCase ? '✅' : '❌'} Có ít nhất 1 chữ hoa</Text>
          <Text style={hasNumber ? styles.reqOk : styles.reqFail}>{hasNumber ? '✅' : '❌'} Có ít nhất 1 chữ số</Text>
        </View>
      )}

      <View style={[styles.inputRow, confirmPassword.length > 0 && !confirmValid && styles.inputError]}>
        <TextInput
          style={styles.inputFlex}
          placeholder="Xác nhận mật khẩu mới"
          secureTextEntry={!showConfirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <Text style={styles.eye}>{showConfirm ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      {confirmPassword.length > 0 && !confirmValid && (
        <Text style={styles.errorText}>⚠️ Mật khẩu xác nhận không khớp</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
        <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>Quay lại đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a73e8', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 4, fontSize: 16, color: '#333' },
  inputError: { borderColor: '#e53935' },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 14, marginBottom: 4 },
  inputFlex: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#333' },
  eye: { fontSize: 20, paddingLeft: 8 },
  errorText: { color: '#e53935', fontSize: 13, marginBottom: 8, marginLeft: 4 },
  requireBox: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, marginBottom: 12 },
  reqOk: { color: '#2e7d32', fontSize: 13, marginBottom: 2 },
  reqFail: { color: '#e53935', fontSize: 13, marginBottom: 2 },
  button: { backgroundColor: '#1a73e8', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 16, marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  back: { textAlign: 'center', color: '#1a73e8', fontWeight: 'bold' },
});