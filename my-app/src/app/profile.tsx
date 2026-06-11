import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Switch, 
  Modal, 
  TextInput,
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/context/toast-context';

export default function ProfileScreen() {
  const theme = useTheme();
  const { themeMode, toggleTheme } = useAppTheme();
  const { state: authState, logout, updateProfile } = useAuth();
  const { showToast } = useToast();

  const user = authState.user;

  // Edit Profile Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');

  // Simulated Offline State
  const [simulatedOffline, setSimulatedOffline] = useState(false);

  useEffect(() => {
    async function loadOfflineStatus() {
      const stored = await AsyncStorage.getItem('@zapmart_simulated_offline');
      setSimulatedOffline(stored === 'true');
    }
    loadOfflineStatus();
  }, []);

  const handleToggleOffline = useCallback(async (value: boolean) => {
    setSimulatedOffline(value);
    await AsyncStorage.setItem('@zapmart_simulated_offline', value ? 'true' : 'false');
    showToast(
      value 
        ? 'Simulated Offline Mode enabled. Refresh Home to test caching.' 
        : 'Network connection restored.', 
      value ? 'warning' : 'success'
    );
  }, [showToast]);

  const handleToggleNotifications = useCallback(async (value: boolean) => {
    try {
      await updateProfile({ notificationsEnabled: value });
      showToast(
        value ? 'Notifications enabled!' : 'Notifications muted.', 
        'info'
      );
    } catch (e) {
      showToast('Failed to update settings', 'error');
    }
  }, [updateProfile, showToast]);

  const handleSaveProfile = useCallback(async () => {
    if (!nameInput.trim() || !emailInput.trim()) {
      showToast('Name and Email are required', 'error');
      return;
    }

    try {
      await updateProfile({
        name: nameInput,
        email: emailInput,
        phone: phoneInput,
      });
      setEditModalVisible(false);
      showToast('Profile updated successfully!', 'success');
    } catch (e) {
      showToast('Failed to save profile details.', 'error');
    }
  }, [nameInput, emailInput, phoneInput, updateProfile, showToast]);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : 'ZM';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>My Profile 👤</Text>
        </View>

        {/* User Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <View style={[styles.avatarCircle, { backgroundColor: '#168f6d' }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
          {user?.phone ? (
            <Text style={[styles.userPhone, { color: theme.textSecondary }]}>📞 {user.phone}</Text>
          ) : null}

          <TouchableOpacity 
            style={[styles.editBtn, { borderColor: '#168f6d' }]}
            onPress={() => {
              setNameInput(user?.name || '');
              setEmailInput(user?.email || '');
              setPhoneInput(user?.phone || '');
              setEditModalVisible(true);
            }}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Block */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>App Settings</Text>
        
        <View style={[styles.settingsCard, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          
          {/* Dark Mode Selector */}
          <View style={styles.settingRow}>
            <View style={styles.settingLabelWrapper}>
              <Text style={styles.settingIcon}>🌙</Text>
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>Toggle app appearance</Text>
              </View>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#dbe7e4', true: '#168f6d' }}
              thumbColor={Platform.OS === 'ios' ? undefined : themeMode === 'dark' ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.separator, { backgroundColor: theme.backgroundSelected }]} />

          {/* Notifications Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLabelWrapper}>
              <Text style={styles.settingIcon}>🔔</Text>
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Push Notifications</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>Receive delivery updates</Text>
              </View>
            </View>
            <Switch
              value={!!user?.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#dbe7e4', true: '#168f6d' }}
              thumbColor={Platform.OS === 'ios' ? undefined : user?.notificationsEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.separator, { backgroundColor: theme.backgroundSelected }]} />

          {/* Simulate Offline Support Toggle (Highly interactive for testing) */}
          <View style={styles.settingRow}>
            <View style={styles.settingLabelWrapper}>
              <Text style={styles.settingIcon}>📶</Text>
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Simulate Offline Mode</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>Test local storage caching</Text>
              </View>
            </View>
            <Switch
              value={simulatedOffline}
              onValueChange={handleToggleOffline}
              trackColor={{ false: '#dbe7e4', true: '#e63946' }}
              thumbColor={Platform.OS === 'ios' ? undefined : simulatedOffline ? '#ffffff' : '#f4f3f4'}
            />
          </View>

        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: '#e63946' }]}
          onPress={logout}
        >
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile Details</Text>
            
            {/* Input Name */}
            <View style={styles.modalInputWrapper}>
              <Text style={[styles.modalInputLabel, { color: theme.text }]}>Full Name</Text>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="John Doe"
                placeholderTextColor={theme.textSecondary}
                style={[styles.modalInput, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
              />
            </View>

            {/* Input Email */}
            <View style={styles.modalInputWrapper}>
              <Text style={[styles.modalInputLabel, { color: theme.text }]}>Email Address</Text>
              <TextInput
                value={emailInput}
                onChangeText={setEmailInput}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="example@gmail.com"
                placeholderTextColor={theme.textSecondary}
                style={[styles.modalInput, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
              />
            </View>

            {/* Input Phone */}
            <View style={styles.modalInputWrapper}>
              <Text style={[styles.modalInputLabel, { color: theme.text }]}>Phone Number</Text>
              <TextInput
                value={phoneInput}
                onChangeText={setPhoneInput}
                keyboardType="phone-pad"
                placeholder="+91 98765 43210"
                placeholderTextColor={theme.textSecondary}
                style={[styles.modalInput, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
              />
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn, { borderColor: theme.backgroundSelected }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, styles.saveBtn, { backgroundColor: '#168f6d' }]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 120, // Tab triggers margin
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 28,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  userPhone: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  editBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 18,
  },
  editBtnText: {
    color: '#168f6d',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    paddingLeft: 4,
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 8,
    marginBottom: 32,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  settingLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  settingIcon: {
    fontSize: 22,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  settingSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
  },
  logoutBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInputWrapper: {
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalInput: {
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1.5,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    elevation: 2,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
