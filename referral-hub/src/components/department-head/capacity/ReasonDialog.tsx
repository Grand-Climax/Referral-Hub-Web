'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle }        from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button }    from '@/components/ui/button';
import { Textarea }  from '@/components/ui/textarea';
import { Label }     from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { REASON_OPTIONS } from './types';

// ── Props ─────────────────────────────────────────────────────────────────────

interface ReasonDialogProps {
  open: boolean;
  doctorName: string;
  newActive: boolean;
  onConfirm: (category: string, note: string) => void;
  onCancel: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ReasonDialog({
  open,
  doctorName,
  newActive,
  onConfirm,
  onCancel,
}: ReasonDialogProps) {
  const [category, setCategory] = useState('');
  const [note, setNote]         = useState('');

  // Reset fields each time the dialog opens
  useEffect(() => {
    if (open) { setCategory(''); setNote(''); }
  }, [open]);

  if (!open) return null;

  const canConfirm = category !== '' && note.trim().length >= 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog panel */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <Card className="border bg-card shadow-2xl">

          <CardHeader className="pb-3 border-b border-border px-5 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Confirm Schedule Change
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Marking{' '}
                  <span className="font-semibold text-foreground">{doctorName}</span>{' '}
                  as{' '}
                  <span className={`font-semibold ${newActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {newActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            {/* Reason category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Reason Category <span className="text-rose-500">*</span>
              </Label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Select a reason…" />
                </SelectTrigger>
                <SelectContent>
                  {REASON_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clinical justification */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Clinical Justification <span className="text-rose-500">*</span>{' '}
                <span className="font-normal text-muted-foreground">(min. 10 characters)</span>
              </Label>
              <Textarea
                placeholder="Provide a brief clinical justification for this change…"
                className="resize-none h-24 text-sm"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground text-right">
                {note.trim().length} / 10 min
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 h-10" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!canConfirm}
                onClick={() => onConfirm(category, note)}
              >
                Confirm Change
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
