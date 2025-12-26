export interface PassengerLog {
  id: number;
  date: string; // Stored as YYYY-MM-DD
  name: string;
  phone?: string; // Optional phone number
  amount: number;
  pickupLocation?: string;
  destination: string;
  paid: boolean;
  traveled: boolean;
  idCardNumber?: string;
}

export type NewPassengerLog = Omit<PassengerLog, 'id'>;

export interface ActiveFilters {
  name: string;
  date: string;
  destination: string;
  paidStatus: 'all' | 'paid' | 'unpaid';
}

export interface AppLocations {
  destinations: string[];
  pickupPoints: Record<string, string[]>;
}

export interface AppSettings {
  theme: 'light' | 'dark';
}

export interface AppBackupData {
  logs: PassengerLog[];
  locations: AppLocations;
  settings: AppSettings;
  version: string;
}
