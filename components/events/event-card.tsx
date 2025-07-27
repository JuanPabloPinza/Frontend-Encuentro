'use client';

import { Event } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, DollarSign, Tag } from 'lucide-react';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface EventCardProps {
  event: Event;
  showActions?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: number) => void;
}

export function EventCard({ event, showActions = true, onEdit, onDelete }: EventCardProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/eventos/${event.idEvent}`);
  };

  const getLowestPrice = () => {
    if (!event.ticketCategories || event.ticketCategories.length === 0) return null;
    return Math.min(...event.ticketCategories.map(cat => cat.price));
  };

  const getTotalAvailableSeats = () => {
    if (!event.ticketCategories || event.ticketCategories.length === 0) return 0;
    return event.ticketCategories.reduce((total, cat) => total + cat.availableSeats, 0);
  };

  const isUpcoming = new Date(event.eventDate) > new Date();
  const lowestPrice = getLowestPrice();
  const totalAvailableSeats = getTotalAvailableSeats();

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 line-clamp-2">{event.eventName}</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {event.description || 'No description available'}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isUpcoming 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isUpcoming ? 'Upcoming' : 'Past'}
            </span>
            {!event.isActive && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Inactive
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Tag className="h-4 w-4 mr-2" />
            <span className="font-medium">{event.eventCategory}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDateTime(event.eventDate)}</span>
          </div>

          {event.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event.location}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{totalAvailableSeats} seats available</span>
          </div>

          {lowestPrice !== null && (
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>From {formatCurrency(lowestPrice)}</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="mt-auto pt-4 space-y-2">
            <Button 
              onClick={handleViewDetails}
              className="w-full"
              disabled={!event.isActive}
            >
              View Details
            </Button>
            
            {onEdit && onDelete && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(event)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onDelete(event.idEvent)}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}