import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  Inbox,
  Receipt,
  ListChecks,
  CreditCard,
  Target,
  TrendingUp,
  Settings,
  LogOut,
  MoreHorizontal,
  X,
} from 'lucide-react'
import { signOut } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/billeteras', label: 'Billeteras', icon: Wallet },
  { to: '/sobres', label: 'Sobres', icon: Inbox },
  { to: '/gastos', label: 'Gastos', icon: Receipt },
  { to: '/presupuesto', label: 'Presupuesto', icon: ListChecks },
  { to: '/deudas', label: 'Deudas', icon: CreditCard },
  { to: '/metas', label: 'Metas', icon: Target },
  { to: '/tasas', label: 'Tasas', icon: TrendingUp },
  { to: '/configuracion', label: 'Config', icon: Settings },
]

const primaryMobileNav = navItems.slice(0, 4)
const secondaryMobileNav = navItems.slice(4)

function NavItem({
  to,
  label,
  icon: Icon,
  compact = false,
  onClick,
}: {
  to: string
  label: string
  icon: React.ElementType
  compact?: boolean
  onClick?: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-ui transition-colors',
          isActive
            ? 'bg-canvas-muted text-ink'
            : 'text-ink-muted hover:text-ink hover:bg-canvas-muted/50',
          compact && 'flex-col gap-0.5 px-2 py-2 text-xs',
        )
      }
    >
      <Icon className={cn('shrink-0', compact ? 'w-5 h-5' : 'w-4 h-4')} />
      <span>{label}</span>
    </NavLink>
  )
}

export function AppShell() {
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const currentPage = navItems.find((item) => item.to === location.pathname)?.label ?? ''

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-56 flex-col bg-canvas-soft border-r border-border z-10">
        <div className="px-4 py-5">
          <span className="font-display italic text-2xl text-gold">sobres.</span>
        </div>
        <nav className="flex-1 px-3 pb-3 flex flex-col gap-1" aria-label="Navegación principal">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
        <div className="px-3 pb-4">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-ink-muted hover:text-coral hover:bg-coral/10 transition-colors font-ui"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-10 bg-canvas-soft border-b border-border px-4 py-3 flex items-center justify-between">
        <span className="font-display italic text-xl text-gold">sobres.</span>
        {currentPage && (
          <span className="text-sm font-ui text-ink-muted">{currentPage}</span>
        )}
      </header>

      {/* Main content */}
      <main className="md:ml-56 min-h-screen pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6 md:px-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-canvas-soft border-t border-border z-10"
        aria-label="Navegación móvil"
      >
        <div className="flex items-center justify-around px-2 py-1">
          {primaryMobileNav.map((item) => (
            <NavItem key={item.to} {...item} compact />
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-xs font-ui transition-colors',
              moreOpen ? 'text-ink' : 'text-ink-muted hover:text-ink',
            )}
            aria-label="Más opciones"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span>Más</span>
          </button>
        </div>
      </nav>

      {/* Mobile "Más" slide-up panel */}
      {moreOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-20"
            onClick={() => setMoreOpen(false)}
          />
          <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-canvas-soft rounded-t-2xl border-t border-border pb-safe">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-sm font-ui font-semibold text-ink-muted uppercase tracking-wide">
                Más opciones
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="px-3 pb-3 flex flex-col gap-1">
              {secondaryMobileNav.map((item) => (
                <NavItem key={item.to} {...item} onClick={() => setMoreOpen(false)} />
              ))}
              <div className="border-t border-border mt-2 pt-2">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-ink-muted hover:text-coral hover:bg-coral/10 transition-colors font-ui"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Salir</span>
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
