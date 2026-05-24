'use client';

import { Suspense } from 'react';
import NewOverridePage from '@/components/department-head/capacity/NewOverridePage';

export default function NewOverrideRoute() {
  return (
    <Suspense>
      <NewOverridePage />
    </Suspense>
  );
}
