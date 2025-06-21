
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, BarChart3, DollarSign } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

const ProductMix = () => {
  const metrics = [
    { title: "Total SKUs", value: "2,847", change: "+12.3%", icon: Package, positive: true },
    { title: "Top Performing SKUs", value: "234", change: "+8.2%", icon: TrendingUp, positive: true },
    { title: "Revenue per SKU", value: "$1,245", change: "+15.4%", icon: DollarSign, positive: true },
    { title: "Category Mix", value: "47 Categories", change: "+2.1%", icon: BarChart3, positive: true },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <SidebarTrigger />
        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Product Mix & SKU Info
          </h1>
          <p className="text-gray-600 mt-1">Product analytics and SKU insights</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className={`text-sm ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change} vs last month
                    </p>
                  </div>
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Product Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Wireless Headphones", sales: "1,234", revenue: "$42,850" },
                { name: "Smartphone Case", sales: "987", revenue: "$19,740" },
                { name: "Laptop Stand", sales: "756", revenue: "$15,120" },
              ].map((product, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.sales} units sold</p>
                  </div>
                  <span className="font-medium text-green-600">{product.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { category: "Electronics", percentage: 35, revenue: "$125,000" },
                { category: "Accessories", percentage: 28, revenue: "$98,000" },
                { category: "Home & Garden", percentage: 22, revenue: "$77,000" },
                { category: "Books", percentage: 15, revenue: "$52,000" },
              ].map((cat, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{cat.category}</span>
                    <span className="font-medium">{cat.revenue}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{width: `${cat.percentage}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              SKU Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active SKUs</span>
                <span className="font-medium">2,847</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bestsellers (Top 10%)</span>
                <span className="font-medium">285</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Low Performers</span>
                <span className="font-medium">423</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Out of Stock</span>
                <span className="font-medium text-red-600">67</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductMix;
