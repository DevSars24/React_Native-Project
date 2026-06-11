import { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/context/toast-context';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const theme = useTheme();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Button Animation Scale
  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const validate = useCallback(() => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      valid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Enter a valid email address');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    return valid;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email);
      showToast('Logged in successfully!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  }, [login, email, showToast, validate]);

  const onPressIn = useCallback(() => {
    buttonScale.value = withTiming(0.95, { duration: 100 });
  }, [buttonScale]);

  const onPressOut = useCallback(() => {
    buttonScale.value = withTiming(1, { duration: 100 });
  }, [buttonScale]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Header/Logo Section */}
          <Animated.View 
            entering={FadeInDown.duration(600).delay(100)} 
            style={styles.header}
          >
            <Text style={styles.logoEmoji}>🛒</Text>
            <Text style={[styles.title, { color: theme.text }]}>Welcome to ZapMart</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Sign in to experience high-speed grocery shopping.
            </Text>
          </Animated.View>

          {/* Form Fields Card */}
          <Animated.View 
            entering={FadeInDown.duration(600).delay(200)} 
            style={[
              styles.formCard, 
              { 
                backgroundColor: theme.backgroundElement,
                borderColor: theme.backgroundSelected 
              }
            ]}
          >
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError('');
                }}
                placeholder="example@gmail.com"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[
                  styles.input, 
                  { 
                    color: theme.text,
                    backgroundColor: theme.background,
                    borderColor: emailError ? '#e63946' : theme.backgroundSelected
                  }
                ]}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                  }}
                  placeholder="••••••••"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    styles.passwordInput,
                    { 
                      color: theme.text,
                      backgroundColor: theme.background,
                      borderColor: passwordError ? '#e63946' : theme.backgroundSelected
                    }
                  ]}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.visibilityBtn}
                >
                  <Text style={{ color: '#168f6d', fontWeight: 'bold' }}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* Login Button */}
            <Animated.View style={animatedButtonStyle}>
              <TouchableOpacity
                onPress={handleLogin}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={1}
                disabled={loading}
                style={[styles.loginBtn, { backgroundColor: '#168f6d' }]}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.loginBtnText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Footer redirection link */}
          <Animated.View 
            entering={FadeInDown.duration(600).delay(300)} 
            style={styles.footer}
          >
            <Text style={{ color: theme.textSecondary }}>Don't have an account? </Text>
            <Pressable onPress={() => router.push('/signup' as any)}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </Pressable>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoEmoji: {
    fontSize: 56,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
      }
    }),
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
  },
  visibilityBtn: {
    position: 'absolute',
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  errorText: {
    color: '#e63946',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  loginBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  signupLink: {
    color: '#168f6d',
    fontWeight: '800',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
