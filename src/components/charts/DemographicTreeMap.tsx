import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { hierarchy, treemap, HierarchyRectangularNode } from 'd3-hierarchy';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, DollarSign, TrendingUp, BarChart3, Filter } from "lucide-react";

interface DemographicDataPoint {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  value: number;
  revenue: number;
  count: number;
  percentage: number;
  avgSpend: number;
  growth: number;
  children?: DemographicDataPoint[];
}

interface DemographicTreeMapProps {
  data: DemographicDataPoint[];
  height?: number;
  metric?: 'value' | 'revenue' | 'count' | 'avgSpend';
  className?: string;
}

interface TreeMapNode extends HierarchyRectangularNode<DemographicDataPoint> {
  data: DemographicDataPoint;
}

const DemographicTreeMap: React.FC<DemographicTreeMapProps> = ({
  data,
  height = 600,
  metric = 'value',
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedMetric, setSelectedMetric] = useState<'value' | 'revenue' | 'count' | 'avgSpend'>(metric);
  const [hoveredNode, setHoveredNode] = useState<TreeMapNode | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [drilldownPath, setDrilldownPath] = useState<string[]>([]);

  // Process data for tree map visualization
  const treeMapData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Create hierarchical structure
    const groupedData: { [category: string]: { [subcategory: string]: DemographicDataPoint[] } } = {};
    
    data.forEach(item => {
      if (!groupedData[item.category]) {
        groupedData[item.category] = {};
      }
      
      const subcat = item.subcategory || 'Other';
      if (!groupedData[item.category][subcat]) {
        groupedData[item.category][subcat] = [];
      }
      
      groupedData[item.category][subcat].push(item);
    });

    // Build hierarchy
    const hierarchyData: DemographicDataPoint = {
      id: 'root',
      name: 'Demographics',
      category: 'root',
      value: 0,
      revenue: 0,
      count: 0,
      percentage: 100,
      avgSpend: 0,
      growth: 0,
      children: Object.entries(groupedData).map(([category, subcategories]) => {
        const categoryChildren = Object.entries(subcategories).map(([subcategory, items]) => {
          const aggregated = items.reduce((acc, item) => ({
            id: `${category}-${subcategory}`,
            name: subcategory,
            category,
            subcategory,
            value: acc.value + item.value,
            revenue: acc.revenue + item.revenue,
            count: acc.count + item.count,
            percentage: acc.percentage + item.percentage,
            avgSpend: 0, // Will calculate after
            growth: 0, // Will calculate after
            children: items
          }), { 
            value: 0, 
            revenue: 0, 
            count: 0, 
            percentage: 0, 
            avgSpend: 0, 
            growth: 0 
          });

          // Calculate averages
          aggregated.avgSpend = aggregated.count > 0 ? aggregated.revenue / aggregated.count : 0;
          aggregated.growth = items.reduce((sum, item) => sum + item.growth, 0) / items.length;

          return aggregated;
        });

        const categoryTotal = categoryChildren.reduce((acc, child) => ({
          id: category,
          name: category,
          category,
          value: acc.value + child.value,
          revenue: acc.revenue + child.revenue,
          count: acc.count + child.count,
          percentage: acc.percentage + child.percentage,
          avgSpend: 0,
          growth: 0,
          children: categoryChildren
        }), { 
          value: 0, 
          revenue: 0, 
          count: 0, 
          percentage: 0, 
          avgSpend: 0, 
          growth: 0, 
          children: categoryChildren 
        });

        // Calculate category averages
        categoryTotal.avgSpend = categoryTotal.count > 0 ? categoryTotal.revenue / categoryTotal.count : 0;
        categoryTotal.growth = categoryChildren.reduce((sum, child) => sum + child.growth, 0) / categoryChildren.length;

        return categoryTotal;
      })
    };

    return hierarchyData;
  }, [data]);

  // Color scales for different categories
  const colorScale = d3.scaleOrdinal()
    .domain(['age_group', 'income_level', 'location', 'lifestyle', 'behavior'])
    .range(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']);

  const lightColorScale = d3.scaleOrdinal()
    .domain(['age_group', 'income_level', 'location', 'lifestyle', 'behavior'])
    .range(['#dbeafe', '#d1fae5', '#fef3c7', '#fee2e2', '#ede9fe']);

  useEffect(() => {
    if (!svgRef.current || !treeMapData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = svg.node()?.getBoundingClientRect().width! - margin.left - margin.right;
    const treeMapHeight = height - margin.top - margin.bottom;

    // Create hierarchy and treemap
    const root = hierarchy(treeMapData)
      .sum(d => {
        switch (selectedMetric) {
          case 'revenue': return d.revenue;
          case 'count': return d.count;
          case 'avgSpend': return d.avgSpend;
          default: return d.value;
        }
      })
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treeMapLayout = treemap<DemographicDataPoint>()
      .size([width, treeMapHeight])
      .padding(2)
      .round(true);

    treeMapLayout(root);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Determine which level to display based on drilldown
    const nodesToShow = drilldownPath.length === 0 
      ? root.children || []
      : drilldownPath.length === 1 
        ? root.children?.find(c => c.data.name === drilldownPath[0])?.children || []
        : root.descendants().filter(d => d.depth === drilldownPath.length + 1);

    // Draw rectangles
    const rects = g.selectAll("rect")
      .data(nodesToShow)
      .enter().append("rect")
      .attr("x", d => d.x0!)
      .attr("y", d => d.y0!)
      .attr("width", d => d.x1! - d.x0!)
      .attr("height", d => d.y1! - d.y0!)
      .style("fill", d => {
        const category = d.data.category;
        return hoveredNode?.data.id === d.data.id 
          ? colorScale(category) as string
          : lightColorScale(category) as string;
      })
      .style("stroke", "#ffffff")
      .style("stroke-width", 2)
      .style("cursor", "pointer")
      .style("opacity", 0.8)
      .on("mouseover", function(event, d) {
        setHoveredNode(d as TreeMapNode);
        d3.select(this)
          .style("opacity", 1)
          .style("stroke-width", 3);
      })
      .on("mouseout", function() {
        setHoveredNode(null);
        d3.select(this)
          .style("opacity", 0.8)
          .style("stroke-width", 2);
      })
      .on("click", function(event, d) {
        if (d.children && d.children.length > 0) {
          setDrilldownPath([...drilldownPath, d.data.name]);
        }
      });

    // Add labels
    const labels = g.selectAll("text")
      .data(nodesToShow)
      .enter().append("text")
      .attr("x", d => (d.x0! + d.x1!) / 2)
      .attr("y", d => (d.y0! + d.y1!) / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", d => {
        const area = (d.x1! - d.x0!) * (d.y1! - d.y0!);
        return Math.min(14, Math.max(10, Math.sqrt(area) / 10)) + "px";
      })
      .style("font-weight", "600")
      .style("fill", "#374151")
      .style("pointer-events", "none")
      .text(d => {
        const rectWidth = d.x1! - d.x0!;
        const rectHeight = d.y1! - d.y0!;
        
        // Only show text if rectangle is large enough
        if (rectWidth < 60 || rectHeight < 30) return "";
        
        return d.data.name.length > 15 
          ? d.data.name.substring(0, 12) + "..."
          : d.data.name;
      });

    // Add value labels
    g.selectAll("text.value")
      .data(nodesToShow)
      .enter().append("text")
      .attr("class", "value")
      .attr("x", d => (d.x0! + d.x1!) / 2)
      .attr("y", d => (d.y0! + d.y1!) / 2 + 15)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "10px")
      .style("fill", "#6B7280")
      .style("pointer-events", "none")
      .text(d => {
        const rectWidth = d.x1! - d.x0!;
        const rectHeight = d.y1! - d.y0!;
        
        if (rectWidth < 80 || rectHeight < 50) return "";
        
        const value = d.value || 0;
        switch (selectedMetric) {
          case 'revenue':
          case 'avgSpend':
            return `₱${value.toLocaleString()}`;
          case 'count':
            return value.toLocaleString();
          default:
            return value.toLocaleString();
        }
      });

  }, [treeMapData, selectedMetric, height, hoveredNode, drilldownPath]);

  // Get metric title and icon
  const getMetricInfo = () => {
    switch (selectedMetric) {
      case 'revenue':
        return { title: 'Total Revenue', icon: DollarSign };
      case 'count':
        return { title: 'Customer Count', icon: Users };
      case 'avgSpend':
        return { title: 'Average Spend', icon: TrendingUp };
      default:
        return { title: 'Value', icon: BarChart3 };
    }
  };

  const { title: metricTitle, icon: MetricIcon } = getMetricInfo();

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!data || data.length === 0) return {
      totalValue: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      avgSpend: 0,
      topSegment: ''
    };

    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalCustomers = data.reduce((sum, item) => sum + item.count, 0);
    const avgSpend = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    const topSegment = data.reduce((max, item) => 
      item.value > max.value ? item : max, 
      data[0]
    );

    return {
      totalValue,
      totalRevenue,
      totalCustomers,
      avgSpend,
      topSegment: topSegment?.name || 'N/A'
    };
  }, [data]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MetricIcon className="h-5 w-5 text-blue-600" />
            Demographic TreeMap - {metricTitle}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Metric Selection */}
            <div className="flex rounded-lg border p-1">
              <Button
                variant={selectedMetric === 'value' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric('value')}
                className="px-3 py-1 text-xs"
              >
                Value
              </Button>
              <Button
                variant={selectedMetric === 'revenue' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric('revenue')}
                className="px-3 py-1 text-xs"
              >
                Revenue
              </Button>
              <Button
                variant={selectedMetric === 'count' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric('count')}
                className="px-3 py-1 text-xs"
              >
                Count
              </Button>
              <Button
                variant={selectedMetric === 'avgSpend' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric('avgSpend')}
                className="px-3 py-1 text-xs"
              >
                Avg Spend
              </Button>
            </div>

            {/* Breadcrumb */}
            {drilldownPath.length > 0 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDrilldownPath([])}
                  className="px-2 py-1 text-xs"
                >
                  Root
                </Button>
                {drilldownPath.map((path, index) => (
                  <React.Fragment key={path}>
                    <span className="text-gray-400">/</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDrilldownPath(drilldownPath.slice(0, index + 1))}
                      className="px-2 py-1 text-xs"
                    >
                      {path}
                    </Button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-lg font-semibold">{summaryStats.totalValue.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-lg font-semibold">₱{summaryStats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="text-lg font-semibold">{summaryStats.totalCustomers.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Top Segment</p>
            <p className="text-sm font-semibold">{summaryStats.topSegment}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* TreeMap Visualization */}
          <div className="relative">
            <svg
              ref={svgRef}
              width="100%"
              height={height}
              className="border rounded-lg bg-gray-50"
            />
            
            {/* Tooltip */}
            {hoveredNode && (
              <div className="absolute top-4 right-4 bg-white border rounded-lg shadow-lg p-3 text-sm z-10 min-w-48">
                <div className="font-semibold text-gray-800 mb-2">
                  {hoveredNode.data.name}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium capitalize">{hoveredNode.data.category.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Value:</span>
                    <span className="font-medium">{hoveredNode.data.value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium">₱{hoveredNode.data.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customers:</span>
                    <span className="font-medium">{hoveredNode.data.count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Spend:</span>
                    <span className="font-medium">₱{hoveredNode.data.avgSpend.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Growth:</span>
                    <span className={`font-medium ${hoveredNode.data.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {hoveredNode.data.growth >= 0 ? '+' : ''}{hoveredNode.data.growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {hoveredNode.children && hoveredNode.children.length > 0 && (
                  <div className="mt-2 pt-2 border-t text-xs text-blue-600">
                    Click to drill down
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legend and Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">How to Use</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Rectangle size represents the selected metric value</li>
                <li>• Colors represent different demographic categories</li>
                <li>• Hover for detailed segment information</li>
                <li>• Click rectangles to drill down into subcategories</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Demographic Categories</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {['age_group', 'income_level', 'location', 'lifestyle', 'behavior'].map(category => (
                  <div key={category} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: colorScale(category) as string }}
                    ></div>
                    <span className="capitalize">{category.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemographicTreeMap;