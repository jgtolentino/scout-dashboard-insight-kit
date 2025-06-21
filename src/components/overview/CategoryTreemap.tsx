import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

const CategoryTreemap = () => {
  const categories = [
    { name: "Snacks", revenue: 485000, share: 32, color: "bg-blue-500" },
    { name: "Beverages", revenue: 367000, share: 24, color: "bg-green-500" },
    { name: "Personal Care", revenue: 278000, share: 18, color: "bg-purple-500" },
    { name: "Household", revenue: 195000, share: 13, color: "bg-orange-500" },
    { name: "Others", revenue: 185000, share: 13, color: "bg-gray-400" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-green-600" />
          Top Product Categories
        </CardTitle>
        <p className="text-sm text-gray-600">Revenue distribution by category</p>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Treemap-style visualization */}
        <div className="grid grid-cols-6 grid-rows-4 gap-1 h-48 mb-4">
          {/* Snacks - largest block */}
          <div className="col-span-3 row-span-2 bg-blue-500 rounded-lg p-3 text-white flex flex-col justify-between">
            <div>
              <p className="font-medium text-sm">Snacks</p>
              <p className="text-xs opacity-90">32% share</p>
            </div>
            <p className="text-lg font-bold">{formatCurrency(categories[0].revenue)}</p>
          </div>
          
          {/* Beverages */}
          <div className="col-span-3 row-span-1 bg-green-500 rounded-lg p-3 text-white flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Beverages</p>
              <p className="text-xs opacity-90">24%</p>
            </div>
            <p className="text-sm font-bold">{formatCurrency(categories[1].revenue)}</p>
          </div>
          
          {/* Personal Care */}
          <div className="col-span-2 row-span-1 bg-purple-500 rounded-lg p-2 text-white">
            <p className="font-medium text-xs">Personal Care</p>
            <p className="text-xs opacity-90">18%</p>
            <p className="text-sm font-bold">{formatCurrency(categories[2].revenue)}</p>
          </div>
          
          {/* Household */}
          <div className="col-span-2 row-span-1 bg-orange-500 rounded-lg p-2 text-white">
            <p className="font-medium text-xs">Household</p>
            <p className="text-xs opacity-90">13%</p>
            <p className="text-sm font-bold">{formatCurrency(categories[3].revenue)}</p>
          </div>
          
          {/* Others */}
          <div className="col-span-2 row-span-1 bg-gray-400 rounded-lg p-2 text-white">
            <p className="font-medium text-xs">Others</p>
            <p className="text-xs opacity-90">13%</p>
            <p className="text-sm font-bold">{formatCurrency(categories[4].revenue)}</p>
          </div>
        </div>

        {/* Category list */}
        <div className="space-y-2">
          {categories.slice(0, 3).map((category, i) => (
            <div key={category.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 text-center font-medium text-gray-500">#{i + 1}</span>
                <div className={`w-3 h-3 rounded ${category.color}`}></div>
                <span>{category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatCurrency(category.revenue)}</span>
                <span className="text-xs text-gray-500">{category.share}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryTreemap;
