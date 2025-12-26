import React from 'react';
import type { PassengerLog } from '../types.ts';
import { CalendarIcon, UserIcon, MapPinIcon, CurrencyDollarIcon, PhoneIcon, PencilIcon, CheckCircleIcon, XCircleIcon, TrashIcon, RouteIcon, IdentificationIcon } from './icons.tsx';

interface PassengerListProps {
  logs: PassengerLog[];
  onEdit: (log: PassengerLog) => void;
  onTogglePaid: (log: PassengerLog) => void;
  onToggleTraveled: (log: PassengerLog) => void;
  onDelete: (log: PassengerLog) => void;
}

const PassengerLogItem: React.FC<{ log: PassengerLog; onEdit: (log: PassengerLog) => void; onTogglePaid: (log: PassengerLog) => void; onToggleTraveled: (log: PassengerLog) => void; onDelete: (log: PassengerLog) => void; }> = ({ log, onEdit, onTogglePaid, onToggleTraveled, onDelete }) => {
    const formattedDate = new Date(log.date + 'T00:00:00').toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    
    return (
        <div className={`bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border-l-4 ${log.paid ? 'border-green-500' : 'border-red-500'} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}>
            {/* Cabecera con Nombre y Acciones Rápidas */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2 min-w-0 w-full sm:w-auto">
                    <UserIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate" title={log.name}>{log.name}</span>
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200 dark:border-gray-600">
                    <span className="text-xs sm:text-sm font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        {log.amount.toFixed(2)} CUP
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onEdit(log)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            aria-label={`Editar registro de ${log.name}`}
                        >
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onDelete(log)}
                            className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            aria-label={`Eliminar registro de ${log.name}`}
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Detalles del Registro en Cuadrícula */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-center gap-2 min-w-0">
                    <CalendarIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{formattedDate}</span>
                </p>
                <p className="flex items-center gap-2 min-w-0">
                    <RouteIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate" title={log.destination}>{log.destination}</span>
                </p>
                {log.idCardNumber && (
                     <p className="flex items-center gap-2 min-w-0">
                        <IdentificationIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="truncate">CI: {log.idCardNumber}</span>
                    </p>
                )}
                {log.phone && (
                    <p className="flex items-center gap-2 min-w-0">
                        <PhoneIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="truncate">{log.phone}</span>
                    </p>
                )}
                {log.pickupLocation && (
                    <p className="flex items-center gap-2 min-w-0 col-span-full">
                        <MapPinIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="truncate" title={log.pickupLocation}>{log.pickupLocation}</span>
                    </p>
                )}
            </div>

            {/* Acciones de Estado */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 flex flex-wrap gap-2 justify-end">
                <button
                    onClick={() => onToggleTraveled(log)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        log.traveled
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                >
                    {log.traveled ? <CheckCircleIcon className="w-5 h-5 flex-shrink-0"/> : <div className="w-5 h-5 border-2 border-current rounded-full flex-shrink-0"></div>}
                    <span>{log.traveled ? 'Viajó' : 'No Viajó'}</span>
                </button>

                <button
                    onClick={() => onTogglePaid(log)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        log.paid 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                    }`}
                >
                    {log.paid ? <CheckCircleIcon className="w-5 h-5 flex-shrink-0"/> : <XCircleIcon className="w-5 h-5 flex-shrink-0"/>}
                    <span>{log.paid ? 'Pagado' : 'Pendiente'}</span>
                </button>
            </div>
        </div>
    );
};

export const PassengerList: React.FC<PassengerListProps> = ({ logs, onEdit, onTogglePaid, onToggleTraveled, onDelete }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No se encontraron registros</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Intente ajustar su búsqueda o agregue un nuevo registro de pasajero.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map(log => (
        <PassengerLogItem key={log.id} log={log} onEdit={onEdit} onTogglePaid={onTogglePaid} onToggleTraveled={onToggleTraveled} onDelete={onDelete} />
      ))}
    </div>
  );
};