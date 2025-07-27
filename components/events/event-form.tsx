'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEvents } from '@/lib/hooks/use-events';
import { Event } from '@/lib/types';
import { Plus, Minus, Calendar, MapPin, Tag, FileText, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const ticketCategorySchema = z.object({
  categoryName: z.string().min(1, 'Category name is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  totalSeats: z.number().min(1, 'Total seats must be at least 1'),
  description: z.string().optional(),
});

const eventFormSchema = z.object({
  eventName: z.string().min(1, 'Event name is required'),
  eventCategory: z.string().min(1, 'Event category is required'),
  description: z.string().optional(),
  eventDate: z.string().min(1, 'Event date is required'),
  location: z.string().optional(),
  ticketCategories: z.array(ticketCategorySchema).min(1, 'At least one ticket category is required'),
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: Event;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const { createEvent, updateEvent } = useEvents();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!event;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      eventName: event?.eventName || '',
      eventCategory: event?.eventCategory || '',
      description: event?.description || '',
      eventDate: event?.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '',
      location: event?.location || '',
      ticketCategories: event?.ticketCategories.map(cat => ({
        categoryName: cat.categoryName,
        price: cat.price,
        totalSeats: cat.totalSeats,
        description: cat.description || '',
      })) || [
        { categoryName: '', price: 0, totalSeats: 0, description: '' }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticketCategories',
  });

  const watchedCategories = watch('ticketCategories');

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);

    try {
      const eventData = {
        ...data,
        eventDate: new Date(data.eventDate).toISOString(),
        ticketCategories: data.ticketCategories.map(cat => ({
          ...cat,
          description: cat.description || undefined,
        })),
      };

      let result;
      if (isEditing) {
        result = await updateEvent(event.idEvent, eventData);
      } else {
        result = await createEvent(eventData);
      }

      if (result.success) {
        toast.success(isEditing ? 'Event updated successfully!' : 'Event created successfully!');
        router.push('/eventos');
      } else {
        toast.error(result.error || 'Failed to save event');
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTicketCategory = () => {
    append({ categoryName: '', price: 0, totalSeats: 0, description: '' });
  };

  const removeTicketCategory = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const getTotalSeats = () => {
    return watchedCategories.reduce((total, cat) => total + (cat.totalSeats || 0), 0);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Event Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Event Information
          </CardTitle>
          <CardDescription>
            Basic details about your event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                placeholder="Enter event name"
                {...register('eventName')}
                disabled={isSubmitting}
              />
              {errors.eventName && (
                <p className="text-sm text-red-500">{errors.eventName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventCategory">Category *</Label>
              <Input
                id="eventCategory"
                placeholder="e.g., Music, Sports, Technology"
                {...register('eventCategory')}
                disabled={isSubmitting}
              />
              {errors.eventCategory && (
                <p className="text-sm text-red-500">{errors.eventCategory.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe your event..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('description')}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Date & Time *</Label>
              <Input
                id="eventDate"
                type="datetime-local"
                {...register('eventDate')}
                disabled={isSubmitting}
              />
              {errors.eventDate && (
                <p className="text-sm text-red-500">{errors.eventDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Event venue or address"
                {...register('location')}
                disabled={isSubmitting}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Categories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Ticket Categories
              </CardTitle>
              <CardDescription>
                Define different ticket types and pricing
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={addTicketCategory}
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {errors.ticketCategories && (
            <Alert variant="destructive">
              <AlertDescription>
                {errors.ticketCategories.message}
              </AlertDescription>
            </Alert>
          )}

          {fields.map((field, index) => (
            <Card key={field.id} className="border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Category {index + 1}
                  </CardTitle>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTicketCategory(index)}
                      disabled={isSubmitting}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`categoryName-${index}`}>Category Name *</Label>
                    <Input
                      id={`categoryName-${index}`}
                      placeholder="e.g., VIP, General, Student"
                      {...register(`ticketCategories.${index}.categoryName`)}
                      disabled={isSubmitting}
                    />
                    {errors.ticketCategories?.[index]?.categoryName && (
                      <p className="text-sm text-red-500">
                        {errors.ticketCategories[index]?.categoryName?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`price-${index}`}>Price (USD) *</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...register(`ticketCategories.${index}.price`, {
                        valueAsNumber: true,
                      })}
                      disabled={isSubmitting}
                    />
                    {errors.ticketCategories?.[index]?.price && (
                      <p className="text-sm text-red-500">
                        {errors.ticketCategories[index]?.price?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`totalSeats-${index}`}>Total Seats *</Label>
                  <Input
                    id={`totalSeats-${index}`}
                    type="number"
                    min="1"
                    placeholder="100"
                    {...register(`ticketCategories.${index}.totalSeats`, {
                      valueAsNumber: true,
                    })}
                    disabled={isSubmitting}
                  />
                  {errors.ticketCategories?.[index]?.totalSeats && (
                    <p className="text-sm text-red-500">
                      {errors.ticketCategories[index]?.totalSeats?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Input
                    id={`description-${index}`}
                    placeholder="Optional description for this category"
                    {...register(`ticketCategories.${index}.description`)}
                    disabled={isSubmitting}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Total Capacity:</span>
              <span className="font-bold">{getTotalSeats()} seats</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/eventos')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{isEditing ? 'Update Event' : 'Create Event'}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}