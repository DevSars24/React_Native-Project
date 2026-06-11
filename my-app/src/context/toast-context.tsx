import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, Pressable, Platform, Dimensions } from 'react-native';
import Animated, { 
  FadeInUp, 
  FadeOutUp, 
  Layout, 
  SlideInUp, 
  SlideOutUp 
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { themeMode } = useAppTheme();
  const colors = Colors[themeMode];

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Overlay Container */}
      <View style={styles.toastContainer} pointerEvents="box-none">
        {toasts.map((toast) => (
          <Animated.View
            key={toast.id}
            entering={Platform.OS === 'web' ? FadeInUp : SlideInUp.duration(300)}
            exiting={Platform.OS === 'web' ? FadeOutUp : SlideOutUp.duration(250)}
            layout={Layout.springify()}
            style={[
              styles.toastCard,
              { 
                backgroundColor: themeMode === 'dark' ? 'rgba(33, 34, 37, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: 
                  toast.type === 'success' ? '#168f6d' :
                  toast.type === 'error' ? '#e63946' :
                  toast.type === 'warning' ? '#f9a826' : '#113f67',
                borderLeftWidth: 6,
                shadowColor: colors.text,
              }
            ]}
          >
            <View style={styles.contentRow}>
              <Text style={styles.emoji}>
                {toast.type === 'success' && '✅'}
                {toast.type === 'error' && '❌'}
                {toast.type === 'warning' && '⚠️'}
                {toast.type === 'info' && 'ℹ️'}
              </Text>
              
              <Text style={[styles.toastText, { color: colors.text }]}>
                {toast.message}
              </Text>
              
              <Pressable style={styles.closeBtn} onPress={() => removeToast(toast.id)}>
                <Text style={[styles.closeText, { color: colors.textSecondary }]}>✕</Text>
              </Pressable>
            </View>
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  toastCard: {
    width: Platform.OS === 'web' ? '100%' : Dimensions.get('window').width - 40,
    maxWidth: 450,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 16,
    marginRight: 10,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 10,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
