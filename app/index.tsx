import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  const phoneValid = /^0\d{9}$/.test(phone);

  // Auto-login nếu còn token hợp lệ
  useEffect(() => {
    const tryAutoLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        if (token && userStr) {
          const user = JSON.parse(userStr);
          if (user.role === 'admin') router.replace('/admin');
          else if (user.role === 'doctor') router.replace('/doctor');
          else router.replace('/home');
          return;
        }
      } catch {}
      setCheckingToken(false);
    };
    tryAutoLogin();
  }, []);

  const registerPushToken = async (token: string) => {
    try {
      if (!Device.isDevice) return;
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      const pushToken = await Notifications.getExpoPushTokenAsync();
      await fetch(`${API_URL}/api/auth/push-token`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ expo_push_token: pushToken.data }),
      });
    } catch (err) {
      // push token không bắt buộc, bỏ qua lỗi
    }
  };

  const handleLogin = async () => {
    if (!phoneValid) return Alert.alert('Lỗi', 'Số điện thoại không hợp lệ!');
    if (!password) return Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu!');
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (data.success) {
        await AsyncStorage.setItem('token', data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
        registerPushToken(data.data.token);
        // Điều hướng theo role
        const role = data.data.user.role;
        if (role === 'admin') router.replace('/admin');
        else if (role === 'doctor') router.replace('/doctor');
        else router.replace('/home');
      } else {
        Alert.alert('Lỗi', data.message);
      }
    } catch {
      Alert.alert('Lỗi', 'Không kết nối được server!');
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🏥</Text>
        <Text style={styles.appName}>MedBook</Text>
        <Text style={styles.subtitle}>Đặt lịch khám nhanh chóng</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={[styles.input, phone && !phoneValid && styles.inputError]}
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={10}
        />
        {phone !== '' && !phoneValid && (
          <Text style={styles.errorText}>Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số</Text>
        )}

        <Text style={styles.label}>Mật khẩu</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0, color: '#333'}]}
            placeholder="Nhập mật khẩu"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/qmk')}>
          <Text style={styles.forgot}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginBtn, (!phoneValid || !password || loading) && styles.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={!phoneValid || !password || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>ĐĂNG NHẬP</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerRow} onPress={() => router.push('/dk')}>
          <Text style={styles.registerText}>Chưa có tài khoản? </Text>
          <Text style={styles.registerLink}>Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { backgroundColor: '#1a73e8', paddingTop: 80, paddingBottom: 40, alignItems: 'center' },
  logo: { fontSize: 56, marginBottom: 8 },
  appName: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#c8e0ff', marginTop: 4 },
  form: { flex: 1, padding: 24, paddingTop: 32 },
  label: { fontSize: 14, color: '#555', marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 16 },
  inputError: { borderColor: '#e53935' },
  errorText: { color: '#e53935', fontSize: 12, marginTop: -12, marginBottom: 12 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  eyeBtn: { padding: 14, marginLeft: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10 },
  eyeIcon: { fontSize: 16 },
  forgot: { color: '#1a73e8', fontSize: 14, textAlign: 'right', marginBottom: 24, marginTop: 8 },
  loginBtn: { backgroundColor: '#1a73e8', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  loginBtnDisabled: { opacity: 0.5 },
  loginText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  registerText: { color: '#555', fontSize: 15 },
  registerLink: { color: '#1a73e8', fontSize: 15, fontWeight: 'bold' },
});