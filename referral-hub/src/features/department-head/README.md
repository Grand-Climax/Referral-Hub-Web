# Department Head API Integration Guide

This guide explains how to use the Department Head API endpoints in your React components.

## Table of Contents
1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Usage Examples](#usage-examples)
4. [Error Handling](#error-handling)
5. [Best Practices](#best-practices)

---

## Overview

The Department Head API provides endpoints for:
- **Capacity Override Management**: Create, update, delete, and list capacity overrides
- **Schedule Management**: View schedules and update max slots
- **Batch Scheduling**: Trigger automated scheduling for waiting referrals

All endpoints require `DEPT_HEAD` role authentication.

---

## API Endpoints

### Capacity Override Endpoints

#### 1. Get All Capacity Overrides
```typescript
useGetCapacityOverridesQuery()
```
- **Method**: GET
- **Endpoint**: `/api/v1/department-head/capacity/overrides`
- **Returns**: List of active and upcoming capacity overrides
- **Errors**: 401 (Unauthorized), 500 (Internal Server Error)

#### 2. Create Capacity Override
```typescript
useCreateCapacityOverrideMutation()
```
- **Method**: POST
- **Endpoint**: `/api/v1/department-head/capacity/overrides`
- **Body**: `{ target_date: string, new_limit: number, reason: string }`
- **Side Effect**: Automatically synchronizes the daily schedule for that date
- **Errors**: 400 (Date in past), 401 (Unauthorized), 500 (Internal Server Error)

#### 3. Update Capacity Override
```typescript
useUpdateCapacityOverrideMutation()
```
- **Method**: PUT
- **Endpoint**: `/api/v1/department-head/capacity/overrides/{id}`
- **Body**: `{ new_limit: number, reason: string }`
- **Errors**: 400 (Invalid ID or input), 401 (Unauthorized), 500 (Internal Server Error)

#### 4. Delete Capacity Override
```typescript
useDeleteCapacityOverrideMutation()
```
- **Method**: DELETE
- **Endpoint**: `/api/v1/department-head/capacity/overrides/{id}`
- **Effect**: Reverts the daily schedule to standard limits
- **Errors**: 400 (Invalid ID), 401 (Unauthorized), 500 (Internal Server Error)

### Schedule Endpoints

#### 5. Get Schedule
```typescript
useGetScheduleQuery({ start_date?, end_date? })
```
- **Method**: GET
- **Endpoint**: `/api/v1/department-head/schedule`
- **Query Params**: `start_date` (YYYY-MM-DD), `end_date` (YYYY-MM-DD)
- **Default**: Returns next 30 days if no params provided
- **Returns**: List of daily schedule records
- **Errors**: 401 (Unauthorized), 500 (Internal Server Error)

#### 6. Run Batch Scheduling
```typescript
useRunBatchSchedulingMutation()
```
- **Method**: POST
- **Endpoint**: `/api/v1/department-head/schedule/batch`
- **Effect**: Assigns appointment dates to all WAITING referrals in priority order
- **Gatekeepers**: Respects buffer days and never overbooks
- **Errors**: 401 (Unauthorized), 500 (Internal Server Error)

#### 7. Update Max Slots
```typescript
useUpdateMaxSlotsMutation()
```
- **Method**: PUT
- **Endpoint**: `/api/v1/department-head/schedule/{id}/max-slots`
- **Body**: `{ max_slots: number }` (must be >= 1)
- **Errors**: 400 (Invalid schedule ID or input), 401 (Unauthorized), 500 (Internal Server Error)

---

## Usage Examples

### Example 1: Fetching and Displaying Capacity Overrides

```typescript
'use client';

import { useGetCapacityOverridesQuery } from '@/features/department-head/departmentHeadApi';

export default function CapacityOverridesList() {
  // Fetch capacity overrides
  const { data: overrides, isLoading, error } = useGetCapacityOverridesQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading overrides</div>;

  return (
    <div>
      <h2>Capacity Overrides</h2>
      {overrides?.map((override) => (
        <div key={override.id}>
          <p>Date: {override.target_date}</p>
          <p>New Limit: {override.new_limit}</p>
          <p>Reason: {override.reason}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Creating a Capacity Override

```typescript
'use client';

import { useState } from 'react';
import { useCreateCapacityOverrideMutation } from '@/features/department-head/departmentHeadApi';
import { toast } from 'sonner';

export default function CreateOverrideForm() {
  const [createOverride, { isLoading }] = useCreateCapacityOverrideMutation();
  const [formData, setFormData] = useState({
    target_date: '',
    new_limit: 0,
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createOverride(formData).unwrap();
      toast.success('Capacity override created successfully!');
      // Reset form
      setFormData({ target_date: '', new_limit: 0, reason: '' });
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create override');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="date"
        value={formData.target_date}
        onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
        required
      />
      <input
        type="number"
        value={formData.new_limit}
        onChange={(e) => setFormData({ ...formData, new_limit: Number(e.target.value) })}
        min="1"
        required
      />
      <textarea
        value={formData.reason}
        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
        placeholder="Reason for override"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Override'}
      </button>
    </form>
  );
}
```

### Example 3: Updating a Capacity Override

```typescript
'use client';

import { useUpdateCapacityOverrideMutation } from '@/features/department-head/departmentHeadApi';
import { toast } from 'sonner';

export default function UpdateOverrideButton({ overrideId }: { overrideId: string }) {
  const [updateOverride, { isLoading }] = useUpdateCapacityOverrideMutation();

  const handleUpdate = async () => {
    try {
      await updateOverride({
        id: overrideId,
        new_limit: 15,
        reason: 'Updated capacity due to increased demand',
      }).unwrap();
      
      toast.success('Override updated successfully!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update override');
    }
  };

  return (
    <button onClick={handleUpdate} disabled={isLoading}>
      {isLoading ? 'Updating...' : 'Update Override'}
    </button>
  );
}
```

### Example 4: Deleting a Capacity Override

```typescript
'use client';

import { useDeleteCapacityOverrideMutation } from '@/features/department-head/departmentHeadApi';
import { toast } from 'sonner';

export default function DeleteOverrideButton({ overrideId }: { overrideId: string }) {
  const [deleteOverride, { isLoading }] = useDeleteCapacityOverrideMutation();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this override?')) return;

    try {
      await deleteOverride(overrideId).unwrap();
      toast.success('Override deleted successfully!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete override');
    }
  };

  return (
    <button onClick={handleDelete} disabled={isLoading}>
      {isLoading ? 'Deleting...' : 'Delete Override'}
    </button>
  );
}
```

### Example 5: Fetching Schedule with Date Range

```typescript
'use client';

import { useGetScheduleQuery } from '@/features/department-head/departmentHeadApi';
import { format, addDays } from 'date-fns';

export default function ScheduleView() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const nextMonth = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  const { data: schedules, isLoading } = useGetScheduleQuery({
    start_date: today,
    end_date: nextMonth,
  });

  if (isLoading) return <div>Loading schedule...</div>;

  return (
    <div>
      <h2>Department Schedule</h2>
      {schedules?.map((schedule) => (
        <div key={schedule.id}>
          <p>Date: {schedule.date}</p>
          <p>Max Slots: {schedule.max_slots}</p>
          <p>Booked: {schedule.booked_slots}</p>
          <p>Available: {schedule.available_slots}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 6: Running Batch Scheduling

```typescript
'use client';

import { useRunBatchSchedulingMutation } from '@/features/department-head/departmentHeadApi';
import { toast } from 'sonner';

export default function BatchSchedulingButton() {
  const [runBatchScheduling, { isLoading }] = useRunBatchSchedulingMutation();

  const handleBatchScheduling = async () => {
    try {
      const result = await runBatchScheduling().unwrap();
      toast.success(result.message || 'Batch scheduling completed!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to run batch scheduling');
    }
  };

  return (
    <button onClick={handleBatchScheduling} disabled={isLoading}>
      {isLoading ? 'Running...' : 'Run Batch Scheduling'}
    </button>
  );
}
```

### Example 7: Updating Max Slots for a Day

```typescript
'use client';

import { useUpdateMaxSlotsMutation } from '@/features/department-head/departmentHeadApi';
import { toast } from 'sonner';

export default function UpdateMaxSlotsButton({ scheduleId }: { scheduleId: string }) {
  const [updateMaxSlots, { isLoading }] = useUpdateMaxSlotsMutation();

  const handleUpdate = async (newMaxSlots: number) => {
    try {
      await updateMaxSlots({
        id: scheduleId,
        max_slots: newMaxSlots,
      }).unwrap();
      
      toast.success('Max slots updated successfully!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update max slots');
    }
  };

  return (
    <button onClick={() => handleUpdate(20)} disabled={isLoading}>
      {isLoading ? 'Updating...' : 'Set Max Slots to 20'}
    </button>
  );
}
```

---

## Error Handling

### Common Error Patterns

```typescript
import { toast } from 'sonner';

// Pattern 1: Using try-catch with unwrap()
try {
  await createOverride(data).unwrap();
  toast.success('Success!');
} catch (error: any) {
  // Handle specific error codes
  if (error?.status === 400) {
    toast.error('Invalid input. Please check your data.');
  } else if (error?.status === 401) {
    toast.error('Unauthorized. Please log in again.');
  } else {
    toast.error(error?.data?.message || 'An error occurred');
  }
}

// Pattern 2: Using isError and error from hook
const { data, isLoading, isError, error } = useGetCapacityOverridesQuery();

if (isError) {
  const errorMessage = (error as any)?.data?.message || 'Failed to load data';
  return <div className="text-red-500">{errorMessage}</div>;
}
```

---

## Best Practices

### 1. **Use Optimistic Updates for Better UX**
```typescript
const [deleteOverride] = useDeleteCapacityOverrideMutation();

// Show immediate feedback before API call completes
const handleDelete = async (id: string) => {
  toast.loading('Deleting override...');
  try {
    await deleteOverride(id).unwrap();
    toast.success('Deleted successfully!');
  } catch (error) {
    toast.error('Failed to delete');
  }
};
```

### 2. **Invalidate Tags for Data Consistency**
The API automatically invalidates tags when mutations occur:
- Creating/updating/deleting overrides invalidates both `CapacityOverride` and `Schedule` tags
- This ensures related data is refetched automatically

### 3. **Handle Loading States**
```typescript
const { data, isLoading, isFetching } = useGetScheduleQuery();

// isLoading: true on first fetch
// isFetching: true on any fetch (including refetch)

if (isLoading) return <Skeleton />;
if (isFetching) return <div>Refreshing... {/* Show existing data */}</div>;
```

### 4. **Use Date Formatting Consistently**
```typescript
import { format } from 'date-fns';

// Always use YYYY-MM-DD format for API calls
const formattedDate = format(new Date(), 'yyyy-MM-dd');
```

### 5. **Validate Input Before API Calls**
```typescript
const handleSubmit = async (data: CreateCapacityOverrideRequest) => {
  // Validate date is not in the past
  const targetDate = new Date(data.target_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (targetDate < today) {
    toast.error('Cannot create override for past dates');
    return;
  }
  
  // Validate new_limit is positive
  if (data.new_limit < 1) {
    toast.error('New limit must be at least 1');
    return;
  }
  
  // Proceed with API call
  await createOverride(data).unwrap();
};
```

### 6. **Refetch Data When Needed**
```typescript
const { data, refetch } = useGetCapacityOverridesQuery();

// Manual refetch
<button onClick={() => refetch()}>Refresh</button>

// Or use polling for real-time updates
const { data } = useGetCapacityOverridesQuery(undefined, {
  pollingInterval: 30000, // Refetch every 30 seconds
});
```

---

## TypeScript Types Reference

All types are exported from `@/types/department-head`:

```typescript
import {
  CapacityOverride,
  CreateCapacityOverrideRequest,
  UpdateCapacityOverrideRequest,
  DailySchedule,
  UpdateMaxSlotsRequest,
  BatchSchedulingResponse,
  ApiSuccessResponse,
} from '@/types/department-head';
```

---

## Next Steps

1. Review the existing `CapacityManagementPage.tsx` component
2. Replace mock data with real API calls
3. Add error handling and loading states
4. Test with the backend API
5. Add form validation using Zod (optional)

For questions or issues, refer to the backend Swagger documentation or contact the backend team.
