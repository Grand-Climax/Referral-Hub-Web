'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/apiError';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import {
  useCreateCapacityOverrideMutation,
  useUpdateCapacityOverrideMutation,
} from '@/features/department-head/departmentHeadApi';
import type { CapacityOverride } from '@/types/department-head';
import type { RootState } from '@/lib/store';

interface CapacityOverrideDialogProps {
  open: boolean;
  onClose: () => void;
  selectedDate: string;
  currentMaxSlots?: number;
  existingOverride?: CapacityOverride;
}

export function CapacityOverrideDialog({
  open,
  onClose,
  selectedDate,
  currentMaxSlots,
  existingOverride,
}: CapacityOverrideDialogProps) {
  const [createOverride, { isLoading: isCreating }] = useCreateCapacityOverrideMutation();
  const [updateOverride, { isLoading: isUpdating }] = useUpdateCapacityOverrideMutation();

  // Get department ID from Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const departmentId = user?.departmentId;

  // Get schedule to extract the correct dept_id
  const { data: scheduleData } = useSelector((state: RootState) => {
    // Try to get schedule data from the cache
    const scheduleState = (state as any).departmentHeadApi?.queries;
    const scheduleQuery = Object.values(scheduleState || {}).find(
      (query: any) => query?.endpointName === 'getSchedule'
    ) as any;
    return { data: scheduleQuery?.data };
  });

  // Extract the actual dept_id from schedule data (it's different from department_id!)
  const actualDeptId = scheduleData?.[0]?.dept_id || departmentId;

  // Debug: Check JWT token
  const [jwtDebugInfo, setJwtDebugInfo] = useState<any>(null);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      try {
        const token = Cookies.get('access_token');
        if (token) {
          const decoded: any = jwtDecode(token);
          setJwtDebugInfo({
            dept_id_in_token: decoded.dept_id || 'NOT FOUND',
            hosp_id: decoded.hosp_id,
            role: decoded.role,
            sub: decoded.sub,
            full_token: decoded,
          });
          console.log('JWT Token Debug Info:', decoded);
        } else {
          setJwtDebugInfo({ error: 'No access token found' });
        }
      } catch (error) {
        setJwtDebugInfo({ error: 'Failed to decode token' });
        console.error('JWT decode error:', error);
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    new_limit: currentMaxSlots || 10,
    reason: '',
  });
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Update form when editing existing override
  useEffect(() => {
    if (existingOverride) {
      setFormData({
        new_limit: existingOverride.new_limit,
        reason: existingOverride.reason,
      });
    } else {
      setFormData({
        new_limit: currentMaxSlots || 10,
        reason: '',
      });
    }
    setErrorDetails(null);
  }, [existingOverride, currentMaxSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);

    // Check if we have department ID
    if (!actualDeptId) {
      setErrorDetails('Department ID not found. Please refresh the page and try again.');
      toast.error('Department ID missing. Please refresh the page.');
      return;
    }

    // Validation
    if (formData.new_limit < 1) {
      toast.error('Capacity limit must be at least 1');
      return;
    }

    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for this capacity override');
      return;
    }

    // Validate date format
    if (!selectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      toast.error('Invalid date format. Please select a valid date.');
      return;
    }

    try {
      if (existingOverride) {
        // Update existing override
        console.log('Updating capacity override:', {
          id: existingOverride.id,
          ...formData,
        });
        
        await updateOverride({
          id: existingOverride.id,
          ...formData,
        }).unwrap();
        
        toast.success('Capacity override updated successfully');
      } else {
        // Create new override with the actual dept_id from schedule
        const requestData = {
          target_date: selectedDate,
          ...formData,
          dept_id: actualDeptId, // Use the actual dept_id from schedule data
        };
        
        console.log('Creating capacity override with actual dept_id:', requestData);
        
        await createOverride(requestData).unwrap();
        
        toast.success('Capacity override created successfully');
      }

      onClose();
      setFormData({ new_limit: 10, reason: '' });
    } catch (error: any) {
      // Log error details for debugging
      console.error('Capacity override error:', {
        status: error?.status,
        message: error?.data?.message || error?.message,
        dept_id_sent: actualDeptId,
        department_id_from_jwt: departmentId,
        error: error,
      });
      
      const errorMessage = getApiErrorMessage(
        error,
        'Failed to save capacity override',
      );
      let details: string | null = null;

      if (
        errorMessage.includes('foreign key') ||
        errorMessage.includes('constraint')
      ) {
        details = `Database error: The dept_id "${actualDeptId}" doesn't exist in the system. Contact your administrator.`;
      } else if (
        errorMessage.includes('dept_id') ||
        errorMessage.includes('department')
      ) {
        details = `Department ID issue. Actual dept_id: ${actualDeptId}, JWT dept_id: ${departmentId}. Please contact support.`;
      } else if (errorMessage.includes('date')) {
        details = 'Invalid date. Please ensure the date is in the future.';
      } else if (error?.status === 500) {
        details = `Server error. Dept ID: ${actualDeptId}. The department may not exist in the database.`;
      }

      setErrorDetails(details || 'An error occurred. Please try again.');
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    onClose();
    setFormData({ new_limit: currentMaxSlots || 10, reason: '' });
    setErrorDetails(null);
  };

  if (!open) return null;

  const isLoading = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {existingOverride ? 'Edit Capacity Override' : 'Set Capacity Override'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedDate && format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Details */}
          {errorDetails && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Error Details</p>
                <p className="text-xs text-destructive/80 mt-1">{errorDetails}</p>
              </div>
            </div>
          )}

          {/* Current Capacity Info */}
          {currentMaxSlots && !existingOverride && (
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Current max capacity</p>
              <p className="text-lg font-bold text-foreground">{currentMaxSlots} slots</p>
            </div>
          )}

          {/* New Limit Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              New Capacity Limit *
            </label>
            <input
              type="number"
              value={formData.new_limit}
              onChange={(e) =>
                setFormData({ ...formData, new_limit: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
              min="1"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Set the maximum number of appointment slots for this date
            </p>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Reason for Override *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
              placeholder="Explain why this capacity override is needed (e.g., Holiday period, Staff training, Increased demand)"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Provide a clear justification for this capacity adjustment
            </p>
          </div>

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-muted-foreground border border-border rounded p-2">
              <summary className="cursor-pointer hover:text-foreground font-medium">
                🔍 Debug Info (Click to expand)
              </summary>
              
              <div className="mt-3 space-y-3">
                {/* Request Data */}
                <div>
                  <p className="font-semibold text-foreground mb-1">Request Data:</p>
                  <pre className="p-2 bg-muted rounded text-[10px] overflow-auto">
                    {JSON.stringify(
                      {
                        target_date: selectedDate,
                        new_limit: formData.new_limit,
                        reason: formData.reason,
                        dept_id: actualDeptId,
                        department_id_from_jwt: departmentId,
                        note: actualDeptId !== departmentId ? '⚠️ Using dept_id from schedule (different from JWT!)' : '✅ dept_id matches JWT',
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>

                {/* Redux State */}
                <div>
                  <p className="font-semibold text-foreground mb-1">Redux User State:</p>
                  <pre className="p-2 bg-muted rounded text-[10px] overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>

                {/* JWT Token Info */}
                <div>
                  <p className="font-semibold text-foreground mb-1">JWT Token Info:</p>
                  <pre className="p-2 bg-muted rounded text-[10px] overflow-auto">
                    {JSON.stringify(jwtDebugInfo, null, 2)}
                  </pre>
                </div>

                {/* Warning if dept_id missing */}
                {!actualDeptId && (
                  <div className="bg-destructive/10 border border-destructive rounded p-2">
                    <p className="text-destructive font-medium">
                      ⚠️ Department ID is missing!
                    </p>
                    <p className="text-xs mt-1">
                      Please refresh the page. If the issue persists, contact your administrator.
                    </p>
                  </div>
                )}

                {/* Warning if dept_ids don't match */}
                {actualDeptId && departmentId && actualDeptId !== departmentId && (
                  <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-900 rounded p-2">
                    <p className="text-amber-800 dark:text-amber-200 font-medium text-xs">
                      ℹ️ Using dept_id from schedule data
                    </p>
                    <p className="text-[10px] mt-1 text-amber-700 dark:text-amber-300">
                      JWT has: {departmentId}<br/>
                      Schedule has: {actualDeptId}<br/>
                      Using schedule value (correct one)
                    </p>
                  </div>
                )}

                {/* Warning if JWT doesn't have dept_id */}
                {jwtDebugInfo && !jwtDebugInfo.dept_id_in_token && (
                  <div className="bg-destructive/10 border border-destructive rounded p-2">
                    <p className="text-destructive font-medium">
                      ⚠️ JWT token doesn't contain dept_id!
                    </p>
                    <p className="text-xs mt-1">
                      The backend is not including department ID in the JWT token. Contact your backend team.
                    </p>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {existingOverride ? 'Update Override' : 'Create Override'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
