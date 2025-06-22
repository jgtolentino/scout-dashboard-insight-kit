import React, { useState } from 'react';
import { useFilterStore } from '@/stores/filterStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Package, Building, X, RotateCcw, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import CategoryCascadeExample from './CategoryCascadeExample';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';
import { Skeleton } from '@/components/ui/skeleton';

export function GlobalFilterBarExample() {
  const {
    from,
    to,
    barangays,
    stores,
    categories,
    brands,
    parentCategory,
    subCategory,
    setFilter,
    resetFilters,
  } = useFilterStore();

  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = [
    from,
    to,
    ...barangays,
    ...stores,
    ...categories,
    ...brands,
    parentCategory,
    subCategory,
  ].filter(Boolean).length;

  const removeArrayFilter = (key: 'barangays' | 'stores' | 'categories' | 'brands', value: string) => {
    const currentArray = useFilterStore.getState()[key];
    setFilter(key, currentArray.filter(item => item !== value));
  };

  // Fetch barangay options
  const { 
    data: barangayData, 
    isLoading: barangaysLoading 
  } = useQuery({
    queryKey: ['barangays'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/regions?level=barangay`);
      if (!response.ok) {
        throw new Error('Failed to fetch barangays');
      }
      return response.json();
    },
    staleTime: 60 * 60 * 1000 // 1 hour
  });

  // Fetch store options
  const { 
    data: storeData, 
    isLoading: storesLoading 
  } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/stores`);
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }
      return response.json();
    },
    staleTime: 60 * 60 * 1000 // 1 hour
  });

  // Fetch brand options
  const { 
    data: brandData, 
    isLoading: brandsLoading 
  } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/brands`);
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      return response.json();
    },
    staleTime: 60 * 60 * 1000 // 1 hour
  });

  // Process options
  const barangayOptions = barangayData?.data?.map((b: any) => b.name) || [];
  const storeOptions = storeData?.data?.map((s: any) => s.name) || [];
  const brandOptions = brandData?.data?.map((b: any) => b.name) || [];

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border rounded-lg bg-white/70 backdrop-blur-sm shadow-sm"
    >
      <div className="p-4 flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>
        
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="flex items-center space-x-1"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {from && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>From: {from}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilter('from', '')}
              />
            </Badge>
          )}
          {to && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>To: {to}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilter('to', '')}
              />
            </Badge>
          )}
          {parentCategory && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Package className="h-3 w-3" />
              <span>Category: {parentCategory}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilter('parentCategory', null)}
              />
            </Badge>
          )}
          {subCategory && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Package className="h-3 w-3" />
              <span>Subcategory: {subCategory}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilter('subCategory', null)}
              />
            </Badge>
          )}
          {barangays.map((barangay) => (
            <Badge key={barangay} variant="outline" className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{barangay}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeArrayFilter('barangays', barangay)}
              />
            </Badge>
          ))}
          {stores.map((store) => (
            <Badge key={store} variant="outline" className="flex items-center space-x-1">
              <Building className="h-3 w-3" />
              <span>{store}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeArrayFilter('stores', store)}
              />
            </Badge>
          ))}
          {categories.map((category) => (
            <Badge key={category} variant="outline" className="flex items-center space-x-1">
              <Package className="h-3 w-3" />
              <span>{category}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeArrayFilter('categories', category)}
              />
            </Badge>
          ))}
          {brands.map((brand) => (
            <Badge key={brand} variant="outline" className="flex items-center space-x-1">
              <span>{brand}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeArrayFilter('brands', brand)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Filter Controls */}
      <CollapsibleContent>
        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-muted/20 rounded-lg p-4 m-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={from}
                onChange={(e) => setFilter('from', e.target.value)}
                placeholder="From"
                className="w-full"
              />
              <Input
                type="date"
                value={to}
                onChange={(e) => setFilter('to', e.target.value)}
                placeholder="To"
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <CategoryCascadeExample />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Barangay</label>
            {barangaysLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                onValueChange={(value) => {
                  if (!barangays.includes(value)) {
                    setFilter('barangays', [...barangays, value]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select barangay" />
                </SelectTrigger>
                <SelectContent>
                  {barangayOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Store</label>
            {storesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                onValueChange={(value) => {
                  if (!stores.includes(value)) {
                    setFilter('stores', [...stores, value]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {storeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Brand</label>
            {brandsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                onValueChange={(value) => {
                  if (!brands.includes(value)) {
                    setFilter('brands', [...brands, value]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brandOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}