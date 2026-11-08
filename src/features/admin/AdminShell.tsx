"use client";

import { useState } from "react";

import { useAppState } from "@/components/providers/AppProviders";
import { BranchList } from "@/features/admin/branches/BranchList";
import { BranchPanel } from "@/features/admin/branches/BranchPanel";
import { CreateBranchModal } from "@/features/admin/branches/CreateBranchModal";
import { BrandingPanel } from "@/features/admin/branding/BrandingPanel";
import { useAdminBranchSelection } from "@/features/admin/hooks/useAdminBranchSelection";
import { useAdminNotices } from "@/features/admin/hooks/useAdminNotices";
import { useAdminOrders } from "@/features/admin/hooks/useAdminOrders";
import { useAdminPush } from "@/features/admin/hooks/useAdminPush";
import { useBranchEditor } from "@/features/admin/hooks/useBranchEditor";
import { useBranchManager } from "@/features/admin/hooks/useBranchManager";
import { AdminHeader } from "@/features/admin/layout/AdminHeader";
import { AdminMobileDrawer } from "@/features/admin/layout/AdminMobileDrawer";
import { AdminSidebar } from "@/features/admin/layout/AdminSidebar";
import { AdminToasts } from "@/features/admin/layout/AdminToasts";
import type { AdminSection } from "@/features/admin/layout/navigation";
import { MenuPanel } from "@/features/admin/menu/MenuPanel";
import { OrderTracker } from "@/features/admin/orders/OrderTracker";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { useScrollToTopOnChange } from "@/lib/hooks/useScrollToTopOnChange";

/**
 * Panel de administración. Solo arma las piezas: cada hook tiene una responsabilidad
 * (pedidos, avisos push, sucursal…) y cada sección es su propio componente.
 */
export function AdminShell() {
  const { branches, currentUser, logout } = useAppState();
  const { notices, notify } = useAdminNotices();
  const [section, setSection] = useState<AdminSection>("orders");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showCreateBranch, setShowCreateBranch] = useState(false);

  const { adminBranchId, setAdminBranchId, selectedBranch } = useAdminBranchSelection(branches);
  const push = useAdminPush(currentUser, notify);
  const orders = useAdminOrders(selectedBranch, currentUser, notify);
  const branchEditor = useBranchEditor(selectedBranch, branches, notify);
  const branchManager = useBranchManager(branches, notify);

  useBodyScrollLock(mobileDrawerOpen || showCreateBranch);
  useScrollToTopOnChange([section, adminBranchId]);

  if (!currentUser) {
    return (
      <div className="rounded-shell border border-dashed border-line bg-panel p-6 text-sm text-muted">
        Inicia sesión.
      </div>
    );
  }

  const renderSidebar = (forceExpanded = false) => (
    <AdminSidebar
      collapsed={sidebarCollapsed && !forceExpanded}
      branches={branches}
      adminBranchId={adminBranchId}
      section={section}
      onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
      onSelectBranch={setAdminBranchId}
      onSelectSection={(next) => {
        setSection(next);
        setMobileDrawerOpen(false);
      }}
      onLogout={() => void logout()}
    />
  );

  return (
    <div className="min-h-screen bg-panel text-left text-text">
      <AdminToasts notices={notices} />

      <div className="flex min-h-screen">
        {/* Sidebar fija para escritorio */}
        <aside
          className={[
            "hidden h-screen sticky top-0 border-r border-line bg-panel transition-all duration-300 xl:block",
            sidebarCollapsed ? "w-[84px]" : "w-[288px]"
          ].join(" ")}
        >
          {renderSidebar()}
        </aside>

        <div className="flex flex-1 flex-col min-w-0">
          <AdminHeader
            title={sidebarCollapsed || mobileDrawerOpen ? "La Barra" : "Admin"}
            pushPermission={push.permission}
            onEnablePush={() => void push.enable()}
            onTestPush={() => void push.test()}
            onOpenDrawer={() => setMobileDrawerOpen(true)}
          />

          {mobileDrawerOpen && (
            <AdminMobileDrawer onClose={() => setMobileDrawerOpen(false)}>{renderSidebar(true)}</AdminMobileDrawer>
          )}

          <main className="space-y-6 p-4 text-left md:p-8">
            {section === "overview" && (
              <BranchList
                branches={branches}
                onAdd={() => setShowCreateBranch(true)}
                onEdit={(branchId) => {
                  setAdminBranchId(branchId);
                  setSection("business");
                }}
                onDelete={(branchId) => void branchManager.remove(branchId)}
              />
            )}

            {section === "business" && <BranchPanel editor={branchEditor} />}

            {section === "menu" && <MenuPanel branch={selectedBranch} allBranches={branches} notify={notify} />}

            {section === "themes" && <BrandingPanel branch={selectedBranch} notify={notify} />}

            {section === "orders" &&
              (selectedBranch ? (
                <OrderTracker
                  orders={orders.orders}
                  onAccept={(order) => void orders.accept(order)}
                  onReject={(order) => void orders.reject(order)}
                  onReady={(order) => void orders.markReady(order)}
                  onDelivered={(order) => void orders.markDelivered(order)}
                />
              ) : (
                <section className="rounded-shell border border-dashed border-line bg-panel p-6 text-center text-sm text-muted">
                  Selecciona una sucursal.
                </section>
              ))}
          </main>
        </div>
      </div>

      {showCreateBranch && (
        <CreateBranchModal
          manager={branchManager}
          onClose={() => setShowCreateBranch(false)}
          onCreated={(branchId) => {
            setAdminBranchId(branchId);
            setShowCreateBranch(false);
          }}
        />
      )}
    </div>
  );
}
