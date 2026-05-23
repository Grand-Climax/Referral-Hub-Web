'use client';

import { format } from 'date-fns';
import { Loader2, Edit, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/apiError';
import type { CapacityOverride } from '@/types/department-head';
import { useDeleteCapacityOverrideMutation } from '@/features/department-head/departmentHeadApi';
import { useState } from 'react';
import { CapacityOverrideDialog } from './CapacityOverrideDialog';

interface CapacityOverridesListProps {
  overrides?: CapacityOverride[];
  isLoading: boolean;
}

export function CapacityOverridesList({ overrides, isLoading }: CapacityOverridesListProps) {
  const [deleteOverride, { isLoading: isDeleting }] = useDeleteCapacityOverrideMutation();
  const [editingOverride, setEditingOverride] = useState<CapacityOverride | null>(null);

  const handleDelete = async (id: string, date: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the capacity override for ${date}? This will revert to standard capacity limits.`
      )
    ) {
      return;
    }

    try {
      await deleteOverride(id).unwrap();
      toast.success('Capacity override deleted successfully');
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Failed to delete capacity override'));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Capacity Overrides</CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground mt-4">Loading overrides...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Active Capacity Overrides</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Temporary capacity adjustments for specific dates
              </p>
            </div>
            {overrides && overrides.length > 0 && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                {overrides.length} active
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!overrides || overrides.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No capacity overrides set</p>
              <p className="text-xs text-muted-foreground mt-1">
                Select a future date and click &quot;Set Capacity Override&quot; to create one
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {overrides.map((override) => (
                <div
                  key={override.id}
                  className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-base font-bold text-foreground">
                        {format(new Date(override.target_date), 'EEEE, MMMM dd, yyyy')}
                      </span>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                        {override.new_limit} slots
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Reason:</span>{' '}
                      {override.reason}
                    </p>
                    {override.created_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {format(new Date(override.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingOverride(override)}
                      disabled={isDeleting}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(override.id, override.target_date)}
                      disabled={isDeleting}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingOverride && (
        <CapacityOverrideDialog
          open={!!editingOverride}
          onClose={() => setEditingOverride(null)}
          selectedDate={editingOverride.target_date}
          currentMaxSlots={editingOverride.new_limit}
          existingOverride={editingOverride}
        />
      )}
    </>
  );
}
