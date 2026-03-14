import type { UserRole } from '~/types'

export const useScopeAccess = () => {
  const authStore = useAuthStore()

  const isSuperAdmin = computed(() => authStore.currentRole === 'super_admin')
  const currentRole = computed(() => authStore.currentRole)
  const permissions = computed(() => authStore.user?.permissions || [])
  const scopedSchoolIds = computed(() => authStore.user?.schoolScope?.schoolIds || [])
  const canManageAllSchools = computed(() => !!authStore.user?.schoolScope?.canManageAllSchools)

  const roleAllowsWriteByDefault = () => {
    if (currentRole.value === 'super_admin') return true
    if (currentRole.value === 'staff') return true
    if (currentRole.value === 'admin') return true
    return false
  }

  const hasPermission = (resource: string, action: string) => {
    const values = permissions.value
    if (values.length === 0) {
      if (normalizedAction === 'read') return true
      return roleAllowsWriteByDefault()
    }

    const normalizedAction = action === 'approve' ? 'write' : action

    const direct = `${resource}:${normalizedAction}`

    if (values.includes(direct) || values.includes(`${resource}:*`) || values.includes('*:*')) {
      return true
    }

    if (normalizedAction === 'read') {
      if (values.includes('backoffice:read') || values.includes('backoffice:write')) {
        return true
      }
      if (resource === 'teacher' && values.includes('teacher:self:read')) return true
      if ((resource === 'student' || resource === 'grades' || resource === 'attendance' || resource === 'schedule') && values.includes('student:self:read')) return true
      if ((resource === 'children' || resource === 'payments' || resource === 'parent') && values.includes('parent:self:read')) return true
    }

    if (normalizedAction === 'write') {
      if (values.includes('backoffice:write')) {
        return true
      }
      if (resource === 'teacher' && values.includes('teacher:self:write')) return true
    }

    return false
  }

  const canAccessSchool = (schoolId?: string) => {
    if (isSuperAdmin.value || canManageAllSchools.value) return true
    if (!schoolId) return true

    if (scopedSchoolIds.value.length > 0) {
      return scopedSchoolIds.value.includes(schoolId)
    }

    return authStore.user?.schoolId === schoolId
  }

  const canRead = (resource: string, schoolId?: string) => {
    return hasPermission(resource, 'read') && canAccessSchool(schoolId)
  }

  const canWrite = (resource: string, schoolId?: string) => {
    return hasPermission(resource, 'write') && canAccessSchool(schoolId)
  }

  const canMutateByRole = (resource: string, schoolId?: string) => {
    return canWrite(resource, schoolId)
  }

  const canSeeAction = (resource: string, action: 'read' | 'write' | 'approve', schoolId?: string) => {
    return action === 'read' ? canRead(resource, schoolId) : canWrite(resource, schoolId)
  }

  const actionDisabledReason = (resource: string, action: 'read' | 'write' | 'approve', schoolId?: string) => {
    if (canSeeAction(resource, action, schoolId)) return ''

    if (!canAccessSchool(schoolId)) {
      return 'สิทธิ์ถูกจำกัดเฉพาะโรงเรียนของคุณ'
    }

    return 'ไม่มีสิทธิ์ใช้งานตาม scope ที่ได้รับ'
  }

  const defaultProfilePathByRole: Record<UserRole, string> = {
    super_admin: '/super-admin',
    admin: '/admin/profile',
    staff: '/staff/profile',
    teacher: '/teacher/profile',
    student: '/student/profile',
    parent: '/parent/profile'
  }

  return {
    isSuperAdmin,
    permissions,
    scopedSchoolIds,
    canManageAllSchools,
    canAccessSchool,
    canRead,
    canWrite,
    canMutateByRole,
    canSeeAction,
    actionDisabledReason,
    defaultProfilePathByRole
  }
}
