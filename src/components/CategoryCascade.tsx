import React, { useState, useEffect } from 'react';
import { CascadingSelect, CategoryOption } from '@/components/ui/cascading-select';
import { useFilterStore } from '@/stores/filterStore';
import { API_BASE_URL } from '@/config/api';

export default function CategoryCascade() {
  const { categories, setFilter } = useFilterStore();
  const [parentCategory, setParentCategory] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [parentOptions, setParentOptions] = useState<CategoryOption[]>([
    { id: null, name: 'All Categories' }
  ]);
  const [childOptions, setChildOptions] = useState<CategoryOption[]>([
    { id: null, name: 'All Subcategories' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch parent categories on mount
  useEffect(() => {
    const fetchParentCategories = async () => {
      setIsLoading(true);
      try {
        // In mock mode, use hardcoded categories
        if (import.meta.env.VITE_USE_MOCKS === 'true') {
          const mockParentCategories: CategoryOption[] = [
            { id: null, name: 'All Categories' },
            { id: 'beverages', name: 'Beverages', level: 1 },
            { id: 'snacks', name: 'Snacks', level: 1 },
            { id: 'personal-care', name: 'Personal Care', level: 1 },
            { id: 'household', name: 'Household Items', level: 1 }
          ];
          setParentOptions(mockParentCategories);
        } else {
          // Real API call
          const response = await fetch(`${API_BASE_URL}/categories`);
          if (response.ok) {
            const data = await response.json();
            setParentOptions([
              { id: null, name: 'All Categories' },
              ...data
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching parent categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParentCategories();
  }, []);

  // Fetch child categories when parent changes
  useEffect(() => {
    const fetchChildCategories = async () => {
      if (!parentCategory) {
        setChildOptions([{ id: null, name: 'All Subcategories' }]);
        return;
      }

      setIsLoading(true);
      try {
        // In mock mode, use hardcoded subcategories
        if (import.meta.env.VITE_USE_MOCKS === 'true') {
          const mockSubcategories: Record<string, CategoryOption[]> = {
            'beverages': [
              { id: null, name: 'All Beverages' },
              { id: 'coffee', name: 'Coffee', parent_id: 'beverages', level: 2 },
              { id: 'tea', name: 'Tea', parent_id: 'beverages', level: 2 },
              { id: 'soda', name: 'Soda', parent_id: 'beverages', level: 2 },
              { id: 'juice', name: 'Juice', parent_id: 'beverages', level: 2 }
            ],
            'snacks': [
              { id: null, name: 'All Snacks' },
              { id: 'chips', name: 'Chips', parent_id: 'snacks', level: 2 },
              { id: 'cookies', name: 'Cookies', parent_id: 'snacks', level: 2 },
              { id: 'crackers', name: 'Crackers', parent_id: 'snacks', level: 2 }
            ],
            'personal-care': [
              { id: null, name: 'All Personal Care' },
              { id: 'soap', name: 'Soap', parent_id: 'personal-care', level: 2 },
              { id: 'shampoo', name: 'Shampoo', parent_id: 'personal-care', level: 2 }
            ],
            'household': [
              { id: null, name: 'All Household' },
              { id: 'cleaning', name: 'Cleaning', parent_id: 'household', level: 2 },
              { id: 'laundry', name: 'Laundry', parent_id: 'household', level: 2 }
            ]
          };
          
          setChildOptions(mockSubcategories[parentCategory] || [{ id: null, name: 'All Subcategories' }]);
        } else {
          // Real API call
          const response = await fetch(`${API_BASE_URL}/categories?parent=${parentCategory}`);
          if (response.ok) {
            const data = await response.json();
            setChildOptions([
              { id: null, name: 'All Subcategories' },
              ...data
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildCategories();
  }, [parentCategory]);

  // Update global filter when selections change
  useEffect(() => {
    // If parent is null, clear categories filter
    if (parentCategory === null) {
      setFilter('categories', []);
      return;
    }

    // If subcategory is selected, use that
    if (subCategory !== null) {
      setFilter('categories', [subCategory]);
      return;
    }

    // Otherwise use parent category
    setFilter('categories', [parentCategory]);
  }, [parentCategory, subCategory, setFilter]);

  const handleParentChange = (value: string | null) => {
    setParentCategory(value);
    setSubCategory(null); // Reset subcategory when parent changes
  };

  const handleChildChange = (value: string | null) => {
    setSubCategory(value);
  };

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
      isLoading={isLoading}
    />
  );
}