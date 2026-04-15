import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../constants/api";
import { danhSachTinh, danhSachXa } from "./diachi";

export default function ThemHoSoScreen() {
  const router = useRouter();
  const { mode, profileId: profileIdParam } = useLocalSearchParams<{
    mode: string;
    profileId: string;
  }>();
  const isEdit = mode === "edit";

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("male");
  const [insuranceCode, setInsuranceCode] = useState("");
  const [cccd, setCccd] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [showTinhModal, setShowTinhModal] = useState(false);
  const [showXaModal, setShowXaModal] = useState(false);
  const [tinhSearch, setTinhSearch] = useState("");
  const [xaSearch, setXaSearch] = useState("");
  const [selectedTinh, setSelectedTinh] = useState<any>(null);
  const [selectedXa, setSelectedXa] = useState<any>(null);
  const [profileId, setProfileId] = useState<number | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (isEdit) loadProfile();
    }, [isEdit]),
  );

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data.profiles) {
        const p = profileIdParam
          ? data.data.profiles.find(
              (x: any) => String(x.id) === String(profileIdParam),
            )
          : data.data.profiles[0];
        if (!p) return;
        setProfileId(p.id);
        setFullName(p.full_name || "");
        setGender(p.gender || "male");
        setInsuranceCode(p.insurance_code || "");
        setCccd(p.cccd || "");
        setEthnicity(p.ethnicity || "");
        setOccupation(p.occupation || "");
        setHeight(p.height ? String(p.height) : "");
        setWeight(p.weight ? String(p.weight) : "");
        if (p.date_of_birth) {
          const d = new Date(p.date_of_birth);
          setDateOfBirth(
            `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`,
          );
        }
        if (p.address) {
          const parts = p.address.split(", ");
          const tinhName = parts.pop();
          const xaName = parts.pop();
          const street = parts.join(", ");

          setStreetAddress(street);
          if (parts.length >= 3) {
            setStreetAddress(parts[0]);
            const tinh = danhSachTinh.find((t) => t.ten === parts[2]);
            if (tinh) {
              setSelectedTinh(tinh);
              const xa = (danhSachXa[tinh.id] || []).find(
                (x: any) => x.ten === parts[1],
              );
              if (xa) setSelectedXa(xa);
            }
          } else {
            setStreetAddress(p.address);
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const filteredTinh = danhSachTinh.filter((t) =>
    t.ten.toLowerCase().includes(tinhSearch.toLowerCase()),
  );
  const danhSachXaTheoTinh = selectedTinh
    ? danhSachXa[selectedTinh.id] || []
    : [];
  const filteredXa = danhSachXaTheoTinh.filter((x) =>
    x.ten.toLowerCase().includes(xaSearch.toLowerCase()),
  );

  const handleSubmit = async () => {
    if (!fullName) return Alert.alert("Lỗi", "Vui lòng nhập họ và tên!");
    if (!dateOfBirth) return Alert.alert("Lỗi", "Vui lòng nhập ngày sinh!");
    if (!cccd) return Alert.alert("Lỗi", "Vui lòng nhập CCCD!");
    if (cccd.length !== 12) {
      return Alert.alert("Lỗi", "CCCD phải đủ 12 số!");
    }
    if (!selectedTinh) return Alert.alert("Lỗi", "Vui lòng chọn tỉnh/thành!");
    if (!selectedXa) return Alert.alert("Lỗi", "Vui lòng chọn phường/xã!");
    if (!streetAddress)
      return Alert.alert("Lỗi", "Vui lòng nhập số nhà/tên đường!");

    try {
      const token = await AsyncStorage.getItem("token");
      const address = `${streetAddress}, ${selectedXa.ten}, ${selectedTinh.ten}`;

      // Chuyển ngày từ DD/MM/YYYY sang YYYY-MM-DD
      const parts = dateOfBirth.split("/");
      const formattedDate =
        parts.length === 3
          ? `${parts[2]}-${parts[1]}-${parts[0]}`
          : dateOfBirth;

      const url = isEdit
        ? `${API_URL}/api/auth/profiles/${profileId}`
        : `${API_URL}/api/auth/profiles`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          date_of_birth: formattedDate,
          gender,
          insurance_number: insuranceCode,
          cccd,
          ethnicity,
          occupation,
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null,
          address,
        }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert(
          "Thành công",
          isEdit ? "Cập nhật hồ sơ thành công!" : "Tạo hồ sơ thành công!",
          [{ text: "OK", onPress: () => router.back() }],
        );
      } else {
        Alert.alert("Lỗi", data.message);
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không kết nối được server!");
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? "Chỉnh sửa hồ sơ" : "Tạo mới hồ sơ"}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.label}>
          Họ và tên <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Họ và tên"
          placeholderTextColor="#999"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>
          Ngày sinh <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#999"
          value={dateOfBirth}
          keyboardType="numeric"
          maxLength={10}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, "");
            let formatted = cleaned;
            if (cleaned.length >= 3 && cleaned.length <= 4) {
              formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
            } else if (cleaned.length > 4) {
              formatted =
                cleaned.slice(0, 2) +
                "/" +
                cleaned.slice(2, 4) +
                "/" +
                cleaned.slice(4, 8);
            }
            setDateOfBirth(formatted);
          }}
        />

        <Text style={styles.label}>
          Giới tính <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.genderRow}>
          <TouchableOpacity
            style={
              gender === "male" ? styles.genderSelected : styles.genderOption
            }
            onPress={() => setGender("male")}
          >
            <Text
              style={
                gender === "male"
                  ? styles.genderTextSelected
                  : styles.genderText
              }
            >
              Nam
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              gender === "female" ? styles.genderSelected : styles.genderOption
            }
            onPress={() => setGender("female")}
          >
            <Text
              style={
                gender === "female"
                  ? styles.genderTextSelected
                  : styles.genderText
              }
            >
              Nữ
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Mã bảo hiểm y tế</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mã bảo hiểm y tế"
          placeholderTextColor="#999"
          value={insuranceCode}
          onChangeText={setInsuranceCode}
        />

        <Text style={styles.label}>
          CCCD <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Vui lòng nhập CCCD"
          placeholderTextColor="#999"
          keyboardType="numeric"
          maxLength={12}
          value={cccd}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, ""); // chỉ cho số
            setCccd(cleaned);
          }}
        />

        <Text style={styles.label}>Dân tộc</Text>
        <TextInput
          style={styles.input}
          placeholder="Kinh"
          placeholderTextColor="#999"
          value={ethnicity}
          onChangeText={setEthnicity}
        />

        <Text style={styles.label}>Nghề nghiệp</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập nghề nghiệp"
          placeholderTextColor="#999"
          value={occupation}
          onChangeText={setOccupation}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Chiều cao (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 170cm"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Cân nặng (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 60kg"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Địa chỉ</Text>

        <Text style={styles.label}>
          Tỉnh / TP <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => setShowTinhModal(true)}
        >
          <Text
            style={selectedTinh ? styles.selectText : styles.selectPlaceholder}
          >
            {selectedTinh ? selectedTinh.ten : "Chọn tỉnh thành"}
          </Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <Text style={styles.label}>
          Phường / Xã <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => selectedTinh && setShowXaModal(true)}
        >
          <Text
            style={selectedXa ? styles.selectText : styles.selectPlaceholder}
          >
            {selectedXa ? selectedXa.ten : "Chọn Phường/Xã"}
          </Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <Text style={styles.label}>
          Số nhà / Tên đường <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Chỉ nhập số nhà, tên đường..."
          placeholderTextColor="#999"
          value={streetAddress}
          onChangeText={setStreetAddress}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {isEdit ? "LƯU HỒ SƠ" : "TẠO MỚI HỒ SƠ"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal visible={showTinhModal} animationType="slide">
        <View style={styles.modalWrapper}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn Tỉnh/TP</Text>
            <TouchableOpacity onPress={() => setShowTinhModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tỉnh thành..."
            placeholderTextColor="#999"
            value={tinhSearch}
            onChangeText={setTinhSearch}
          />
          <FlatList
            data={filteredTinh}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedTinh(item);
                  setSelectedXa(null);
                  setShowTinhModal(false);
                  setTinhSearch("");
                }}
              >
                <Text style={styles.modalItemText}>{item.ten}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      <Modal visible={showXaModal} animationType="slide">
        <View style={styles.modalWrapper}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn Phường/Xã</Text>
            <TouchableOpacity onPress={() => setShowXaModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm phường/xã..."
            placeholderTextColor="#999"
            value={xaSearch}
            onChangeText={setXaSearch}
          />
          <FlatList
            data={filteredXa}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedXa(item);
                  setShowXaModal(false);
                  setXaSearch("");
                }}
              >
                <Text style={styles.modalItemText}>{item.ten}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff" },
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
  container: { flex: 1, padding: 16 },
  label: { fontSize: 14, color: "#333", marginBottom: 6, marginTop: 12 },
  required: { color: "red" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#333",
  },
  selectInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: { fontSize: 15, color: "#333" },
  selectPlaceholder: { fontSize: 15, color: "#aaa" },
  arrow: { fontSize: 18, color: "#aaa" },
  genderRow: { flexDirection: "row", gap: 12 },
  genderSelected: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#1a73e8",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  genderTextSelected: { color: "#1a73e8", fontWeight: "bold", fontSize: 15 },
  genderText: { color: "#999", fontSize: 15 },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  button: {
    backgroundColor: "#1a73e8",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalWrapper: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#1a73e8",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  modalClose: { fontSize: 20, color: "#fff" },
  searchInput: {
    margin: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  modalItemText: { fontSize: 15, color: "#333" },
});
