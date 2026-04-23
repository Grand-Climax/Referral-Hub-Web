import { Info, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button }   from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Doctor, DaySchedule, STATUS_CONFIG } from './types';

// ── Props ─────────────────────────────────────────────────────────────────────

interface PersonnelTableProps {
  doctors: Doctor[];
  schedule: DaySchedule;
  selectedDateLabel: string;
  isToday: boolean;
  hasUnsavedChanges: boolean;
  onToggle: (doctorId: string, doctorName: string) => void;
  onApply: () => void;
  onReset: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PersonnelTable({
  doctors,
  schedule,
  selectedDateLabel,
  isToday,
  hasUnsavedChanges,
  onToggle,
  onApply,
  onReset,
}: PersonnelTableProps) {
  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-border">
        <CardTitle className="text-base font-bold text-foreground">
          Personnel Deployment ({selectedDateLabel})
        </CardTitle>
        <div className="flex items-center gap-4 text-[11px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />AVAILABLE</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"  />AT CAPACITY</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400"  />OFF DUTY</span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['NAME', 'DEPARTMENT', 'CURRENT STATUS', 'AVAILABILITY TOGGLE'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {doctors.map((doc) => {
                const isActive         = schedule[doc.id] ?? true;
                const { label, cls }   = STATUS_CONFIG[doc.defaultStatus];

                return (
                  <tr key={doc.id} className={`transition-colors hover:bg-muted/20 ${!isActive ? 'opacity-60' : ''}`}>
                    {/* Name + avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border shrink-0">
                          <AvatarImage src="/user.png" alt={doc.name} />
                          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                            {doc.avatarFallback}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                        </div>
                      </div>
                    </td>

                    {/* Ward */}
                    <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{doc.ward}</td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide ${cls}`}>
                        {label}
                      </span>
                    </td>

                    {/* Toggle */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          disabled={isToday}
                          onClick={() => onToggle(doc.id, doc.name)}
                          aria-label={`Toggle ${doc.name} availability`}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                            isToday ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                          } ${isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0" />
            High-priority planning informs patient booking algorithms instantly.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm" disabled={isToday} onClick={onReset}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset Grid
            </Button>
            <Button
              size="sm"
              className="h-9 text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isToday || !hasUnsavedChanges}
              onClick={onApply}
            >
              Apply Schedule
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
