import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export function CreateTenant() {
  const navigate = useNavigate();
  const [tenantName, setTenantName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("active");
  const [primaryColor, setPrimaryColor] = useState("#2563EB");

  const colorPresets = [
    { name: "Blue", value: "#2563EB" },
    { name: "Purple", value: "#9F76E6" },
    { name: "Teal", value: "#7C3AED" },
    { name: "Cyan", value: "#0EA5E9" },
    { name: "Dark", value: "#111827" },
  ];

  const handleCreate = () => {
    // Mock creation - in real app this would call your backend
    navigate("/tenants");
  };

  return (
    <div className="h-full flex flex-col">
      <Header
        title="Create Tenant"
        subtitle="Onboard a new customer tenant"
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-8 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="hover:text-gray-900 cursor-pointer">Platform</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-gray-900 cursor-pointer">Customers / Tenants</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Create New Tenant</span>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 overflow-auto p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Tenant</h2>
            <p className="text-sm text-gray-600 mt-1">New customer onboarding</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Basic Information</h3>
            <p className="text-sm text-gray-600 mb-6">
              Set up the core details for the new customer tenant
            </p>

            <div className="space-y-6">
              <div>
                <Label htmlFor="tenant-name" className="text-sm font-medium text-gray-900">
                  Tenant name *
                </Label>
                <Input
                  id="tenant-name"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="e.g., Acme Corporation"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="slug" className="text-sm font-medium text-gray-900">
                  Slug *
                </Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g., acmecorp"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used in URLs and identifiers. Only lowercase letters, numbers, and hyphens.
                </p>
              </div>

              <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-900">
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="primary-color" className="text-sm font-medium text-gray-900">
                  Primary color
                </Label>
                <div className="flex gap-3 mt-3">
                  {colorPresets.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setPrimaryColor(color.value)}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        primaryColor === color.value
                          ? "border-blue-600 scale-110"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                  <div className="flex-1 max-w-xs">
                    <Input
                      id="primary-color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-12"
                      placeholder="#2563EB"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => navigate("/tenants")}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={!tenantName || !slug}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Tenant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
