import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { API_URL } from "../constants/api";

export default function ChonHoSoScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const isDatLich = mode === "datlich";
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProfiles();
    }, []),
  );

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data.profiles) {
        setProfiles(data.data.profiles);
      } else {
        setProfiles([]);
      }
    } catch (err) {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ bệnh nhân</Text>
        <TouchableOpacity
          onPress={() => router.push("/themhoso")}
          style={{ alignItems: "center" }}
        >
          <Text style={styles.addNew}>👤+</Text>
          <Text style={styles.addNewText}>Tạo mới</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1a73e8"
            style={{ marginTop: 50 }}
          />
        ) : profiles.length > 0 ? (
          <>
            <View style={styles.infoBar}>
              <Text style={styles.infoText}>
                ⓘ Vui lòng chọn 1 trong các hồ sơ bên dưới, hoặc bấm Tạo mới để
                thêm hồ sơ bệnh nhân.
              </Text>
            </View>

            {profiles.map((profile) => (
              <View key={profile.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>👤</Text>
                  <Text style={styles.cardName}>
                    {profile.full_name?.toUpperCase()}
                  </Text>
                </View>
                {profile.date_of_birth && (
                  <View style={styles.cardRow}>
                    <Text style={styles.cardRowIcon}>🎂</Text>
                    <Text style={styles.cardRowText}>
                      {formatDate(profile.date_of_birth)}
                    </Text>
                  </View>
                )}
                {profile.address && (
                  <View style={styles.cardRow}>
                    <Text style={styles.cardRowIcon}>📍</Text>
                    <Text style={styles.cardRowText}>{profile.address}</Text>
                  </View>
                )}
                {isDatLich ? (
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() => router.push("/XacNhan")}
                  >
                    <Text style={styles.selectBtnText}>Chọn hồ sơ này</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/ChiTietHoSo",params: { profileId: profile.id },
                      })
                    }
                  >
                    <Text style={styles.selectBtnText}>Chi tiết</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.ketQuaBtn}
                    onPress={() => router.push({ pathname: "/KetQuaKham", params: { profileId: profile.id } })}>
                    <Text style={styles.ketQuaBtnText}>📋 Kết quả khám</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.deleteBtn}
                    onPress={() => {
                      Alert.alert('Xóa hồ sơ', `Bạn có chắc muốn xóa hồ sơ ${profile.full_name}?`, [
                        { text: 'Hủy', style: 'cancel' },
                        { text: 'Xóa', style: 'destructive', onPress: async () => {
                          const token = await AsyncStorage.getItem('token');
                          const res = await fetch(`${API_URL}/api/auth/profile/${profile.id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` },
                          });
                          const data = await res.json();
                          if (data.success) loadProfiles();
                          else Alert.alert('Lỗi', data.message);
                        }}
                      ]);
                    }}>
                    <Text style={styles.deleteBtnText}>Xóa hồ sơ</Text>
                  </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Chưa có hồ sơ nào</Text>
            <Text style={styles.emptyDesc}>
              Vui lòng tạo hồ sơ để tiếp tục quá trình đặt lịch khám
            </Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push("/themhoso")}
            >
              <Text style={styles.createBtnText}>Tạo hồ sơ mới</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#1a73e8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 50,
  },
  back: { fontSize: 24, color: "#fff" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  addNew: { fontSize: 20, color: "#fff", textAlign: "center" },
  addNewText: { fontSize: 11, color: "#fff", fontWeight: "normal" },
  container: { flex: 1, padding: 16 },
  infoBar: {
    backgroundColor: "#e8f4fd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: { fontSize: 13, color: "#555" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  cardIcon: { fontSize: 18, marginRight: 8 },
  cardName: { fontSize: 16, fontWeight: "bold", color: "#1a73e8" },
  cardRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  cardRowIcon: { fontSize: 14, marginRight: 8, marginTop: 2 },
  cardRowText: { fontSize: 14, color: "#333", flex: 1 },
  selectBtn: {
    backgroundColor: "#1a73e8",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    marginTop: 12,
  },
  selectBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  createBtn: {
    backgroundColor: "#1a73e8",
    padding: 16,
    borderRadius: 10,
    paddingHorizontal: 32,
  },
  createBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  deleteBtn: { borderWidth: 1, borderColor: 'red', borderRadius: 20, padding: 12, alignItems: 'center', marginTop: 8 },
  deleteBtnText: { color: 'red', fontSize: 14, fontWeight: 'bold' },
  deleteBtn: { borderWidth: 1, borderColor: 'red', borderRadius: 20, padding: 12, alignItems: 'center', marginTop: 8 },
  deleteBtnText: { color: 'red', fontSize: 14, fontWeight: 'bold' },
  ketQuaBtn: { borderWidth: 1, borderColor: '#1a73e8', borderRadius: 20, padding: 12, alignItems: 'center', marginTop: 8 },
  ketQuaBtnText: { color: '#1a73e8', fontSize: 14, fontWeight: 'bold' },
});
