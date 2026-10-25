import React, { useState, useId, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Shield,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import i18n from "../../i18n";
import { cn } from "@/lib/utils";
import { matchesSuperAdminNavigationPath } from "./layoutMode";

export const drawerWidth = 336; // 80px rail + 256px panel
export const collapsedDrawerWidth = 80; // 80px rail only

export interface SuperAdminSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
}

import {
  getSuperAdminMenuGroups as getMenuGroups,
  type SuperAdminMenuItem,
  type SuperAdminMenuGroup,
} from "../../config/superAdminMenuConfig";

export {
  getMenuGroups,
  type SuperAdminMenuItem,
  type SuperAdminMenuGroup,
};

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  mobileOpen,
  setMobileOpen,
  isCollapsed,
  setIsCollapsed,
  user,
}) => {
  const location = useLocation();
  const searchInputId = useId();
  const [searchQuery, setSearchQuery] = useState("");

  const menuGroups = useMemo(() => getMenuGroups(i18n.t.bind(i18n)), []);

  // Find which group currently contains the active route
  const activeGroupIdFromRoute = useMemo(() => {
    const found = menuGroups.find((g) =>
      g.items.some((item) =>
        matchesSuperAdminNavigationPath(location.pathname, item.path, location.search)
      )
    );
    return found?.id || "home";
  }, [location.pathname, location.search, menuGroups]);

  const [activeGroupId, setActiveGroupId] = useState<string>(activeGroupIdFromRoute);

  useEffect(() => {
    if (activeGroupIdFromRoute) {
      setActiveGroupId(activeGroupIdFromRoute);
    }
  }, [activeGroupIdFromRoute]);

  const activeGroup = useMemo(
    () => menuGroups.find((g) => g.id === activeGroupId) || menuGroups[0],
    [menuGroups, activeGroupId]
  );

  // Filter items by search query across either the active group or all groups
  const displayedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return activeGroup?.items || [];
    }
    // If searching, search across all groups for maximum convenience
    const allMatches: SuperAdminMenuItem[] = [];
    menuGroups.forEach((g) => {
      g.items.forEach((item) => {
        if (item.text.toLowerCase().includes(q)) {
          allMatches.push(item);
        }
      });
    });
    return allMatches;
  }, [searchQuery, activeGroup, menuGroups]);

  const isRtl = i18n.dir() === "rtl";

  return (
    <>
      {/* Desktop Three-Tier Dual-Rail Sidebar - phones use the mobile drawer instead.
          The `super-admin-desktop-shell` marker lets sidebar-elite.css hide this shell
          below 640px: its unlayered `.business-sidebar-shell{display:flex}` rule beats
          Tailwind's `hidden` utility, which lives in @layer utilities. */}
      <aside
        className="hidden sm:flex shrink-0 h-full business-sidebar-shell super-admin-desktop-shell select-none"
        dir={i18n.dir()}
        aria-label="Super Admin Navigation"
      >
        {/* Tier 1: Icon Rail (Width 80px) */}
        <div className="business-sidebar-rail w-20 flex flex-col items-center py-6 shrink-0 z-20">
          <div className="business-sidebar-brand-block mb-6 shrink-0">
            <Link to="/super-admin/dashboard" className="block" title="MAX-P Control">
              <div className="business-brand-glyph" data-admin="true">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </Link>
          </div>

          <div className="business-sidebar-rail-scroll flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col items-center gap-1">
            {menuGroups.map((group) => {
              const isActive = activeGroupId === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    setActiveGroupId(group.id);
                    if (isCollapsed) setIsCollapsed(false);
                  }}
                  className="business-sidebar-rail-item w-full flex flex-col items-center py-2.5 px-1 bg-transparent border-0 cursor-pointer"
                  data-active={isActive}
                  title={group.title}
                >
                  <span className="business-sidebar-rail-icon flex items-center justify-center">{group.icon}</span>
                  <span className="business-sidebar-rail-label text-[11px] font-semibold text-center mt-1 leading-tight">{group.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier 2: Submenu Panel (Width 256px, collapsible) */}
        <div
          className="business-sidebar-panel flex flex-col h-full overflow-hidden"
          data-collapsed={isCollapsed}
        >
          <div className="business-sidebar-panel-header flex items-center justify-between p-4 border-b shrink-0">
            <div className="business-sidebar-company flex items-center gap-3 min-w-0">
              <div className="business-brand-glyph business-brand-glyph--small shrink-0">
                {user?.firstName?.charAt(0) || "M"}
              </div>
              <div className="business-sidebar-company-copy min-w-0">
                <h2 className="text-foreground text-sm font-bold truncate">التحكم الذكي</h2>
                <p className="text-xs text-muted-foreground truncate">{searchQuery ? "نتائج البحث" : activeGroup?.title || "إدارة النظام"}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="business-icon-button business-icon-button--sm shrink-0"
              aria-label={isCollapsed ? "توسيع القائمة" : "طي القائمة"}
              title={isCollapsed ? "توسيع القائمة" : "طي القائمة"}
            >
              {isRtl ? (
                isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              ) : (
                isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Search Box */}
          <div className="business-sidebar-search-wrap relative px-3 py-2 border-b shrink-0">
            <label htmlFor={searchInputId} className="sr-only">
              البحث في القوائم
            </label>
            <Search className="business-sidebar-search-icon" />
            <input
              id={searchInputId}
              type="text"
              autoComplete="off"
              placeholder="البحث في القوائم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="business-sidebar-search"
            />
            {!searchQuery && (
              <span className="pointer-events-none absolute inset-inline-end-4 top-1/2 -translate-y-1/2 rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                /
              </span>
            )}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="business-sidebar-clear-search"
                aria-label="مسح البحث"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Submenu Items List */}
          <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
            {displayedItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                لا توجد عناصر مطابقة للبحث
              </div>
            ) : (
              displayedItems.map((item) => {
                const isItemActive = matchesSuperAdminNavigationPath(
                  location.pathname,
                  item.path,
                  location.search
                );
                return (
                  <Link
                    key={item.path + item.text}
                    to={item.path}
                    className="business-sidebar-nav-link"
                    data-active={isItemActive}
                    aria-current={isItemActive ? "page" : undefined}
                  >
                    <span className="business-sidebar-nav-icon">{item.icon}</span>
                    <span className="business-sidebar-nav-text flex-1 truncate">{item.text}</span>
                    {isItemActive && (
                      <span className="size-1.5 rounded-full bg-white/90 shadow-sm shrink-0" />
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Responsive for screen < 640px) */}
      <div
        className="business-mobile-overlay sm:hidden"
        data-open={mobileOpen ? "true" : "false"}
        dir={i18n.dir()}
      >
        <div
          className="business-mobile-backdrop"
          data-open={mobileOpen ? "true" : "false"}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "business-mobile-drawer",
            isRtl ? "right-0" : "left-0"
          )}
          data-open={mobileOpen ? "true" : "false"}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="business-brand-glyph business-brand-glyph--small">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold">التحكم الذكي</h2>
                <p className="text-xs text-muted-foreground">إدارة النظام المركزي</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="business-icon-button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="البحث في القوائم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-xs rounded-lg border border-border bg-background"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Navigation List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {menuGroups.map((group) => {
              const items = searchQuery.trim()
                ? group.items.filter((i) =>
                    i.text.toLowerCase().includes(searchQuery.trim().toLowerCase())
                  )
                : group.items;

              if (items.length === 0) return null;

              return (
                <div key={group.id} className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-2">
                    {group.icon}
                    <span>{group.title}</span>
                  </div>
                  {items.map((item) => {
                    const isItemActive = matchesSuperAdminNavigationPath(
                      location.pathname,
                      item.path,
                      location.search
                    );
                    return (
                      <Link
                        key={item.path + item.text}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className="business-sidebar-nav-link"
                        data-active={isItemActive}
                      >
                        <span className="business-sidebar-nav-icon">{item.icon}</span>
                        <span className="business-sidebar-nav-text">{item.text}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default SuperAdminSidebar;
