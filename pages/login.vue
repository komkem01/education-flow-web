<template>
  <NuxtLayout name="auth">
    <div class="w-full max-w-5xl">
      <div class="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl border border-secondary-200 overflow-hidden">
        <section class="p-8 lg:p-10 bg-gradient-to-br from-primary-700 to-primary-900 text-white">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6 border border-white/20">
            <Icon name="lucide:graduation-cap" class="w-10 h-10 text-white" />
          </div>

          <h1 class="text-3xl font-bold leading-tight mb-3">Education Flow</h1>
          <p class="text-primary-100 text-sm mb-8">
            {{ ui.heroDescription }}
          </p>
        </section>

        <section class="p-8 lg:p-10">
          <div class="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold text-secondary-900 mb-2">{{ ui.loginTitle }}</h2>
              <p class="text-secondary-600">{{ ui.loginSubtitle }}</p>
            </div>

            <div class="flex items-center rounded-lg border border-secondary-200 bg-secondary-50 p-1">
              <button
                type="button"
                class="px-3 py-1.5 text-xs rounded-md transition"
                :class="locale === 'th' ? 'bg-white text-secondary-900 shadow-sm' : 'text-secondary-600'"
                @click="locale = 'th'"
              >
                TH
              </button>
              <button
                type="button"
                class="px-3 py-1.5 text-xs rounded-md transition"
                :class="locale === 'en' ? 'bg-white text-secondary-900 shadow-sm' : 'text-secondary-600'"
                @click="locale = 'en'"
              >
                EN
              </button>
            </div>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin">
            <UIInput
              v-model="credentials.email"
              :label="ui.emailLabel"
              type="email"
              :placeholder="ui.emailPlaceholder"
              required
              :error="errors.email"
            />

            <div v-if="showSuggestion" class="mb-4 rounded-lg border px-3 py-2" :class="suggestionStyleClass">
              <div class="flex items-center gap-2">
                <Icon name="lucide:sparkles" class="w-4 h-4" :class="suggestionTextClass" />
                <div class="text-xs font-medium" :class="suggestionTextClass">
                  {{ suggestedRoleText }}
                </div>
              </div>
            </div>

            <UIInput
              v-model="credentials.password"
              :label="ui.passwordLabel"
              type="password"
              :placeholder="ui.passwordPlaceholder"
              required
              :error="errors.password"
            />

            <div class="flex items-center justify-between mb-6">
              <label class="flex items-center">
                <input
                  v-model="rememberMe"
                  type="checkbox"
                  class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <span class="ml-2 text-sm text-secondary-700">{{ ui.rememberMe }}</span>
              </label>
              <a href="#" class="text-sm text-primary-600 hover:text-primary-700">{{ ui.forgotPassword }}</a>
            </div>

            <UIButton
              type="submit"
              variant="primary"
              class="w-full"
              :loading="loading"
              icon="lucide:log-in"
            >
              {{ ui.loginButton }}
            </UIButton>
          </form>

          <div class="mt-6 text-xs text-secondary-500 bg-secondary-50 border border-secondary-200 rounded-lg p-3">
            {{ ui.noAccountText }}
          </div>

          <!-- Footer -->
          <div class="mt-6 text-center text-sm text-secondary-500">
            <p>© 2026 Education Flow. All rights reserved.</p>
          </div>
        </section>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { LoginCredentials } from '~/types'

definePageMeta({
  layout: false
})

const authStore = useAuthStore()
const { success, error } = useToast()
const router = useRouter()
const locale = ref<'th' | 'en'>('th')

const ui = computed(() => {
  if (locale.value === 'en') {
    return {
      heroDescription: 'A unified workspace for every role in your school. Use one email account to sign in and access role-based permissions.',
      loginTitle: 'Sign In',
      loginSubtitle: 'Enter your email and password to continue',
      emailLabel: 'Email',
      emailPlaceholder: 'name@school.ac.th',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      rememberMe: 'Remember this device',
      forgotPassword: 'Forgot password?',
      loginButton: 'Sign In',
      noAccountText: 'If you do not have an account, please contact your school administrator.',
      roleHintPrefix: 'Suggested sign-in profile: ',
      unknownRole: 'Not identified yet'
    }
  }

  return {
    heroDescription: 'ศูนย์กลางการทำงานสำหรับทุกบทบาทในโรงเรียน ใช้บัญชีอีเมลเดียวเพื่อเข้าสู่ระบบและเข้าถึงสิทธิ์ตามหน้าที่ของคุณ',
    loginTitle: 'เข้าสู่ระบบ',
    loginSubtitle: 'กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งานระบบ',
    emailLabel: 'อีเมล',
    emailPlaceholder: 'name@school.ac.th',
    passwordLabel: 'รหัสผ่าน',
    passwordPlaceholder: 'กรอกรหัสผ่าน',
    rememberMe: 'จดจำการเข้าสู่ระบบ',
    forgotPassword: 'ลืมรหัสผ่าน?',
    loginButton: 'เข้าสู่ระบบ',
    noAccountText: 'หากคุณยังไม่มีบัญชีใช้งาน กรุณาติดต่อผู้ดูแลระบบของโรงเรียน',
    roleHintPrefix: 'รูปแบบผู้ใช้งานที่แนะนำ: ',
    unknownRole: 'ยังไม่ระบุ'
  }
})

const credentials = reactive<LoginCredentials>({
  email: '',
  password: ''
})

type SuggestionConfidence = 'high' | 'medium' | 'low'

