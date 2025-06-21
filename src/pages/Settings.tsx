
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Database, Shield, Bell, Key, Globe, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import SettingsAIPanel from "@/components/settings/SettingsAIPanel";

const Settings = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-700 rounded-xl text-white">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Configuration and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Data Sources */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Primary Database</h4>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Connected</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">PostgreSQL - Main transaction database</p>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Analytics Warehouse</h4>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Syncing</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">BigQuery - Historical data analysis</p>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Import Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-sync transactions</p>
                      <p className="text-sm text-gray-600">Automatically import new transactions every hour</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Data validation</p>
                      <p className="text-sm text-gray-600">Validate data integrity during import</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Authentication
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Session Timeout</p>
                        <p className="text-sm text-gray-600">Auto-logout after 30 minutes</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Button variant="outline" size="sm">Manage API Keys</Button>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Access Control</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Admin Users</span>
                      <span className="text-sm font-medium">3 users</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Analyst Users</span>
                      <span className="text-sm font-medium">12 users</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Viewer Users</span>
                      <span className="text-sm font-medium">45 users</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">Manage Permissions</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-600" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Alert Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Revenue Alerts</p>
                        <p className="text-sm text-gray-600">Daily revenue threshold notifications</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">System Alerts</p>
                        <p className="text-sm text-gray-600">System performance and errors</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Customer Alerts</p>
                        <p className="text-sm text-gray-600">New customer registrations</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Delivery Methods</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Email Notifications</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">SMS Alerts</span>
                      <Switch />
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">In-App Notifications</span>
                      <Switch defaultChecked />
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">Test Notifications</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Localization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Language</label>
                    <select className="w-full mt-1 p-2 border rounded">
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timezone</label>
                    <select className="w-full mt-1 p-2 border rounded">
                      <option>Pacific Time (PT)</option>
                      <option>Eastern Time (ET)</option>
                      <option>Mountain Time (MT)</option>
                      <option>Central Time (CT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Currency</label>
                    <select className="w-full mt-1 p-2 border rounded">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                      <option>CAD ($)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Theme</label>
                    <select className="w-full mt-1 p-2 border rounded">
                      <option>Light</option>
                      <option>Dark</option>
                      <option>Auto</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Color Scheme</label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <div className="w-full h-8 bg-blue-500 rounded cursor-pointer border-2 border-blue-600"></div>
                      <div className="w-full h-8 bg-green-500 rounded cursor-pointer"></div>
                      <div className="w-full h-8 bg-purple-500 rounded cursor-pointer"></div>
                      <div className="w-full h-8 bg-orange-500 rounded cursor-pointer"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compact Mode</p>
                      <p className="text-sm text-gray-600">Reduce spacing for more content</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-1">
          <SettingsAIPanel />
        </div>
      </div>
    </div>
  );
};

export default Settings;
