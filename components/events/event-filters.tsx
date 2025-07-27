'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Calendar, Tag, X } from 'lucide-react';

interface EventFiltersProps {
  categories: string[];
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string | null) => void;
  onTimeFilter: (filter: 'all' | 'upcoming' | 'past') => void;
  onStatusFilter: (filter: 'all' | 'active' | 'inactive') => void;
}

export function EventFilters({
  categories,
  onSearch,
  onCategoryFilter,
  onTimeFilter,
  onStatusFilter
}: EventFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleCategoryChange = (category: string) => {
    const newCategory = category === 'all' ? null : category;
    setSelectedCategory(newCategory);
    onCategoryFilter(newCategory);
  };

  const handleTimeFilterChange = (filter: 'all' | 'upcoming' | 'past') => {
    setSelectedTimeFilter(filter);
    onTimeFilter(filter);
  };

  const handleStatusFilterChange = (filter: 'all' | 'active' | 'inactive') => {
    setSelectedStatusFilter(filter);
    onStatusFilter(filter);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedTimeFilter('all');
    setSelectedStatusFilter('all');
    onSearch('');
    onCategoryFilter(null);
    onTimeFilter('all');
    onStatusFilter('all');
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedTimeFilter !== 'all' || selectedStatusFilter !== 'all';

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Clear</span>
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Category
                </label>
                <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Time
                </label>
                <Select value={selectedTimeFilter} onValueChange={handleTimeFilterChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All events</SelectItem>
                    <SelectItem value="upcoming">Upcoming events</SelectItem>
                    <SelectItem value="past">Past events</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Filter className="h-4 w-4 mr-1" />
                  Status
                </label>
                <Select value={selectedStatusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="active">Active only</SelectItem>
                    <SelectItem value="inactive">Inactive only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}