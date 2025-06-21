import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useFilterStore } from '../stores/filterStore';

export function ProductMix() {
  const navigate = useNavigate();
  const { setFilter, getQueryString } = useFilterStore();

  const handleCategoryClick = (categoryName) => {
    setFilter('categories', [categoryName]);
    navigate(`/products?${getQueryString()}`);
  };

  const handleProductClick = (productName) => {
    const brand = productName.split('-')[0]; // Extract brand from product name
    setFilter('brands', [brand]);
    navigate(`/products?${getQueryString()}`);
  };
  const categories = [
    { name: 'Beverages', share: 28.5, revenue: 812456, color: '#8884d8' },
    { name: 'Food & Snacks', share: 24.2, revenue: 689234, color: '#82ca9d' },
    { name: 'Personal Care', share: 18.7, revenue: 532891, color: '#ffc658' },
    { name: 'Household Items', share: 15.3, revenue: 435678, color: '#ff7300' },
    { name: 'Others', share: 13.3, revenue: 378123, color: '#00ff00' }
  ];

  const productPerformance = [
    { name: 'Coca-Cola', revenue: 284739, units: 1847 },
    { name: 'Lucky Me', revenue: 198456, units: 2341 },
    { name: 'Tide', revenue: 156892, units: 892 },
    { name: 'San Miguel', revenue: 134567, units: 1234 },
    { name: 'Nestle', revenue: 98234, units: 1567 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Product Mix Analysis</h1>
        <p className="text-muted-foreground">
          Category share and SKU substitution patterns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="share"
                  label={({ name, share }) => `${name}: ${share}%`}
                  onClick={(data) => handleCategoryClick(data.name)}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer hover:opacity-80" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Performance (Pareto)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `₱${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Units'
                  ]}
                />
                <Bar dataKey="revenue" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Brand Substitution Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Sankey Diagram Placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.name} className="flex items-center justify-between cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors" onClick={() => handleCategoryClick(category.name)}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: category.color }}></div>
                    <span className="font-medium text-foreground">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{category.share}%</p>
                    <p className="text-sm text-muted-foreground">₱{category.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Substitutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Coca-Cola → Pepsi</span>
                <span className="text-sm text-muted-foreground">234 switches</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Lucky Me → Nissin</span>
                <span className="text-sm text-muted-foreground">189 switches</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tide → Surf</span>
                <span className="text-sm text-muted-foreground">156 switches</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

