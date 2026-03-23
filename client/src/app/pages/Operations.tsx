import { Header } from "../components/Header";
import { Database, HardDrive, Archive } from "lucide-react";

export function Operations() {
  return (
    <div className="h-full flex flex-col">
      <Header
        title="Operations"
        subtitle="Storage diagnostics and backups"
      />

      <div className="flex-1 bg-gray-50 overflow-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Database</h3>
                <p className="text-sm text-gray-500">Status: Healthy</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Monitor database performance and connections</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Storage</h3>
                <p className="text-sm text-gray-500">Usage: 45%</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">View storage usage and diagnostics</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Archive className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Backups</h3>
                <p className="text-sm text-gray-500">Last: 2 hours ago</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Manage automated backup schedules</p>
          </div>
        </div>
      </div>
    </div>
  );
}
