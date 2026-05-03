import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Specialist {
  id: string;
  name: string;
  specialty: string;
  email?: string;
  phone?: string;
  available: boolean;
  offDutyReason?: string;
  offDutySince?: string;
  currentLoad: number;
  maxLoad: number;
}

// Date-based availability schedule
export interface AvailabilitySchedule {
  [date: string]: {
    // date format: YYYY-MM-DD
    [specialistId: string]: {
      available: boolean;
      reason?: string;
      setAt: string; // timestamp when this was set
    };
  };
}

interface SpecialistAvailabilityState {
  specialists: Specialist[];
  schedule: AvailabilitySchedule; // Future availability changes
}

// Helper to get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper to load state from localStorage
function loadStateFromStorage(): SpecialistAvailabilityState | undefined {
  if (typeof window === 'undefined') return undefined;
  
  try {
    const saved = localStorage.getItem('specialistAvailability');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load specialist availability from localStorage:', error);
  }
  return undefined;
}

// Helper to save state to localStorage
function saveStateToStorage(state: SpecialistAvailabilityState) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('specialistAvailability', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save specialist availability to localStorage:', error);
  }
}

// Mock data - in real app this would come from backend
const initialSpecialists: Specialist[] = [
  {
    id: 's1',
    name: 'Dr. Sarah Smith',
    specialty: 'Cardiologist',
    email: 'sarah.smith@hospital.com',
    phone: '+251-911-234567',
    available: true,
    currentLoad: 3,
    maxLoad: 5,
  },
  {
    id: 's2',
    name: 'Dr. Alan Chen',
    specialty: 'Neurologist',
    email: 'alan.chen@hospital.com',
    phone: '+251-911-234568',
    available: true,
    currentLoad: 5,
    maxLoad: 5,
  },
  {
    id: 's3',
    name: 'Dr. Mia Torres',
    specialty: 'Pulmonologist',
    email: 'mia.torres@hospital.com',
    phone: '+251-911-234569',
    available: true,
    currentLoad: 2,
    maxLoad: 5,
  },
  {
    id: 's4',
    name: 'Dr. James Wilson',
    specialty: 'Orthopedic Surgeon',
    email: 'james.wilson@hospital.com',
    phone: '+251-911-234570',
    available: true,
    currentLoad: 4,
    maxLoad: 6,
  },
  {
    id: 's5',
    name: 'Dr. Emily Brown',
    specialty: 'Gastroenterologist',
    email: 'emily.brown@hospital.com',
    phone: '+251-911-234571',
    available: true,
    currentLoad: 1,
    maxLoad: 4,
  },
  {
    id: 's6',
    name: 'Dr. Michael Davis',
    specialty: 'Nephrologist',
    email: 'michael.davis@hospital.com',
    phone: '+251-911-234572',
    available: true,
    currentLoad: 3,
    maxLoad: 5,
  },
  {
    id: 's7',
    name: 'Dr. Lisa Anderson',
    specialty: 'Endocrinologist',
    email: 'lisa.anderson@hospital.com',
    phone: '+251-911-234573',
    available: true,
    currentLoad: 2,
    maxLoad: 4,
  },
  {
    id: 's8',
    name: 'Dr. Robert Martinez',
    specialty: 'Rheumatologist',
    email: 'robert.martinez@hospital.com',
    phone: '+251-911-234574',
    available: true,
    currentLoad: 1,
    maxLoad: 3,
  },
];

// Load saved state or use initial state
const savedState = loadStateFromStorage();

const initialState: SpecialistAvailabilityState = savedState || {
  specialists: initialSpecialists,
  schedule: {},
};

const specialistAvailabilitySlice = createSlice({
  name: 'specialistAvailability',
  initialState,
  reducers: {
    // Set availability for a future date (not today)
    setFutureAvailability: (
      state,
      action: PayloadAction<{
        specialistId: string;
        date: string; // YYYY-MM-DD format
        available: boolean;
        reason?: string;
      }>
    ) => {
      const { specialistId, date, available, reason } = action.payload;
      const today = getTodayDate();

      // Prevent changes to today's schedule
      if (date === today) {
        console.warn('Cannot modify availability for today');
        return;
      }

      // Initialize date in schedule if it doesn't exist
      if (!state.schedule[date]) {
        state.schedule[date] = {};
      }

      // Set availability for this specialist on this date
      state.schedule[date][specialistId] = {
        available,
        reason: available ? undefined : reason,
        setAt: new Date().toISOString(),
      };

      // Save to localStorage
      saveStateToStorage(state);
    },

    // Legacy action for immediate toggle (kept for backward compatibility)
    // This should only be used for display purposes, not for actual scheduling
    toggleSpecialistAvailability: (
      state,
      action: PayloadAction<{ id: string; available: boolean; reason?: string }>
    ) => {
      const specialist = state.specialists.find((s) => s.id === action.payload.id);
      if (specialist) {
        specialist.available = action.payload.available;
        if (!action.payload.available) {
          specialist.offDutyReason = action.payload.reason;
          specialist.offDutySince = new Date().toISOString();
        } else {
          specialist.offDutyReason = undefined;
          specialist.offDutySince = undefined;
        }
      }
      // Save to localStorage
      saveStateToStorage(state);
    },

    updateSpecialistLoad: (
      state,
      action: PayloadAction<{ id: string; currentLoad: number }>
    ) => {
      const specialist = state.specialists.find((s) => s.id === action.payload.id);
      if (specialist) {
        specialist.currentLoad = action.payload.currentLoad;
      }
      // Save to localStorage
      saveStateToStorage(state);
    },

    // Clean up old schedule entries (dates in the past)
    cleanupOldSchedule: (state) => {
      const today = getTodayDate();
      Object.keys(state.schedule).forEach((date) => {
        if (date < today) {
          delete state.schedule[date];
        }
      });
      // Save to localStorage
      saveStateToStorage(state);
    },
  },
});

export const {
  setFutureAvailability,
  toggleSpecialistAvailability,
  updateSpecialistLoad,
  cleanupOldSchedule,
} = specialistAvailabilitySlice.actions;

// Selector to get specialist availability for a specific date
export const getSpecialistAvailabilityForDate = (
  state: { specialistAvailability: SpecialistAvailabilityState },
  date: string
) => {
  const schedule = state.specialistAvailability.schedule[date];
  return state.specialistAvailability.specialists.map((specialist) => {
    const scheduledAvailability = schedule?.[specialist.id];
    if (scheduledAvailability) {
      return {
        ...specialist,
        available: scheduledAvailability.available,
        offDutyReason: scheduledAvailability.reason,
        offDutySince: scheduledAvailability.setAt,
      };
    }
    return specialist;
  });
};

export default specialistAvailabilitySlice.reducer;
