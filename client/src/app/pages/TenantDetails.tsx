import { useState } from "react";
import { useParams } from "react-router";
import { Header } from "../components/Header";
import { ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";

export function TenantDetails() {
  const { tenantId } = useParams();
  const [tenantName, setTenantName] = useState("Topline Dental Concept");
  const [slug, setSlug] = useState("toplinedental");
  const [status, setStatus] = useState("active");
  const [primaryColor, setPrimaryColor] = useState("#2563EB");

  const colorPresets = [
    { name: "Blue", value: "#2563EB" },
    { name: "Purple", value: "#9F76E6" },
    { name: "Teal", value: "#7C3AED" },
    { name: "Cyan", value: "#0EA5E9" },
    { name: "Dark", value: "#111827" },
  ];

  return (
    <div className="h-full flex flex-col">
      <Header
        title="Tenant Settings"
        subtitle="Topline Dental Concept"
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-8 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="hover:text-gray-900 cursor-pointer">Platform</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-gray-900 cursor-pointer">Customers / Tenants</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Topline Dental Concept</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-gray-900">Topline Dental Concept</h2>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                active
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              <span>Slug: toplinedental</span>
              <span>•</span>
              <span>Environment: Production</span>
              <span>•</span>
              <span className="text-gray-500">CMS: cms.toplinedental.com.my</span>
              <span>•</span>
              <span className="text-gray-500">draft</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              Discard
            </Button>
            <Button variant="outline" size="sm">
              Reload
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Save changes
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Open CMS Host
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Open Public Site
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 bg-gray-50 overflow-auto">
        <Tabs defaultValue="branding" className="w-full">
          <div className="bg-white border-b border-gray-200 px-8">
            <TabsList className="bg-transparent border-b-0 h-auto p-0 gap-6">
              <TabsTrigger 
                value="branding" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 pt-3 data-[state=active]:text-blue-600"
              >
                Branding
              </TabsTrigger>
              <TabsTrigger 
                value="domains"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 pt-3 data-[state=active]:text-blue-600"
              >
                Domains
              </TabsTrigger>
              <TabsTrigger 
                value="support"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 pt-3 data-[state=active]:text-blue-600"
              >
                Support
              </TabsTrigger>
              <TabsTrigger 
                value="users"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 pt-3 data-[state=active]:text-blue-600"
              >
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="content"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 pt-3 data-[state=active]:text-blue-600"
              >
                Content Modules
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="branding" className="mt-0 p-8">
            <div className="max-w-4xl">
              {/* Basic Tenant Setup */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Basic Tenant Setup</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Keep the core business details here. Advanced branding and URLs can stay collapsed until needed.
                </p>

                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="tenant-name" className="text-sm font-medium text-gray-900">
                      Tenant name
                    </Label>
                    <Input
                      id="tenant-name"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
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
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="slug" className="text-sm font-medium text-gray-900">
                      Slug (read-only)
                    </Label>
                    <Input
                      id="slug"
                      value={slug}
                      disabled
                      className="mt-2 bg-gray-50"
                    />
                  </div>

                  <div className="col-span-2">
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
              </div>

              {/* Advanced Branding & URLs */}
              <div className="bg-white rounded-lg border border-gray-200">
                <button className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-gray-900">Advanced Branding & URLs</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Timestamps */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
                <p>Created: 27 Feb 2026 at 10:33:28 am • Updated: 27 Feb 2026 at 10:33:28 am</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="domains" className="mt-0 p-8">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Domain management content goes here</p>
            </div>
          </TabsContent>

          <TabsContent value="support" className="mt-0 p-8">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Support content goes here</p>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-0 p-8">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Users management content goes here</p>
            </div>
          </TabsContent>

          <TabsContent value="content" className="mt-0 p-8">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Content modules content goes here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
