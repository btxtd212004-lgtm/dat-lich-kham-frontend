import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../constants/api";

export default function ChiTietHoSoScreen() {
  const router = useRouter();
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const found = profileId
          ? data.data.profiles?.find((p: any) => String(p.id) === String(profileId))
          : data.data.profiles?.[0];
        setProfile(found);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Chưa cập nhật";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const getBMI = () => {
    if (!profile?.height || !profile?.weight) return null;
    const bmi = profile.weight / Math.pow(profile.height / 100, 2);
    const label =
      bmi < 18.5
        ? "Thiếu cân"
        : bmi < 25
          ? "Bình thường"
          : bmi < 30
            ? "Thừa cân"
            : "Béo phì";
    return `${bmi.toFixed(1)} (${label})`;
  };

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#1a73e8"
        style={{ flex: 1, marginTop: 100 }}
      />
    );

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết hồ sơ</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.charAt(0) || "?"}
            </Text>
          </View>
          <Text style={styles.name}>
            {profile?.full_name || "Chưa cập nhật"}
          </Text>
          <Text style={styles.sub}>
            {profile?.gender === "male"
              ? "Nam"
              : profile?.gender === "female"
                ? "Nữ"
                : ""}{" "}
            · {formatDate(profile?.date_of_birth)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Họ và tên</Text>
            <Text style={styles.value}>
              {profile?.full_name || "Chưa cập nhật"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ngày sinh</Text>
            <Text style={styles.value}>
              {formatDate(profile?.date_of_birth)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Giới tính</Text>
            <Text style={styles.value}>
              {profile?.gender === "male"
                ? "Nam"
                : profile?.gender === "female"
                  ? "Nữ"
                  : "Chưa cập nhật"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CCCD</Text>
            <Text style={styles.value}>{profile?.cccd || "Chưa cập nhật"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dân tộc</Text>
            <Text style={styles.value}>
              {profile?.ethnicity || "Chưa cập nhật"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nghề nghiệp</Text>
            <Text style={styles.value}>
              {profile?.occupation || "Chưa cập nhật"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mã bảo hiểm</Text>
            <Text style={styles.value}>
              {profile?.insurance_code || "Chưa cập nhật"}
            </Text>
          </View>
        </View>

        {(profile?.height || profile?.weight) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thể chất</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Chiều cao</Text>
              <Text style={styles.value}>
                {profile?.height ? `${profile.height} cm` : "Chưa cập nhật"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Cân nặng</Text>
              <Text style={styles.value}>
                {profile?.weight ? `${profile.weight} kg` : "Chưa cập nhật"}
              </Text>
            </View>
            {getBMI() && (
              <View style={styles.row}>
                <Text style={styles.label}>BMI</Text>
                <Text style={styles.value}>{getBMI()}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa chỉ</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Địa chỉ</Text>
            <Text style={styles.value}>
              {profile?.address || "Chưa cập nhật"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: "/themhoso",
              params: { mode: "edit", profileId: profile?.id },
            })
          }
        >
          <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
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
  container: { flex: 1 },
  avatarSection: {
    backgroundColor: "#1a73e8",
    alignItems: "center",
    paddingBottom: 24,
    paddingTop: 8,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: { fontSize: 28, fontWeight: "bold", color: "#1a73e8" },
  name: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  sub: { fontSize: 14, color: "#c8e0ff", marginTop: 4 },
  section: {
    backgroundColor: "#fff",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a73e8",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  label: { fontSize: 14, color: "#999", flex: 1 },
  value: { fontSize: 14, color: "#333", flex: 2, textAlign: "right" },
  editButton: {
    margin: 16,
    backgroundColor: "#1a73e8",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  editButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  backButton: {
    margin: 16,
    marginTop: 0,
    borderWidth: 1,
    borderColor: "#1a73e8",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  backButtonText: { color: "#1a73e8", fontSize: 16, fontWeight: "bold" },
});