const roleSuggestion = computed(() => {
  const email = credentials.email.trim().toLowerCase()

  if (!email || !email.includes('@')) {
    return {
      label: ui.value.unknownRole,
      confidence: 'low' as SuggestionConfidence
    }
  }

  const [localPart = '', domain = ''] = email.split('@')

  const getLabel = (role: 'super_admin' | 'school_admin' | 'staff' | 'teacher' | 'student' | 'generic') => {
    const map = {
      th: {
        super_admin: 'ซูเปอร์แอดมิน',
        school_admin: 'แอดมินโรงเรียน',
        staff: 'บุคลากร',
        teacher: 'ครู',
        student: 'นักเรียน',
        generic: 'ผู้ใช้ทั่วไป'
      },
      en: {
        super_admin: 'Super Admin',
        school_admin: 'School Admin',
        staff: 'Staff',
        teacher: 'Teacher',
        student: 'Student',
        generic: 'General User'
      }
    }
    return map[locale.value][role]
  }

  // High confidence by explicit local-part keywords
  if (/(^|\.|_|-)superadmin($|\.|_|-)|(^|\.|_|-)root($|\.|_|-)/.test(localPart)) {
    return { label: getLabel('super_admin'), confidence: 'high' as SuggestionConfidence }
  }
  if (/(^|\.|_|-)admin($|\.|_|-)/.test(localPart)) {
    return { label: getLabel('school_admin'), confidence: 'high' as SuggestionConfidence }
  }
  if (/(^|\.|_|-)staff($|\.|_|-)|personnel|officer/.test(localPart)) {
    return { label: getLabel('staff'), confidence: 'high' as SuggestionConfidence }
  }
  if (/(^|\.|_|-)teacher($|\.|_|-)|(^|\.|_|-)tchr($|\.|_|-)|(^|\.|_|-)tr($|\.|_|-)/.test(localPart)) {
    return { label: getLabel('teacher'), confidence: 'high' as SuggestionConfidence }
  }
  if (/(^|\.|_|-)student($|\.|_|-)|(^|\.|_|-)stu($|\.|_|-)|(^|\.|_|-)std($|\.|_|-)/.test(localPart)) {
    return { label: getLabel('student'), confidence: 'high' as SuggestionConfidence }
  }

  // Medium confidence by domain conventions
  if (/admin\./.test(domain)) {
    return { label: getLabel('school_admin'), confidence: 'medium' as SuggestionConfidence }
  }
  if (/staff\.|office\./.test(domain)) {
    return { label: getLabel('staff'), confidence: 'medium' as SuggestionConfidence }
  }
  if (/teacher\.|faculty\./.test(domain)) {
    return { label: getLabel('teacher'), confidence: 'medium' as SuggestionConfidence }
  }
  if (/student\.|stu\./.test(domain)) {
    return { label: getLabel('student'), confidence: 'medium' as SuggestionConfidence }
  }

  return { label: getLabel('generic'), confidence: 'low' as SuggestionConfidence }
})

const suggestedRoleText = computed(() => `${ui.value.roleHintPrefix}${roleSuggestion.value.label}`)

const showSuggestion = computed(() => {
  const email = credentials.email.trim()
  return email.length > 0 && roleSuggestion.value.label !== ui.value.unknownRole
})

const suggestionStyleClass = computed(() => {
  if (roleSuggestion.value.confidence === 'high') return 'border-success-200 bg-success-50'
  if (roleSuggestion.value.confidence === 'medium') return 'border-warning-200 bg-warning-50'
  return 'border-primary-200 bg-primary-50'
})

const suggestionTextClass = computed(() => {
  if (roleSuggestion.value.confidence === 'high') return 'text-success-800'
  if (roleSuggestion.value.confidence === 'medium') return 'text-warning-900'
  return 'text-primary-800'
})

const errors = reactive({
  email: '',
  password: ''
})

const rememberMe = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  // Reset errors
  errors.email = ''
  errors.password = ''

  // Validation
  if (!credentials.email) {
    errors.email = locale.value === 'en' ? 'Please enter your email' : 'กรุณากรอกอีเมล'
    return
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(credentials.email)) {
    errors.email = locale.value === 'en' ? 'Invalid email format' : 'รูปแบบอีเมลไม่ถูกต้อง'
    return
  }

  if (!credentials.password) {
    errors.password = locale.value === 'en' ? 'Please enter your password' : 'กรุณากรอกรหัสผ่าน'
    return
  }

  loading.value = true

  try {
    const response = await authStore.login(credentials)
    success(locale.value === 'en' ? 'Sign in successful' : 'เข้าสู่ระบบสำเร็จ')

    // Redirect based on role
    const role = response.user.roles[0]
    const dashboardPaths: Record<string, string> = {
      super_admin: '/super-admin',
      admin: '/admin',
      staff: '/staff',
      teacher: '/teacher',
      student: '/student',
      parent: '/parent'
    }

    router.push((role && dashboardPaths[role]) || '/admin')
  } catch (err: any) {
    console.error('Login error:', err)
    error(err?.data?.message || (locale.value === 'en'
      ? 'Sign in failed. Please check your email and password.'
      : 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน'))
  } finally {
    loading.value = false
  }
}

// Redirect if already logged in
onMounted(() => {
  if (authStore.isAuthenticated) {
    const role = authStore.currentRole
    const dashboardPaths: Record<string, string> = {
      super_admin: '/super-admin',
      admin: '/admin',
      staff: '/staff',
      teacher: '/teacher',
      student: '/student',
      parent: '/parent'
    }
    router.push((role && dashboardPaths[role]) || '/admin')
  }
})
</script>
