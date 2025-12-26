import React, { useState } from 'react';
import { databaseService } from '../services/databaseService.ts';
import type { ActiveFilters } from '../types.ts';
import { XCircleIcon } from './icons.tsx';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: ActiveFilters;
  onFilterChange: (filterName: keyof ActiveFilters, value: string) => void;
  clearFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  filters,
  onFilterChange,
  clearFilters,
}) => {
  const locations = databaseService.getLocations();

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-inner">
      <div className="relative">
        <input
          type="text"
          placeholder="Búsqueda rápida..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-3 flex items-center text-gray-400">
              <XCircleIcon className="w-5 h-5" />
            </button>
        )}
      </div>

      <details className="group">
        <summary className="cursor-pointer list-none flex justify-between items-center text-sm font-bold text-gray-500 uppercase tracking-wider">
          <span>Filtros Detallados</span>
          <span className="group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">Nombre</label>
            <input type="text" value={filters.name} onChange={(e) => onFilterChange('name', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm" />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Fecha</label>
            <input type="date" value={filters.date} onChange={(e) => onFilterChange('date', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm" />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Destino</label>
            <select value={filters.destination} onChange={(e) => onFilterChange('destination', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm">
              <option value="">Cualquier Destino</option>
              {locations.destinations.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Estado Pago</label>
            <select value={filters.paidStatus} onChange={(e) => onFilterChange('paidStatus', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm">
              <option value="all">Todos</option>
              <option value="paid">Pagados</option>
              <option value="unpaid">Pendientes</option>
            </select>
          </div>
        </div>
      </details>
      
      <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-600 mt-2">
        <button onClick={clearFilters} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
          RESETEAR TODOS LOS FILTROS
        </button>
      </div>
    </div>
  );
};