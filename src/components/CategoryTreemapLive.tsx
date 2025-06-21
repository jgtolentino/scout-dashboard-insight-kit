import React from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { useFilterStore } from '@/stores/filterStore';
import { useCategoryMixData } from '@/hooks/useCategoryMixData';

export default function CategoryTreemapLive() {
  const filters = useFilterStore();
  const { data, isLoading, error } = useCategoryMixData(filters);
  
  if (isLoading) return <div className="animate-pulse h-48 bg-gray-100 rounded" />;
  if (error) return <div className="h-48 flex items-center justify-center text-gray-500">Unable to load data</div>;
  
  // Transform data for treemap
  const treeMapData = data?.data?.map(category => ({
    name: category.category,
    size: category.share,
    value: category.count
  })) || [];

  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm">Count: {payload[0].payload.value}</p>
          <p className="text-sm">Share: {payload[0].payload.size.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <Treemap
        data={treeMapData}
        dataKey="size"
        aspectRatio={4/3}
        stroke="#fff"
        fill="#8884d8"
        content={({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
          return (
            <g>
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                  fill: COLORS[index % COLORS.length],
                  stroke: '#fff',
                  strokeWidth: 2 / (depth + 1e-10),
                  strokeOpacity: 1 / (depth + 1e-10),
                }}
              />
              {width > 50 && height > 30 && (
                <text
                  x={x + width / 2}
                  y={y + height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize={12}
                >
                  {name}
                </text>
              )}
            </g>
          );
        }}
      >
        <Tooltip content={<CustomTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  );
}