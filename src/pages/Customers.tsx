
import { Card } from "@/components/ui/card";
import { Users, UserCheck, TrendingUp, MapPin } from "lucide-react";

const Customers = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-white">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Customer Insights
            </h1>
            <p className="text-gray-600 mt-1">Consumer profiling and demographics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Demographics</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Age groups, gender distribution, and location-based insights.
            </p>
          </Card>

          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Behavior Patterns</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Shopping preferences, brand loyalty, and purchase frequency.
            </p>
          </Card>

          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold">Location Mapping</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Geographic distribution and regional preference analysis.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Customers;
