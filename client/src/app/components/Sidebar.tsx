import { Link, useLocation } from "react-router";
import { Search, Database, Users, Settings, Plus } from "lucide-react";

export function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="h-screen w-[240px] max-w-full shrink-0 border-r border-[#d2d8e0] bg-[#f3f4f6] text-[#3e4a5d]">
      <div className="flex h-full flex-col">
        <div className="border-b border-[#d2d8e0] px-4 py-2 overflow-hidden">
          <img
            src="/ep.svg"
            alt="Think logo"
            className="w-full h-16 object-cover object-[50%_40%]"
          />
        </div>

        <div className="border-b border-[#d2d8e0] px-3 py-3">
          <div className="relative rounded-[10px] border border-[#cfd5de] bg-[#f1f3f5] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa4b3]" />
            <input
              type="text"
              placeholder="Search modules..."
              className="w-full border-0 bg-transparent pl-7 text-[12px] leading-none font-medium tracking-[-0.01em] text-[#6d7488] outline-none placeholder:text-[#737b90]"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#677286]">Platform</p>

          <div className="space-y-4">
            <Link
              to="/operations"
              className={`group flex items-start gap-3 rounded-[10px] border px-3 py-2 transition-all ${
                isActive("/operations")
                  ? "border-transparent bg-[#e8edf5] text-[#1e293b]"
                  : "border-transparent text-[#425066] hover:bg-[#f0f2f8] hover:text-[#2f3c52]"
              }`}
            >
              <Database className="mt-0.5 h-4 w-4 shrink-0 text-current" />
              <div>
                <div className="text-[13px] leading-none font-semibold tracking-[-0.01em]">Operations</div>
                <div className="mt-1 text-[11px] leading-tight font-medium tracking-[-0.01em] text-[#5f6b7d]">
                  Storage diagnostics and backups
                </div>
              </div>
            </Link>

            <div>
              <Link
                to="/tenants"
                className={`group flex items-start gap-3 rounded-[10px] border px-3 py-2 transition-all ${
                  isActive("/tenants")
                    ? "border-transparent bg-[#e8edf5] text-[#1e293b]"
                    : "border-transparent text-[#425066] hover:bg-[#f0f2f8] hover:text-[#2f3c52]"
                }`}
              >
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-current" />
                <div>
                  <div className="text-[13px] leading-none font-semibold tracking-[-0.01em]">Customers / Tenants</div>
                  <div className="mt-1 text-[11px] leading-tight font-medium tracking-[-0.01em] text-[#5f6b7d]">
                    Onboarding, list and selection
                  </div>
                </div>
              </Link>

              <div className="ml-7 mt-3 space-y-1">
                <Link
                  to="/tenants/create"
                  className={`flex items-center gap-2 rounded-[8px] border px-2.5 py-1.5 text-[12px] font-medium tracking-[-0.01em] transition-all ${
                    isActive("/tenants/create")
                      ? "border-transparent bg-[#e8edf5] text-[#1e293b] shadow-[inset_3px_0_0_#7c3aed]"
                      : "border-transparent text-[#465368] hover:bg-[#eaeff8] hover:text-[#2e3b50]"
                  }`}
                >
                  <Plus className="h-3.5 w-3.5 shrink-0 text-current" />
                  Create Tenant
                </Link>
                <Link
                  to="/tenants"
                  className={`block rounded-[8px] border px-2.5 py-1.5 text-[12px] font-medium tracking-[-0.01em] transition-all ${
                    location.pathname === "/tenants"
                      ? "border-transparent bg-[#e8edf5] text-[#1e293b] shadow-[inset_3px_0_0_#7c3aed]"
                      : "border-transparent text-[#465368] hover:bg-[#eaeff8] hover:text-[#2e3b50]"
                  }`}
                >
                  Tenant Directory
                </Link>
              </div>
            </div>

            <Link
              to="/integrations"
              className={`group flex items-start gap-3 rounded-[10px] border px-3 py-2 transition-all ${
                isActive("/integrations")
                  ? "border-transparent bg-[#e8edf5] text-[#1e293b]"
                  : "border-transparent text-[#425066] hover:bg-[#f0f2f8] hover:text-[#2f3c52]"
              }`}
            >
              <Settings className="mt-0.5 h-4 w-4 shrink-0 text-current" />
              <div>
                <div className="text-[13px] leading-none font-semibold tracking-[-0.01em]">Integrations & Access</div>
                <div className="mt-1 text-[11px] leading-tight font-medium tracking-[-0.01em] text-[#5f6b7d]">
                  Domains, modules, tenant access
                </div>
              </div>
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
}
