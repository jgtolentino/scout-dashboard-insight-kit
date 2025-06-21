
import React from 'react';
import useSWR from 'swr';
import { Treemap, ResponsiveContainer } from 'recharts';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CategoryTreemapLive() {
  const { data } = useSWR('/api/category-mix', fetcher);
  
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
