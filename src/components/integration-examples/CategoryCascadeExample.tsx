import React, { useState, useEffect } from 'react';
import { CascadingSelect, CategoryOption } from '@/components/ui/cascading-select';
import { useFilterStore } from '@/stores/filterStore';
import { API_BASE_URL } from '@/config/api';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryCascadeExample() {
  const { parentCategory, subCategory, setFilter, resetSubCategory } = useFilterStore();
  
  // Fetch parent categories
  const { 
    data: parentData, 
    isLoading: isLoadingParent,
    error: parentError
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
    staleTime: 60 * 60 * 1000 // 1 hour
  });
  
  // Fetch child categories when parent changes
  const { 
    data: childData, 
    isLoading: isLoadingChild,
    error: childError
  } = useQuery({
    queryKey: ['categories', parentCategory],
    queryFn: async () => {
      if (!parentCategory) return [{ id: null, name: 'All Subcategories' }];
      
      const response = await fetch(`${API_BASE_URL}/categories?parent=${parentCategory}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }
      return response.json();
    },
    enabled: !!parentCategory,
    staleTime: 60 * 60 * 1000 // 1 hour
  });
  
  // Process parent categories
  const parentOptions: CategoryOption[] = React.useMemo(() => {
    const defaultOption = [{ id: null, name: 'All Categories' }];
    
    if (isLoadingParent || parentError) {
      return defaultOption;
    }
    
    return [
      ...defaultOption,
      ...(parentData || [])
    ];
  }, [parentData, isLoadingParent, parentError]);
  
  // Process child categories
  const childOptions: CategoryOption[] = React.useMemo(() => {
    const defaultOption = [{ id: null, name: 'All Subcategories' }];
    
    if (!parentCategory || isLoadingChild || childError) {
      return defaultOption;
    }
    
    return [
      ...defaultOption,
      ...(childData || [])
    ];
  }, [childData, parentCategory, isLoadingChild, childError]);

  const handleParentChange = (value: string | null) => {
    setFilter('parentCategory', value);
    resetSubCategory();
  };

  const handleChildChange = (value: string | null) => {
    setFilter('subCategory', value);
  };

  if (isLoadingParent) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <CascadingSelect
      parentOptions={parentOptions}
      childOptions={childOptions}
      parentValue={parentCategory}
      childValue={subCategory}
      onParentChange={handleParentChange}
      onChildChange={handleChildChange}
      parentPlaceholder="Category"
      childPlaceholder="Subcategory"
      isLoading={isLoadingChild}
    />
  );
}