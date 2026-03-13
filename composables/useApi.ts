export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

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
    if (endpoint.startsWith('/auth/')) return options

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
    try {
      const scopedOptions = withSchoolScopeParams(endpoint, options)
      const response = await $fetch<T>(`${config.public.apiBase}${endpoint}`, {
        ...scopedOptions,
        headers: {
          ...scopedOptions.headers,
          Authorization: `Bearer ${authStore.accessToken}`
        }
      })

      return filterResponseBySchool(response)
    } catch (error: any) {
      // Handle 401 - Unauthorized
      if (error?.response?.status === 401) {
        try {
          await authStore.refreshAccessToken()
          // Retry the request
          const scopedOptions = withSchoolScopeParams(endpoint, options)
          const retried = await $fetch<T>(`${config.public.apiBase}${endpoint}`, {
            ...scopedOptions,
            headers: {
              ...scopedOptions.headers,
              Authorization: `Bearer ${authStore.accessToken}`
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
