'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { format, addDays } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ShieldAlert, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

import { useCreateCapacityOverrideMutation } from '@/features/department-head/departmentHeadApi';
import { getApiErrorMessage } from '@/lib/apiError';

const BUFFER_DAYS = 3;
const minDate = format(addDays(new Date(), BUFFER_DAYS), 'yyyy-MM-dd');
const minDateDisplay = format(addDays(new Date(), BUFFER_DAYS), 'MMMM d, yyyy');

const schema = z.object({
  target_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid date')
    .refine((d) => d >= minDate, {
      message: `Date must be at least ${BUFFER_DAYS} days in the future (earliest: ${minDateDisplay})`,
    }),
  new_limit: z
    .number()
    .int('Must be a whole number')
    .min(0, 'Minimum 0')
    .max(200, 'Maximum 200'),
  reason: z
    .string()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason must be at most 500 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function NewOverridePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillDate = searchParams.get('date') ?? '';
  const safeDate = prefillDate >= minDate ? prefillDate : '';

  const [createOverride, { isLoading }] = useCreateCapacityOverrideMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      target_date: safeDate,
      new_limit: 0,
      reason: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createOverride(values).unwrap();
      toast.success(
        `Override created for ${format(new Date(values.target_date), 'MMMM d, yyyy')}`
      );
      router.push('/department-head/capacity/overrides');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create override'));
    }
  };

  return (
    <div className="max-w-[680px] mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/department-head/capacity/overrides">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            New Capacity Override
          </h1>
          <p className="text-xs text-muted-foreground">
            Override the daily limit for a specific future date
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 px-4 py-3">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p>
            <strong>Immutable by design.</strong> Overrides cannot be edited — only revoked.
          </p>
          <p>
            Earliest allowed date: <strong>{minDateDisplay}</strong>
          </p>
        </div>
      </div>

      <Card className="border bg-card shadow-sm">
        <CardHeader className="py-4 px-5 border-b border-border">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            Override Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="target_date">Target Date *</Label>
              <Input
                id="target_date"
                type="date"
                min={minDate}
                {...register('target_date')}
                className={errors.target_date ? 'border-destructive' : ''}
              />
              {errors.target_date && (
                <p className="text-xs text-destructive">{errors.target_date.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new_limit">New Daily Limit *</Label>
              <Input
                id="new_limit"
                type="number"
                min={0}
                max={200}
                {...register('new_limit', { valueAsNumber: true })}
                className={errors.new_limit ? 'border-destructive' : ''}
              />
              {errors.new_limit && (
                <p className="text-xs text-destructive">{errors.new_limit.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Absolute new max for the day (0–200), not a delta.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                rows={4}
                placeholder="e.g., Senior doctor on leave, public holiday, training day…"
                {...register('reason')}
                className={`resize-none ${errors.reason ? 'border-destructive' : ''}`}
              />
              {errors.reason && (
                <p className="text-xs text-destructive">{errors.reason.message}</p>
              )}
              <p className="text-xs text-muted-foreground">3–500 characters.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/department-head/capacity/overrides">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Override
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
