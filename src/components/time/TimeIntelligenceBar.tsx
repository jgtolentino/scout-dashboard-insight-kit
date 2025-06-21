import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { useFilterStore } from '@/stores/filterStore';

interface TimeRange {
  label: string;
  from: Date;
  to: Date;
}

const TimeIntelligenceBar = () => {
  const { from, to, setFilter } = useFilterStore();
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const today = new Date();
  
  const timeRanges: TimeRange[] = [
    { 
      label: 'Today', 
      from: startOfDay(today), 
      to: endOfDay(today) 
    },
    { 
      label: 'Week', 
      from: startOfWeek(today, { weekStartsOn: 1 }), 
      to: endOfWeek(today, { weekStartsOn: 1 }) 
    },
    { 
      label: 'Month', 
      from: startOfMonth(today), 
      to: endOfMonth(today) 
    },
    { 
      label: 'Quarter', 
      from: new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1), 
      to: new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 0) 
    },
    { 
      label: 'Year', 
      from: startOfYear(today), 
      to: endOfYear(today) 
    },
  ];
  
  const [selectedRange, setSelectedRange] = useState<string>(from && to ? 'Custom' : 'Month');
  
  const handleRangeSelect = (range: TimeRange) => {
    setFilter('from', format(range.from, 'yyyy-MM-dd'));
    setFilter('to', format(range.to, 'yyyy-MM-dd'));
    setSelectedRange(range.label);
  };
  
  const handlePrevious = () => {
    if (!from || !to) return;
    
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diff = toDate.getTime() - fromDate.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    
    const newFromDate = subDays(fromDate, days);
    const newToDate = subDays(toDate, days);
    
    setFilter('from', format(newFromDate, 'yyyy-MM-dd'));
    setFilter('to', format(newToDate, 'yyyy-MM-dd'));
  };
  
  const handleNext = () => {
    if (!from || !to) return;
    
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diff = toDate.getTime() - fromDate.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    
    const newFromDate = new Date(fromDate);
    newFromDate.setDate(fromDate.getDate() + days);
    
    const newToDate = new Date(toDate);
    newToDate.setDate(toDate.getDate() + days);
    
    // Don't allow selecting future dates beyond today
    if (newToDate > today) return;
    
    setFilter('from', format(newFromDate, 'yyyy-MM-dd'));
    setFilter('to', format(newToDate, 'yyyy-MM-dd'));
  };
  
  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (!from || (from && to)) {
      // Start new range
      setFilter('from', format(date, 'yyyy-MM-dd'));
      setFilter('to', '');
    } else {
      // Complete range
      const fromDate = new Date(from);
      
      if (date < fromDate) {
        setFilter('from', format(date, 'yyyy-MM-dd'));
        setFilter('to', format(fromDate, 'yyyy-MM-dd'));
      } else {
        setFilter('to', format(date, 'yyyy-MM-dd'));
      }
      
      setCalendarOpen(false);
      setSelectedRange('Custom');
    }
  };
  
  const getDisplayDateRange = () => {
    if (!from) return 'Select dates';
    if (!to) return `From ${format(new Date(from), 'MMM d, yyyy')}`;
    return `${format(new Date(from), 'MMM d, yyyy')} - ${format(new Date(to), 'MMM d, yyyy')}`;
  };
  
  return (
    <div className="flex items-center justify-between p-2 bg-white/70 backdrop-blur-sm border rounded-lg shadow-sm">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handlePrevious}
          disabled={!from || !to}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-1">
          {timeRanges.map((range) => (
            <Button
              key={range.label}
              variant={selectedRange === range.label ? "default" : "ghost"}
              size="sm"
              onClick={() => handleRangeSelect(range)}
            >
              {range.label}
            </Button>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleNext}
          disabled={!from || !to || (to && new Date(to) >= today)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant={selectedRange === 'Custom' ? "default" : "outline"} 
            size="sm"
            className="ml-auto"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            {getDisplayDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={from ? new Date(from) : undefined}
            onSelect={handleCalendarSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TimeIntelligenceBar;