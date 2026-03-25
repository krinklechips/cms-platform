import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button className="px-3 py-1 text-xs font-medium bg-white rounded-md shadow-sm text-gray-900">
              Admin View
            </button>
            <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-900">
              Tenant CMS View
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">
                E
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xs font-medium text-gray-900">enoch.phan@gmail.com</div>
              <div className="text-[10px] text-gray-500">Owner</div>
            </div>
          </div>

          {/* Sign Out */}
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7 px-2.5">
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
