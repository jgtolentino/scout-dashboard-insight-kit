
import React from 'react';
import useSWR from 'swr';
import { Treemap, ResponsiveContainer } from 'recharts';
import { useFilterStore } from '@/stores/filterStore';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CategoryTreemapLive() {
  const { getQueryString } = useFilterStore();
  
  // Use the global filter store to build the query string
  const queryString = getQueryString();
  const apiUrl = `/api/category-mix${queryString ? '?' + queryString : ''}`;
  
  const { data } = useSWR(apiUrl, fetcher);
  
  if (!data) return <div className="animate-pulse h-48 bg-gray-100 rounded" />;
  
  return (
    <ResponsiveContainer width="100%" height={200}>
      <Treemap
        data={data.data}
        dataKey="share"
        stroke="#fff"
        fill="#4f46e5"
      />
    </ResponsiveContainer>
  );
}
