import { Header } from "../components/Header";
import { Globe, Lock, Plug } from "lucide-react";

export function Integrations() {
  return (
    <div className="h-full flex flex-col">
      <Header
        title="Integrations & Access"
        subtitle="Domains, modules, and tenant access"
      />

      <div className="flex-1 bg-gray-50 overflow-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Domains</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600">Manage domain configurations and SSL certificates</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Plug className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Modules</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600">Configure content modules and features</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Lock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tenant Access</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600">Control tenant permissions and access levels</p>
          </div>
        </div>
      </div>
    </div>
  );
}
