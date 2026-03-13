export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Restore session if exists
  if (import.meta.client) {
    await authStore.restoreSession()
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Check if accessing role-specific route
  const routePath = to.path
  const role = authStore.currentRole

  // Define route role requirements
  const roleRoutes: Record<string, string> = {
    '/super-admin': 'super_admin',
    '/admin': 'admin',
    '/staff': 'staff',
    '/teacher': 'teacher',
    '/student': 'student',
    '/parent': 'parent'
  }

  const dashboardPaths: Record<string, string> = {
    super_admin: '/super-admin',
    admin: '/admin',
    staff: '/staff',
    teacher: '/teacher',
    student: '/student',
    parent: '/parent'
  }

  // Check if route requires specific role
  for (const [path, requiredRole] of Object.entries(roleRoutes)) {
    if (routePath.startsWith(path)) {
      if (!authStore.userRoles.includes(requiredRole as any)) {
        // User doesn't have this role, redirect to their default dashboard
        const defaultPath = role ? dashboardPaths[role] : '/login'
        return navigateTo(defaultPath || '/login')
      }
    }
  }

  const permissions = authStore.user?.permissions || []
  const hasPermission = (checks: string[]) => {
    if (permissions.length === 0) return true
    return checks.some((permission) => permissions.includes(permission))
  }

  const routePermissionRules: Array<{ prefix: string; permissions: string[] }> = [
    { prefix: '/super-admin/schools', permissions: ['platform:schools:write', 'backoffice:read', 'backoffice:write'] },
    { prefix: '/admin', permissions: ['backoffice:read', 'backoffice:write'] },
    { prefix: '/staff', permissions: ['backoffice:read', 'backoffice:write'] },
    { prefix: '/teacher', permissions: ['teacher:self:read', 'backoffice:read', 'backoffice:write'] },
    { prefix: '/student', permissions: ['student:self:read', 'backoffice:read', 'backoffice:write'] },
    { prefix: '/parent', permissions: ['parent:self:read', 'backoffice:read', 'backoffice:write'] }
  ]

  const matchedRule = routePermissionRules.find((rule) => routePath.startsWith(rule.prefix))
  if (matchedRule && !hasPermission(matchedRule.permissions)) {
    const defaultPath = role ? dashboardPaths[role] : '/login'
    return navigateTo(defaultPath || '/login')
  }
})
