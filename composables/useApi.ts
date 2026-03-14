export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // Canonical protected resources are served under /back-office.
  const backOfficeResourceRoots = new Set([
    'academic-years',
    'schools',
    'genders',
    'prefixes',
    'classrooms',
    'departments',
    'courses',
    'subjects',
    'subject-groups',
    'subject-subgroups',
    'subject-assignments',
    'schedules',
    'question-banks',
    'question-choices',
    'assessment-sets',
    'members',
    'admins',
    'staffs',
    'teachers',
    'students',
    'inventory-items',
    'inventory-requests',
    'document-tracking',
    'school-announcements',
    'school-calendar-events',
    'student-behaviors',
    'storages',
    'storage-links',
    'reports'
  ])

  const normalizeEndpoint = (endpoint: string) => {
    if (!endpoint) return endpoint
    if (endpoint.startsWith('/back-office/')) return endpoint

    if (!endpoint.startsWith('/')) return endpoint
    if (endpoint.startsWith('/auth/')) return endpoint

    const [root] = endpoint.slice(1).split('/')
    if (root && backOfficeResourceRoots.has(root)) {
      return `/back-office${endpoint}`
    }

    return endpoint
  }

  const resolveAccessToken = () => {
    if (authStore.accessToken) return authStore.accessToken
    if (!import.meta.client) return null

    const storedAccessToken = localStorage.getItem('accessToken')
    if (storedAccessToken && !authStore.accessToken) {
      authStore.accessToken = storedAccessToken
    }
    return storedAccessToken
  }

  const normalizeSchoolId = (row: any) => {
    if (!row || typeof row !== 'object') return ''
    return String(row.school_id || row.schoolId || '').trim()
  }

  const shouldForceSchoolScope = () => {
    if (!authStore.user?.schoolId) return false
    if (authStore.currentRole === 'super_admin') return false
    if (authStore.user?.schoolScope?.canManageAllSchools) return false
    return true
  }

  const withSchoolScopeParams = (endpoint: string, options: any) => {
    if (!shouldForceSchoolScope()) return options
    if (endpoint.startsWith('/auth/') || endpoint.startsWith('/back-office/auth/')) return options

    const next = { ...options }
    next.params = {
      ...(options?.params || {}),
      school_id: authStore.user?.schoolId
    }

    return next
  }

  const filterResponseBySchool = <T>(response: T): T => {
    if (!shouldForceSchoolScope()) return response

    const schoolId = authStore.user?.schoolId
    if (!schoolId) return response

    const payload: any = response
    if (!payload || typeof payload !== 'object') return response

    if (Array.isArray(payload.data)) {
      payload.data = payload.data.filter((item: any) => {
        const rowSchoolId = normalizeSchoolId(item)
        if (!rowSchoolId) return true
        return rowSchoolId === schoolId
      })
    }

    if (Array.isArray(payload)) {
      return payload.filter((item: any) => {
        const rowSchoolId = normalizeSchoolId(item)
        if (!rowSchoolId) return true
        return rowSchoolId === schoolId
      }) as T
    }

    return payload as T
  }

  const apiFetch = async <T = any>(endpoint: string, options: any = {}) => {
    const normalizedEndpoint = normalizeEndpoint(endpoint)
    try {
      const scopedOptions = withSchoolScopeParams(normalizedEndpoint, options)
      const token = resolveAccessToken()
      const response = await $fetch<T>(`${config.public.apiBase}${normalizedEndpoint}`, {
        ...scopedOptions,
        headers: {
          ...scopedOptions.headers,
          Authorization: token ? `Bearer ${token}` : ''
        }
      })

      return filterResponseBySchool(response)
    } catch (error: any) {
      // Handle 401 - Unauthorized
      if (error?.response?.status === 401) {
        try {
          await authStore.refreshAccessToken()
          // Retry the request
          const scopedOptions = withSchoolScopeParams(normalizedEndpoint, options)
          const token = resolveAccessToken()
          const retried = await $fetch<T>(`${config.public.apiBase}${normalizedEndpoint}`, {
            ...scopedOptions,
            headers: {
              ...scopedOptions.headers,
              Authorization: token ? `Bearer ${token}` : ''
            }
          })
          return filterResponseBySchool(retried)
        } catch (refreshError) {
          await authStore.logout()
          throw refreshError
        }
      }

      throw error
    }
  }

  return {
    apiFetch
  }
}
