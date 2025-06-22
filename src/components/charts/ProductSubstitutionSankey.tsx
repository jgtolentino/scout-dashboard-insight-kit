import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, SankeyGraph, SankeyNode, SankeyLink } from 'd3-sankey';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Package, TrendingUp, BarChart3 } from "lucide-react";

interface SubstitutionDataPoint {
  source: string;
  target: string;
  value: number;
  frequency: number;
  revenue: number;
  substitutionRate: number;
}

interface ProductSubstitutionSankeyProps {
  data: SubstitutionDataPoint[];
  height?: number;
  className?: string;
}

interface SankeyNodeData extends SankeyNode<{}, {}> {
  name: string;
  category?: string;
  totalValue: number;
  isSource?: boolean;
  isTarget?: boolean;
}

interface SankeyLinkData extends SankeyLink<SankeyNodeData, {}> {
  source: SankeyNodeData;
  target: SankeyNodeData;
  value: number;
  substitutionRate: number;
  revenue: number;
  frequency: number;
}

const ProductSubstitutionSankey: React.FC<ProductSubstitutionSankeyProps> = ({
  data,
  height = 600,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedMetric, setSelectedMetric] = useState<'value' | 'frequency' | 'revenue'>('value');
  const [hoveredLink, setHoveredLink] = useState<SankeyLinkData | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);

  // Process data for Sankey diagram
  const sankeyData = useMemo(() => {
    if (!data || data.length === 0) return { nodes: [], links: [] };

    // Create unique nodes
    const nodeMap = new Map<string, SankeyNodeData>();
    
    data.forEach(d => {
      if (!nodeMap.has(d.source)) {
        nodeMap.set(d.source, {
          name: d.source,
          totalValue: 0,
          isSource: true,
          category: 'original'
        });
      }
      if (!nodeMap.has(d.target)) {
        nodeMap.set(d.target, {
          name: d.target,
          totalValue: 0,
          isTarget: true,
          category: 'substitute'
        });
      }
    });

    // Calculate total values for nodes
    data.forEach(d => {
      const sourceNode = nodeMap.get(d.source)!;
      const targetNode = nodeMap.get(d.target)!;
      
      const metricValue = selectedMetric === 'frequency' ? d.frequency : 
                         selectedMetric === 'revenue' ? d.revenue : d.value;
      
      sourceNode.totalValue += metricValue;
      targetNode.totalValue += metricValue;
    });

    // Create links
    const links: SankeyLinkData[] = data.map(d => ({
      source: nodeMap.get(d.source)!,
      target: nodeMap.get(d.target)!,
      value: selectedMetric === 'frequency' ? d.frequency : 
             selectedMetric === 'revenue' ? d.revenue : d.value,
      substitutionRate: d.substitutionRate,
      revenue: d.revenue,
      frequency: d.frequency
    }));

    return {
      nodes: Array.from(nodeMap.values()),
      links
    };
  }, [data, selectedMetric]);

  // Color scales
  const sourceColorScale = d3.scaleOrdinal(d3.schemeCategory10);
  const targetColorScale = d3.scaleOrdinal(d3.schemeSet3);

  useEffect(() => {
    if (!svgRef.current || sankeyData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 150, bottom: 20, left: 150 };
    const width = svg.node()?.getBoundingClientRect().width! - margin.left - margin.right;
    const sankeyHeight = height - margin.top - margin.bottom;

    // Create sankey layout
    const sankeyGenerator = sankey<SankeyNodeData, SankeyLinkData>()
      .nodeWidth(15)
      .nodePadding(20)
      .extent([[margin.left, margin.top], [width, sankeyHeight + margin.top]]);

    const graph: SankeyGraph<SankeyNodeData, SankeyLinkData> = sankeyGenerator({
      nodes: sankeyData.nodes.map(d => ({ ...d })),
      links: sankeyData.links.map(d => ({ ...d }))
    });

    const g = svg.append("g");

    // Create gradient definitions for links
    const defs = svg.append("defs");
    
    graph.links.forEach((link, i) => {
      const gradient = defs.append("linearGradient")
        .attr("id", `gradient-${i}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", link.source.x1!)
        .attr("x2", link.target.x0!);

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", sourceColorScale(link.source.name))
        .attr("stop-opacity", 0.7);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", targetColorScale(link.target.name))
        .attr("stop-opacity", 0.7);
    });

    // Draw links
    const links = g.selectAll(".link")
      .data(graph.links)
      .enter().append("path")
      .attr("class", "link")
      .attr("d", sankeyLinkHorizontal())
      .style("stroke", (d, i) => `url(#gradient-${i})`)
      .style("stroke-width", d => Math.max(1, d.width!))
      .style("fill", "none")
      .style("opacity", 0.6)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        setHoveredLink(d);
        d3.select(this).style("opacity", 0.8);
      })
      .on("mouseout", function() {
        setHoveredLink(null);
        d3.select(this).style("opacity", 0.6);
      })
      .on("click", function(event, d) {
        setSelectedFlow(`${d.source.name} → ${d.target.name}`);
      });

    // Draw nodes
    const nodes = g.selectAll(".node")
      .data(graph.nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Node rectangles
    nodes.append("rect")
      .attr("height", d => d.y1! - d.y0!)
      .attr("width", d => d.x1! - d.x0!)
      .style("fill", d => d.isSource ? sourceColorScale(d.name) : targetColorScale(d.name))
      .style("stroke", "#000")
      .style("stroke-width", 1)
      .style("opacity", 0.8)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        // Highlight connected links
        links.style("opacity", link => 
          link.source === d || link.target === d ? 0.8 : 0.2
        );
      })
      .on("mouseout", function() {
        links.style("opacity", 0.6);
      });

    // Node labels
    nodes.append("text")
      .attr("x", d => d.x0! < width / 2 ? (d.x1! - d.x0!) + 6 : -6)
      .attr("y", d => (d.y1! - d.y0!) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0! < width / 2 ? "start" : "end")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("fill", "#374151")
      .text(d => d.name);

    // Node values
    nodes.append("text")
      .attr("x", d => d.x0! < width / 2 ? (d.x1! - d.x0!) + 6 : -6)
      .attr("y", d => (d.y1! - d.y0!) / 2)
      .attr("dy", "1.5em")
      .attr("text-anchor", d => d.x0! < width / 2 ? "start" : "end")
      .style("font-size", "10px")
      .style("fill", "#6B7280")
      .text(d => {
        const value = selectedMetric === 'frequency' ? d.totalValue.toFixed(0) : 
                     selectedMetric === 'revenue' ? `₱${d.totalValue.toLocaleString()}` :
                     d.totalValue.toFixed(0);
        return value;
      });

    // Add category labels
    const sourceNodes = graph.nodes.filter(d => d.isSource);
    const targetNodes = graph.nodes.filter(d => d.isTarget);

    if (sourceNodes.length > 0) {
      g.append("text")
        .attr("x", sourceNodes[0].x0! - 10)
        .attr("y", margin.top - 5)
        .attr("text-anchor", "end")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("fill", "#374151")
        .text("Original Products");
    }

    if (targetNodes.length > 0) {
      g.append("text")
        .attr("x", targetNodes[0].x0! + 10)
        .attr("y", margin.top - 5)
        .attr("text-anchor", "start")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("fill", "#374151")
        .text("Substitute Products");
    }

  }, [sankeyData, selectedMetric, height]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!data || data.length === 0) return {
      totalSubstitutions: 0,
      avgSubstitutionRate: 0,
      topSubstitution: '',
      totalRevenue: 0
    };

    const totalSubstitutions = data.reduce((sum, d) => sum + d.frequency, 0);
    const avgSubstitutionRate = data.reduce((sum, d) => sum + d.substitutionRate, 0) / data.length;
    const topSubstitution = data.reduce((max, d) => d.frequency > max.frequency ? d : max);
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

    return {
      totalSubstitutions,
      avgSubstitutionRate,
      topSubstitution: `${topSubstitution.source} → ${topSubstitution.target}`,
      totalRevenue
    };
  }, [data]);

  const getMetricTitle = () => {
    switch (selectedMetric) {
      case 'frequency': return 'Substitution Frequency';
      case 'revenue': return 'Revenue Impact';
      default: return 'Substitution Volume';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-600" />
            Product Substitution Flow - {getMetricTitle()}
          </CardTitle>
          
          {/* Metric Selection */}
          <div className="flex rounded-lg border p-1">
            <Button
              variant={selectedMetric === 'value' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedMetric('value')}
              className="px-3 py-1 text-xs"
            >
              Volume
            </Button>
            <Button
              variant={selectedMetric === 'frequency' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedMetric('frequency')}
              className="px-3 py-1 text-xs"
            >
              Frequency
            </Button>
            <Button
              variant={selectedMetric === 'revenue' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedMetric('revenue')}
              className="px-3 py-1 text-xs"
            >
              Revenue
            </Button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Total Substitutions</p>
            <p className="text-lg font-semibold">{summaryStats.totalSubstitutions.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Avg Substitution Rate</p>
            <p className="text-lg font-semibold">{summaryStats.avgSubstitutionRate.toFixed(1)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Top Flow</p>
            <p className="text-sm font-semibold">{summaryStats.topSubstitution}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Revenue Impact</p>
            <p className="text-lg font-semibold">₱{summaryStats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Sankey Diagram */}
          <div className="relative">
            <svg
              ref={svgRef}
              width="100%"
              height={height}
              className="border rounded-lg"
            />
            
            {/* Tooltip */}
            {hoveredLink && (
              <div className="absolute top-4 right-4 bg-white border rounded-lg shadow-lg p-3 text-sm z-10 min-w-48">
                <div className="font-semibold text-gray-800 mb-2">
                  {hoveredLink.source.name} → {hoveredLink.target.name}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volume:</span>
                    <span className="font-medium">{hoveredLink.value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequency:</span>
                    <span className="font-medium">{hoveredLink.frequency.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium">₱{hoveredLink.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Substitution Rate:</span>
                    <span className="font-medium">{hoveredLink.substitutionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legend and Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">How to Read This Diagram</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Width of flows represents substitution volume</li>
                <li>• Left side shows original products</li>
                <li>• Right side shows substitute products</li>
                <li>• Hover over flows for detailed metrics</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Color Legend</h4>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: sourceColorScale('Original') }}></div>
                  <span className="text-xs">Original Products</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: targetColorScale('Substitute') }}></div>
                  <span className="text-xs">Substitute Products</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Flow Details */}
          {selectedFlow && (
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-900">Selected Flow: {selectedFlow}</span>
              </div>
              <p className="text-sm text-blue-700">
                Click on other flows to compare substitution patterns. This visualization helps identify 
                which products are being substituted most frequently and their revenue impact.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSubstitutionSankey;