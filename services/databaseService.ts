import type { PassengerLog, NewPassengerLog, AppLocations, AppSettings, AppBackupData } from '../types.ts';

const DB_KEY = 'passengerLogs';
const LOCATIONS_KEY = 'appLocations';
const SETTINGS_KEY = 'appSettings';

const DEFAULT_LOCATIONS: AppLocations = {
  destinations: ["Manzanillo - Habana", "Habana - Manzanillo", "Manzanillo - Holguin"],
  pickupPoints: {
    "Habana - Manzanillo": [
      "100 y Boyeros", "Santa Catalina y Boyeros", "Ciudad deportiva", 
      "Vía blanca y agua dulce", "Barrio obrero", "4ta y 8 vía", 
      "Primer anillo", "Otro"
    ],
    "Manzanillo - Habana": [
      "Vallespin", "Educación", "Parque bertot", "Caimari", "Casa del pru", 
      "Terminal", "Mini terminal", "Novilla", "Esquina general Benítez", 
      "Placita", "Pedro Soto", "Maceo", "Ondi", "Celia", "Plaza", 
      "Cangrejo loco", "Cine popular", "Calzado", "Bertot", "Oro negro", 
      "Cayo redondo", "Yara"
    ],
    "Manzanillo - Holguin": [
       "Terminal", "Mini terminal", "Novilla", "Plaza", "Celia", "Otro"
    ]
  }
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light'
};

const initDB = (): void => {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(LOCATIONS_KEY)) {
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(DEFAULT_LOCATIONS));
  }
  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  }
};

const getPassengers = (): PassengerLog[] => {
  try {
    const logsStr = localStorage.getItem(DB_KEY);
    if (!logsStr) return [];
    const logs: any[] = JSON.parse(logsStr);
    return logs.map(log => ({
        ...log,
        destination: log.destination || 'Manzanillo - Habana',
        paid: typeof log.paid === 'boolean' ? log.paid : false,
        traveled: typeof log.traveled === 'boolean' ? log.traveled : false,
    }));
  } catch (error) {
    console.error("Error al recuperar los registros:", error);
    return [];
  }
};

const addPassenger = (log: NewPassengerLog): PassengerLog => {
  const logs = getPassengers();
  const newLog: PassengerLog = { ...log, id: new Date().getTime() };
  logs.unshift(newLog);
  localStorage.setItem(DB_KEY, JSON.stringify(logs));
  return newLog;
};

const updatePassenger = (updatedLog: PassengerLog): boolean => {
  const logs = getPassengers();
  const index = logs.findIndex(log => log.id === updatedLog.id);
  if (index === -1) return false;
  logs[index] = updatedLog;
  localStorage.setItem(DB_KEY, JSON.stringify(logs));
  return true;
};

const deletePassenger = (id: number): boolean => {
  let logs = getPassengers();
  const initialLength = logs.length;
  logs = logs.filter(log => log.id !== id);
  if (logs.length === initialLength) return false;
  localStorage.setItem(DB_KEY, JSON.stringify(logs));
  return true;
};

// Location Management
const getLocations = (): AppLocations => {
  try {
    const data = localStorage.getItem(LOCATIONS_KEY);
    return data ? JSON.parse(data) : DEFAULT_LOCATIONS;
  } catch {
    return DEFAULT_LOCATIONS;
  }
};

const saveLocations = (locations: AppLocations): void => {
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
};

// Settings Management
const getSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Backup Management
const exportFullData = (): string => {
  const data: AppBackupData = {
    logs: getPassengers(),
    locations: getLocations(),
    settings: getSettings(),
    version: "1.0.0"
  };
  return JSON.stringify(data, null, 2);
};

const importFullData = (jsonStr: string): boolean => {
  try {
    const data: AppBackupData = JSON.parse(jsonStr);
    if (data.logs) localStorage.setItem(DB_KEY, JSON.stringify(data.logs));
    if (data.locations) localStorage.setItem(LOCATIONS_KEY, JSON.stringify(data.locations));
    if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
    return true;
  } catch (e) {
    console.error("Error importing backup:", e);
    return false;
  }
};

export const databaseService = {
  initDB,
  getPassengers,
  addPassenger,
  updatePassenger,
  deletePassenger,
  getLocations,
  saveLocations,
  getSettings,
  saveSettings,
  exportFullData,
  importFullData
};