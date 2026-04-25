import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../constants/api";

export default function ChonHoSoDatLichScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { scheduleId, khoa, dichVu, ngay, gio, buoi, gia } = useLocalSearchParams<{
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
      loadProfile();
    }, []),
  );

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) setUser(JSON.parse(userStr));
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
          <View>
            <View style={styles.infoBar}>
              <Text style={styles.infoText}>
                ⓘ Vui lòng chọn hồ sơ bên dưới, hoặc bấm Tạo mới để thêm hồ sơ.
              </Text>
            </View>
            {profiles.map((profile) => (
              <View key={profile.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarRow}>
                    <Text style={styles.cardIcon}>👤</Text>
                    <Text style={styles.cardName}>
                      {profile.full_name?.toUpperCase()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.chonBtn}
                    onPress={() => {
                     router.push({ pathname: '/XacNhan', params: { profileId: profile.id, scheduleId, khoa, dichVu, ngay, gio, buoi, gia } });
                    }}
                  >
                    <Text style={styles.chonBtnText}>Chọn</Text>
                  </TouchableOpacity>
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
              </View>
            ))}
          </View>
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
  wrapper: { flex: 1, backgroundColor: "#f0f5ff" },
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
  addNew: { fontSize: 18, color: "#fff", textAlign: "center" },
  addNewText: { fontSize: 11, color: "#fff" },
  container: { flex: 1, padding: 16 },
  infoBar: {
    backgroundColor: "#d6eaff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: { fontSize: 13, color: "#333" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: "#dde8ff",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  cardIcon: { fontSize: 22, marginRight: 8 },
  cardName: { fontSize: 15, fontWeight: "bold", color: "#1a73e8" },
  chonBtn: {
    backgroundColor: "#1a73e8",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  chonBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  cardRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  cardRowIcon: { fontSize: 14, marginRight: 8, marginTop: 2 },
  cardRowText: { fontSize: 14, color: "#333", flex: 1 },
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
});