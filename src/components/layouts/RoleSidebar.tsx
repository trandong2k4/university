import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, GraduationCap, LogOut } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { LogoutConfirmDialog } from '@/components/common/LogoutConfirmDialog';
import { useAuth } from '@/hooks';

export interface RoleSidebarItem {
  id: string;
  icon: ReactNode;
  label: string;
  path: string;
  exact?: boolean;
}

export interface RoleSidebarGroup {
  title?: string;
  items: RoleSidebarItem[];
  defaultOpen?: boolean;
}

interface RoleSidebarProps {
  roleLabel: string;
  menuGroups: RoleSidebarGroup[];
}

const isItemActive = (pathname: string, item: RoleSidebarItem) => {
  if (item.exact) return pathname === item.path;
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
};

export function RoleSidebar({ roleLabel, menuGroups }: RoleSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const navRef = useRef<HTMLElement>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const storageKey = useMemo(() => `role-sidebar:${roleLabel}`, [roleLabel]);

  const initialOpenGroups = useMemo(() => {
    return menuGroups.reduce<Record<string, boolean>>((acc, group, index) => {
      const key = group.title ?? `group-${index}`;
      const hasActiveItem = group.items.some((item) => isItemActive(location.pathname, item));
      acc[key] = group.defaultOpen ?? hasActiveItem ?? true;
      return acc;
    }, {});
  }, [location.pathname, menuGroups]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return initialOpenGroups;

    try {
      const saved = window.sessionStorage.getItem(`${storageKey}:open-groups`);
      return saved ? { ...initialOpenGroups, ...JSON.parse(saved) } : initialOpenGroups;
    } catch {
      return initialOpenGroups;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(`${storageKey}:open-groups`, JSON.stringify(openGroups));
  }, [openGroups, storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const nav = navRef.current;
    if (!nav) return;

    const saved = window.sessionStorage.getItem(`${storageKey}:scroll-top`);
    if (saved) {
      requestAnimationFrame(() => {
        nav.scrollTop = Number(saved) || 0;
      });
    }
  }, [storageKey]);

  const rememberScrollPosition = () => {
    if (typeof window === 'undefined') return;
    const nav = navRef.current;
    if (!nav) return;
    window.sessionStorage.setItem(`${storageKey}:scroll-top`, String(nav.scrollTop));
  };

  const confirmLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-800 bg-slate-900 shadow-2xl">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-600 p-2 shadow-lg shadow-emerald-900/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
                LearningHub
              </h1>
              <p className="truncate text-xs text-slate-400" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {roleLabel}
              </p>
            </div>
          </div>
        </div>

        <nav
          ref={navRef}
          onScroll={rememberScrollPosition}
          className="min-h-0 flex-1 overflow-y-auto p-3"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="space-y-4">
            {menuGroups.map((group, index) => {
              const key = group.title ?? `group-${index}`;
              const isOpen = openGroups[key] ?? true;

              return (
                <div key={key} className="space-y-1">
                  {group.title && (
                    <button
                      type="button"
                      onClick={() => setOpenGroups((prev) => ({ ...prev, [key]: !isOpen }))}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:bg-slate-800/70 hover:text-slate-300"
                    >
                      <span className="truncate">{group.title}</span>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}

                  {isOpen && (
                    <div className="space-y-0.5">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          end={item.exact}
                          onClick={rememberScrollPosition}
                          className={({ isActive }) => {
                            const active = isActive || isItemActive(location.pathname, item);
                            return [
                              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                              active
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                            ].join(' ');
                          }}
                        >
                          <span className="shrink-0">{item.icon}</span>
                          <span className="truncate font-medium">{item.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </button>
        </div>

        <div className="border-t border-slate-800 p-3">
          <p className="text-center text-xs text-slate-500" style={{ fontFamily: "'Manrope', sans-serif" }}>
            © 2026 LearningHub
          </p>
        </div>
      </div>

      <LogoutConfirmDialog
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </aside>
  );
}
