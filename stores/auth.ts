import { defineStore } from 'pinia'
import { UserRole, type User, type LoginCredentials, type LoginResponse } from '~/types'
import { API_ENDPOINTS } from '~/constants'

interface ApiEnvelope<T> {
  code: string
  message: string
  data: T
}

interface BackendLoginData {
  access_token: string
  token_type: string
  expires_at: string
  member: {
    id: string
    school_id: string
    school_name?: string
    email: string
    role: string
    roles: string[]
    permissions?: string[]
    school_ids?: string[]
    can_manage_all_schools?: boolean
    school_scope?: {
      school_ids?: string[]
      can_manage_all_schools?: boolean
    }
    is_active: boolean
  }
}

interface BackendMeData {
  member_id: string
  school_id: string
  role: string
  roles: string[]
  issued_at: string
  expires_at: string
}

interface BackendPermissionsData {
  member_id: string
  school_id: string
  roles: string[]
  permissions: string[]
  back_office: boolean
  primary_role: string
  token_expires: string
}

interface BackendSchoolData {
  id: string
  code?: string
  name?: string
  name_en?: string
}

const roleValues: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.STAFF,
  UserRole.TEACHER,
  UserRole.STUDENT,
  UserRole.PARENT
]

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)
  const currentRole = ref<UserRole | null>(null)

  // Getters
  const userRoles = computed(() => user.value?.roles || [])
  const hasMultipleRoles = computed(() => userRoles.value.length > 1)
  const canSwitchRole = computed(() => hasMultipleRoles.value && user.value?.roles.length !== 1)

  const normalizeRoles = (roles: string[]) => {
    return (roles || []).filter((role): role is UserRole => roleValues.includes(role as UserRole))
  }

  const hydrateAuthContext = async (token: string, baseUser?: Partial<User>) => {
    const config = useRuntimeConfig()

    const meResponse = await $fetch<ApiEnvelope<BackendMeData>>(`${config.public.apiBase}${API_ENDPOINTS.ME}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const permissionsResponse = await $fetch<ApiEnvelope<BackendPermissionsData>>(`${config.public.apiBase}${API_ENDPOINTS.PERMISSIONS}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const me = meResponse.data
    const perm = permissionsResponse.data
    const roles = normalizeRoles(me.roles || perm.roles || [])
    const primaryRole = roles[0] || null

    let schoolName = baseUser?.schoolName
    if (me.school_id) {
      try {
        const schoolResponse = await $fetch<ApiEnvelope<BackendSchoolData>>(`${config.public.apiBase}/schools/${me.school_id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        schoolName = schoolResponse.data?.name || schoolResponse.data?.name_en || schoolName
      } catch {
        // Keep existing school name if school detail endpoint is unavailable.
      }
    }

    const mergedUser: User = {
      id: me.member_id || baseUser?.id || '',
      email: baseUser?.email || '',
      username: baseUser?.username || '',
      firstName: baseUser?.firstName || '',
      lastName: baseUser?.lastName || '',
      fullName: baseUser?.fullName || (baseUser?.email || ''),
      roles,
      schoolId: me.school_id,
      schoolName,
      permissions: perm.permissions || [],
      schoolScope: {
        schoolIds: me.school_id ? [me.school_id] : [],
        canManageAllSchools: roles.includes(UserRole.SUPER_ADMIN)
      },
      avatar: baseUser?.avatar,
      phoneNumber: baseUser?.phoneNumber,
      isActive: baseUser?.isActive ?? true,
      createdAt: baseUser?.createdAt || '',
      updatedAt: baseUser?.updatedAt || ''
    }

    user.value = mergedUser
    currentRole.value = primaryRole

    if (import.meta.client) {
      localStorage.setItem('user', JSON.stringify(mergedUser))
      if (primaryRole) {
        localStorage.setItem('currentRole', primaryRole)
      }
    }
  }

  // Actions
  const login = async (credentials: LoginCredentials) => {
    try {
      const config = useRuntimeConfig()
      const apiResponse = await $fetch<ApiEnvelope<BackendLoginData>>(`${config.public.apiBase}${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        body: {
          email: credentials.email,
          password: credentials.password
        }
      })

      const member = apiResponse.data.member
      const roles = normalizeRoles(member.roles || [])

      const emailPrefix = member.email.split('@')[0] || member.email
      const normalizedUser: User = {
        id: member.id,
        email: member.email,
        username: emailPrefix,
        firstName: emailPrefix,
        lastName: '',
        fullName: emailPrefix,
        roles,
        schoolId: member.school_id,
        schoolName: member.school_name,
        permissions: member.permissions || [],
        schoolScope: {
          schoolIds: member.school_scope?.school_ids || member.school_ids || [],
          canManageAllSchools: !!(member.school_scope?.can_manage_all_schools || member.can_manage_all_schools)
        },
        isActive: member.is_active,
        createdAt: '',
        updatedAt: ''
      }

      const expiresAtMs = Date.parse(apiResponse.data.expires_at)
      const expiresInSeconds = Number.isNaN(expiresAtMs)
        ? 0
        : Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000))

      const response: LoginResponse = {
        user: normalizedUser,
        tokens: {
          accessToken: apiResponse.data.access_token,
          refreshToken: '',
          expiresIn: expiresInSeconds
        }
      }

      user.value = response.user
      accessToken.value = response.tokens.accessToken
      refreshToken.value = response.tokens.refreshToken

      // Store token first, then hydrate context from /auth/me and /auth/permissions
      if (import.meta.client) {
        localStorage.setItem('accessToken', response.tokens.accessToken)
        if (response.tokens.refreshToken) {
          localStorage.setItem('refreshToken', response.tokens.refreshToken)
        }
      }

      await hydrateAuthContext(response.tokens.accessToken, response.user)

      return response
    } catch (error: any) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const config = useRuntimeConfig()
      if (accessToken.value) {
        await $fetch(`${config.public.apiBase}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken.value}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear state
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      currentRole.value = null

      // Clear localStorage
      if (import.meta.client) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('currentRole')
      }

      // Redirect to login
      navigateTo('/login')
    }
  }

  const switchRole = (role: UserRole) => {
    if (user.value?.roles.includes(role)) {
      currentRole.value = role
      if (import.meta.client) {
        localStorage.setItem('currentRole', role)
      }
      
      // Redirect to role dashboard
      const dashboardPaths: Record<UserRole, string> = {
        super_admin: '/super-admin',
        admin: '/admin',
        staff: '/staff',
        teacher: '/teacher',
        student: '/student',
        parent: '/parent'
      }
      navigateTo(dashboardPaths[role])
    }
  }

  const restoreSession = async () => {
    if (import.meta.client) {
      const storedUser = localStorage.getItem('user')
      const storedAccessToken = localStorage.getItem('accessToken')
      const storedRefreshToken = localStorage.getItem('refreshToken')
      const storedRole = localStorage.getItem('currentRole')

      if (storedUser && storedAccessToken) {
        user.value = JSON.parse(storedUser)
        accessToken.value = storedAccessToken
        refreshToken.value = storedRefreshToken
        currentRole.value = (storedRole as UserRole | null) || user.value?.roles[0] || null

        try {
          await hydrateAuthContext(storedAccessToken, user.value || undefined)
        } catch (error) {
          console.error('Restore session hydrate failed:', error)
        }
      }
    }
  }

  const refreshAccessToken = async () => {
    try {
      const config = useRuntimeConfig()
      if (!refreshToken.value) {
        throw new Error('No refresh token available')
      }

      const response = await $fetch<{ accessToken: string }>(`${config.public.apiBase}/auth/refresh`, {
        method: 'POST',
        body: { refreshToken: refreshToken.value }
      })

      accessToken.value = response.accessToken
      if (import.meta.client) {
        localStorage.setItem('accessToken', response.accessToken)
      }

      return response.accessToken
    } catch (error) {
      console.error('Token refresh error:', error)
      await logout()
      throw error
    }
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    currentRole,
    
    // Getters
    userRoles,
    hasMultipleRoles,
    canSwitchRole,
    
    // Actions
    login,
    logout,
    switchRole,
    restoreSession,
    refreshAccessToken
  }
})
