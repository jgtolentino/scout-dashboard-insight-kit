
import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon, Database, Shield, Bell } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-700 rounded-xl text-white">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-600 mt-1">Configuration and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Data Sources</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Configure data connections and import settings.
            </p>
          </Card>

          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Security</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Manage access permissions and security policies.
            </p>
          </Card>

          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Configure alerts and notification preferences.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
