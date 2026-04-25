import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_KEY_PREFIX = 'appt_notif_'; // lưu notificationId theo appointmentId

/**
 * Xin quyền thông báo, trả về true nếu được cấp phép
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false; // Không chạy trên emulator
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Lên lịch thông báo trước 1 tiếng cho lịch khám.
 * - appointmentId: dùng để lưu/hủy đúng thông báo
 * - ngay: 'DD/MM/YYYY'
 * - gio: 'HH:MM' (giờ bắt đầu khám, ví dụ '07:30')
 * - khoa: tên chuyên khoa
 * - queueNumber: số thứ tự
 */
export async function scheduleAppointmentReminder({
  appointmentId,
  ngay,
  gio,
  khoa,
  queueNumber,
}: {
  appointmentId: number | string;
  ngay: string;       // DD/MM/YYYY
  gio: string;        // HH:MM - HH:MM  (lấy phần đầu)
  khoa: string;
  queueNumber: number | string;
}): Promise<boolean> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return false;

    // Hủy thông báo cũ nếu có (tránh trùng)
    await cancelAppointmentReminder(appointmentId);

    // Parse ngày giờ: lấy giờ bắt đầu của slot
    const parts = ngay.split('/');   // [DD, MM, YYYY]
    const gioStart = gio.split(' - ')[0].split(':'); // ['HH', 'MM']

    const apptTime = new Date(
      parseInt(parts[2]),
      parseInt(parts[1]) - 1,
      parseInt(parts[0]),
      parseInt(gioStart[0]),
      parseInt(gioStart[1]),
      0,
    );

    // Báo trước 1 tiếng
    const reminderTime = new Date(apptTime.getTime() - 60 * 60 * 1000);
    const now = new Date();

    if (reminderTime <= now) {
      // Thời gian nhắc đã qua rồi, không lên lịch
      return false;
    }

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Nhắc nhở lịch khám',
        body: `Còn 1 tiếng nữa đến lịch khám ${khoa} (STT #${queueNumber}). Vui lòng chuẩn bị!`,
        sound: true,
        data: { appointmentId, khoa, queueNumber },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderTime,
      },
    });

    // Lưu notificationId để có thể hủy sau
    await AsyncStorage.setItem(`${NOTIF_KEY_PREFIX}${appointmentId}`, notifId);
    return true;
  } catch (err) {
    console.log('scheduleAppointmentReminder error:', err);
    return false;
  }
}

/**
 * Hủy thông báo đã lên lịch cho một appointmentId
 */
export async function cancelAppointmentReminder(appointmentId: number | string): Promise<void> {
  try {
    const key = `${NOTIF_KEY_PREFIX}${appointmentId}`;
    const notifId = await AsyncStorage.getItem(key);
    if (notifId) {
      await Notifications.cancelScheduledNotificationAsync(notifId);
      await AsyncStorage.removeItem(key);
    }
  } catch (err) {
    // Bỏ qua lỗi hủy thông báo
  }
}

/**
 * Hủy TẤT CẢ thông báo lịch khám đã lên lịch
 */
export async function cancelAllAppointmentReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    // Xóa tất cả key lưu trong AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    const notifKeys = keys.filter(k => k.startsWith(NOTIF_KEY_PREFIX));
    if (notifKeys.length > 0) await AsyncStorage.multiRemove(notifKeys);
  } catch (err) {
    // Bỏ qua
  }
}