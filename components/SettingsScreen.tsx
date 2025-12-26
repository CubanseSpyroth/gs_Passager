
import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService.ts';
import type { AppLocations } from '../types.ts';
import { SunIcon, MoonIcon, ArrowDownTrayIcon, PlusIcon, TrashIcon, XMarkIcon } from './icons.tsx';

interface SettingsScreenProps {
  onThemeChange: (theme: 'light' | 'dark') => void;
  theme: 'light' | 'dark';
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onThemeChange, theme }) => {
  const [locations, setLocations] = useState<AppLocations>(databaseService.getLocations());
  const [newDest, setNewDest] = useState('');
  const [selectedDestForPickup, setSelectedDestForPickup] = useState('');
  const [newPickup, setNewPickup] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (locations.destinations.length > 0 && !selectedDestForPickup) {
        setSelectedDestForPickup(locations.destinations[0]);
    }
  }, [locations]);

  const handleAddDestination = () => {
    if (!newDest.trim()) return;
    if (locations.destinations.includes(newDest.trim())) return;

    const updated = {
        ...locations,
        destinations: [...locations.destinations, newDest.trim()],
        pickupPoints: { ...locations.pickupPoints, [newDest.trim()]: [] }
    };
    setLocations(updated);
    databaseService.saveLocations(updated);
    setNewDest('');
  };

  const handleRemoveDestination = (dest: string) => {
    const updatedDestinations = locations.destinations.filter(d => d !== dest);
    const updatedPickupPoints = { ...locations.pickupPoints };
    delete updatedPickupPoints[dest];

    const updated = {
        destinations: updatedDestinations,
        pickupPoints: updatedPickupPoints
    };
    setLocations(updated);
    databaseService.saveLocations(updated);
    if (selectedDestForPickup === dest) {
        setSelectedDestForPickup(updatedDestinations[0] || '');
    }
  };

  const handleAddPickup = () => {
    if (!selectedDestForPickup || !newPickup.trim()) return;
    const currentPoints = locations.pickupPoints[selectedDestForPickup] || [];
    if (currentPoints.includes(newPickup.trim())) return;

    const updated = {
        ...locations,
        pickupPoints: {
            ...locations.pickupPoints,
            [selectedDestForPickup]: [...currentPoints, newPickup.trim()]
        }
    };
    setLocations(updated);
    databaseService.saveLocations(updated);
    setNewPickup('');
  };

  const handleRemovePickup = (dest: string, point: string) => {
    const updated = {
        ...locations,
        pickupPoints: {
            ...locations.pickupPoints,
            [dest]: locations.pickupPoints[dest].filter(p => p !== point)
        }
    };
    setLocations(updated);
    databaseService.saveLocations(updated);
  };

  const handleExport = () => {
    const data = databaseService.exportFullData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_pasajeros_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target?.result as string;
        const success = databaseService.importFullData(content);
        if (success) {
            setImportStatus('success');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            setImportStatus('error');
        }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-full overflow-hidden">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Configuraciones</h2>

      {/* Tema */}
      <section className="bg-gray-50 dark:bg-gray-700/30 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <h3 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
            Apariencia del Sistema
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
            <button 
                onClick={() => onThemeChange('light')}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                  theme === 'light' 
                  ? 'bg-white dark:bg-gray-600 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-100 shadow-md ring-2 ring-blue-500/10' 
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
                <SunIcon className="w-5 h-5 flex-shrink-0" />
                <span className="font-semibold text-sm">Modo Claro</span>
            </button>
            <button 
                onClick={() => onThemeChange('dark')}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                  theme === 'dark' 
                  ? 'bg-gray-800 dark:bg-blue-900/40 border-blue-400 dark:border-blue-500 text-blue-400 dark:text-blue-100 shadow-md ring-2 ring-blue-400/10' 
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
                <MoonIcon className="w-5 h-5 flex-shrink-0" />
                <span className="font-semibold text-sm">Modo Oscuro</span>
            </button>
        </div>
      </section>

      {/* Destinos */}
      <section className="bg-gray-50 dark:bg-gray-700/30 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-4">Gestionar Destinos</h3>
        <div className="flex gap-2 mb-6">
            <input 
                type="text" 
                value={newDest}
                onChange={(e) => setNewDest(e.target.value)}
                placeholder="Nuevo destino..."
                className="flex-1 min-w-0 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
            <button 
                onClick={handleAddDestination}
                title="Añadir destino"
                className="flex-shrink-0 w-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md flex items-center justify-center"
            >
                <PlusIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {locations.destinations.map(dest => (
                <div key={dest} className="flex justify-between items-center bg-white dark:bg-gray-800 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm min-w-0">
                    <span className="text-sm font-medium truncate flex-1 mr-2">{dest}</span>
                    <button 
                        onClick={() => handleRemoveDestination(dest)} 
                        className="flex-shrink-0 text-red-400 hover:text-red-600 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            ))}
        </div>
      </section>

      {/* Puntos de Recogida */}
      <section className="bg-gray-50 dark:bg-gray-700/30 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Puntos de Recogida por Ruta</h3>
        <p className="text-xs text-gray-400 mb-4">Personaliza las paradas disponibles para cada ruta configurada.</p>
        
        <div className="mb-4">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Seleccionar Ruta:</label>
            <select 
                value={selectedDestForPickup}
                onChange={(e) => setSelectedDestForPickup(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            >
                {locations.destinations.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
        </div>

        <div className="flex gap-2 mb-6">
            <input 
                type="text" 
                value={newPickup}
                onChange={(e) => setNewPickup(e.target.value)}
                placeholder="Nombre del punto..."
                className="flex-1 min-w-0 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
            <button 
                onClick={handleAddPickup}
                disabled={!selectedDestForPickup}
                title="Añadir punto de parada"
                className="flex-shrink-0 w-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <PlusIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {selectedDestForPickup && (locations.pickupPoints[selectedDestForPickup] || []).length > 0 ? (
                locations.pickupPoints[selectedDestForPickup].map(point => (
                    <div key={point} className="flex justify-between items-center bg-white dark:bg-gray-800 pl-3 pr-1 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm min-w-0">
                        <span className="text-xs font-medium truncate flex-1 mr-1">{point}</span>
                        <button 
                            onClick={() => handleRemovePickup(selectedDestForPickup, point)} 
                            className="flex-shrink-0 text-gray-400 hover:text-red-500 p-1 transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))
            ) : (
                <div className="col-span-full py-4 text-center text-gray-400 text-xs italic">
                    No hay puntos configurados para esta ruta.
                </div>
            )}
        </div>
      </section>

      {/* Backup */}
      <section className="bg-gray-50 dark:bg-gray-700/30 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-4">Mantenimiento de Datos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-md font-semibold text-sm"
            >
                <ArrowDownTrayIcon className="w-5 h-5 flex-shrink-0" />
                Exportar JSON
            </button>
            <div className="relative">
                <input 
                    type="file" 
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    id="import-file"
                />
                <label 
                    htmlFor="import-file"
                    className="flex items-center justify-center gap-2 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer active:scale-95 transition-all shadow-md font-semibold text-sm"
                >
                    <PlusIcon className="w-5 h-5 flex-shrink-0" />
                    Importar JSON
                </label>
            </div>
        </div>
        {importStatus === 'success' && <p className="mt-3 text-green-500 text-xs sm:text-sm text-center font-bold animate-pulse">✓ ¡Importación exitosa! Reiniciando aplicación...</p>}
        {importStatus === 'error' && <p className="mt-3 text-red-500 text-xs sm:text-sm text-center font-bold">✗ Error: El archivo no es un backup válido.</p>}
      </section>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
      `}</style>
    </div>
  );
};