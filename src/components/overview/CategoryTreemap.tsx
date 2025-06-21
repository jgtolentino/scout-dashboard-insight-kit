
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

const CategoryTreemap = () => {
  const categories = [
    { name: "Snacks", revenue: 890000, percentage: 32.5, color: "#059669" },
    { name: "Beverages", revenue: 720000, percentage: 26.2, color: "#3b82f6" },
    { name: "Personal Care", revenue: 450000, percentage: 16.4, color: "#8b5cf6" },
    { name: "Household", revenue: 320000, percentage: 11.7, color: "#f59e0b" },
    { name: "Snacks (Premium)", revenue: 240000, percentage: 8.8, color: "#10b981" },
    { name: "Others", revenue: 130000, percentage: 4.7, color: "#6b7280" },
  ];

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-green-600" />
          Top Product Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category, index) => {
            const height = Math.max(category.percentage * 3, 40); // Min height of 40px
            return (
              <div 
                key={category.name}
                className="relative rounded-lg p-3 text-white text-sm font-medium flex flex-col justify-end"
                style={{ 
                  backgroundColor: category.color,
                  height: `${height}px`,
                  minHeight: '60px'
                }}
              >
                <div className="bg-black/20 rounded px-2 py-1">
                  <div className="font-bold">{category.name}</div>
                  <div className="text-xs opacity-90">
                    ₱{(category.revenue / 1000).toFixed(0)}K ({category.percentage}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-blue-700">
            📦 <strong>Category Leader:</strong> Snacks dominates with 32.5% of total revenue
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryTreemap;
