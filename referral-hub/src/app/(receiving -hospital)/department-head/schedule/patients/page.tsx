'use client';

import { Suspense } from 'react';
import PatientsOfDayPage from '@/components/department-head/schedule/PatientsOfDayPage';

export default function PatientsOfDayRoute() {
  return (
    <Suspense>
      <PatientsOfDayPage />
    </Suspense>
  );
}
