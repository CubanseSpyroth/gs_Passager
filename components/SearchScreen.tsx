import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { databaseService } from '../services/databaseService.ts';
import type { PassengerLog, ActiveFilters } from '../types.ts';
import { FilterBar } from './FilterBar.tsx';
import { PassengerList } from './PassengerList.tsx';
import { EditPassengerModal } from './EditPassengerModal.tsx';
import { ArrowDownTrayIcon, ShareIcon, XMarkIcon, ClipboardIcon, PencilIcon } from './icons.tsx';

const initialFilters: ActiveFilters = {
  name: '',
  date: '',
  destination: '',
  paidStatus: 'all',
};

export const SearchScreen: React.FC = () => {
  const [allLogs, setAllLogs] = useState<PassengerLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ActiveFilters>(initialFilters);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<PassengerLog | null>(null);
  const [deletingLog, setDeletingLog] = useState<PassengerLog | null>(null);
  
  const fetchLogs = useCallback(() => {
    const logs = databaseService.getPassengers();
    setAllLogs(logs);
  }, []);

  useEffect(() => {
    fetchLogs();
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'passengerLogs') {
        fetchLogs();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      // Advanced Filters
      const nameMatch = filters.name ? log.name.toLowerCase().includes(filters.name.toLowerCase()) : true;
      const dateMatch = filters.date ? log.date === filters.date : true;
      const destinationMatch = filters.destination ? log.destination === filters.destination : true;
      
      const paidMatch = filters.paidStatus === 'all' 
        ? true 
        : filters.paidStatus === 'paid' ? log.paid : !log.paid;

      if (!nameMatch || !dateMatch || !destinationMatch || !paidMatch) {
          return false;
      }
      
      // Global Search
      const globalTerm = searchTerm.trim().toLowerCase();
      if (!globalTerm) {
          return true; // Passed all filters and no global search
      }

      return (
          log.name.toLowerCase().includes(globalTerm) ||
          log.date.includes(globalTerm) ||
          log.destination.toLowerCase().includes(globalTerm) ||
          (!!log.pickupLocation && log.pickupLocation.toLowerCase().includes(globalTerm)) ||
          log.amount.toString().includes(globalTerm) ||
          (log.phone && log.phone.toLowerCase().includes(globalTerm)) ||
          (log.idCardNumber && log.idCardNumber.includes(globalTerm))
      );
    });
  }, [allLogs, searchTerm, filters]);
  
  const clearFilters = () => {
    setSearchTerm('');
    setFilters(initialFilters);
  };

  const handleFilterChange = (filterName: keyof ActiveFilters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleOpenEditModal = (log: PassengerLog) => {
    setEditingLog(log);
  };

  const handleCloseEditModal = () => {
    setEditingLog(null);
  };

  const handleOpenDeleteModal = (log: PassengerLog) => {
    setDeletingLog(log);
  };

  const handleCloseDeleteModal = () => {
    setDeletingLog(null);
  };

  const handleConfirmDelete = () => {
    if (deletingLog) {
      databaseService.deletePassenger(deletingLog.id);
      fetchLogs();
      handleCloseDeleteModal();
    }
  };

  const handleSaveChanges = (updatedLog: PassengerLog) => {
    databaseService.updatePassenger(updatedLog);
    fetchLogs();
    handleCloseEditModal();
  };

  const handleTogglePaid = (logToUpdate: PassengerLog) => {
    const updatedLog = { ...logToUpdate, paid: !logToUpdate.paid };
    databaseService.updatePassenger(updatedLog);
    fetchLogs();
  };

  const handleToggleTraveled = (logToUpdate: PassengerLog) => {
    const updatedLog = { ...logToUpdate, traveled: !logToUpdate.traveled };
    databaseService.updatePassenger(updatedLog);
    fetchLogs();
  };

  const handleExportCSV = (logs: PassengerLog[]) => {
    if (logs.length === 0) {
      alert('No hay registros para exportar.');
      return;
    }

    const headers = ['ID', 'Fecha', 'Nombre', 'Carnet ID', 'Destino', 'Teléfono', 'Importe (CUP)', 'Lugar de Recogida', 'Pagado', 'Viajó'];
    
    const escapeCsvCell = (cellData: string | number | boolean | undefined) => {
        if (cellData === undefined || cellData === null) return '';
        const stringData = String(cellData);
        if (/[",\n]/.test(stringData)) {
            return `"${stringData.replace(/"/g, '""')}"`;
        }
        return stringData;
    };

    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.id,
        log.date,
        escapeCsvCell(log.name),
        escapeCsvCell(log.idCardNumber),
        escapeCsvCell(log.destination),
        escapeCsvCell(log.phone),
        log.amount,
        escapeCsvCell(log.pickupLocation),
        log.paid ? 'Si' : 'No',
        log.traveled ? 'Si' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `registros_pasajeros_${timestamp}.csv`);
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadTxtFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportDetailedTXT = (logs: PassengerLog[]) => {
    if (logs.length === 0) {
      alert('No hay registros para exportar.');
      return;
    }

    const logEntries = logs.map(log => {
        const parts = [
            `--------------------`,
            `👤 *Nombre:* ${log.name}`,
            `✅ *Pagado:* ${log.paid ? 'Sí' : 'No'}`,
            `🚌 *Viajó:* ${log.traveled ? 'Sí' : 'No'}`,
            `➡️ *Destino:* ${log.destination}`
        ];
        if (log.idCardNumber) {
            parts.push(`🆔 *Carnet:* ${log.idCardNumber}`);
        }
        if (log.phone) {
            parts.push(`📞 *Teléfono:* ${log.phone}`);
        }
        if (log.pickupLocation) {
            parts.push(`📍 *Lugar Recogida:* ${log.pickupLocation}`);
        }
        parts.push(
            `💵 *Importe:* ${log.amount.toFixed(2)} CUP`,
            `--------------------`
        );
        return parts.join('\n');
    }).join('\n');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadTxtFile(logEntries, `registros_pasajeros_detallado_${timestamp}.txt`);
    setIsExportModalOpen(false);
  };
  
  //----------------------------------------------------
  //* FORMATO DE EXPORTACION SIMPLE DE LOG DE CLEINTES *
  //----------------------------------------------------
  const formatNamesForChat = (logs: PassengerLog[]): string => {
    const names = logs.map(log => `👤 ${log.name} ${log.idCardNumber ? '💳 ' + log.idCardNumber + " - " : '- '}📍 ${log.pickupLocation} - ${log.paid ? 'Pagado' : 'No Pagado'} `).join('\n');
    return names;
  };

  const handleCopyToClipboard = async (logs: PassengerLog[]) => {
    if (logs.length === 0) {
      alert('No hay registros para copiar.');
      return;
    }
    const content = formatNamesForChat(logs);
    try {
        await navigator.clipboard.writeText(content);
        alert('¡Lista copiada al portapapeles con éxito!');
        setIsExportModalOpen(false);
    } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
        alert('Hubo un error al intentar copiar al portapapeles.');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Buscar Registros de Pasajeros</h2>
      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        onFilterChange={handleFilterChange}
        clearFilters={clearFilters}
      />

      <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={() => setIsExportModalOpen(true)}
          disabled={filteredLogs.length === 0}
          className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          aria-label={`Opciones de exportación para ${filteredLogs.length} registros`}
        >
          <ShareIcon className="w-5 h-5" />
          <span>Exportar...</span>
        </button>
        <button
          onClick={() => handleExportCSV(filteredLogs)}
          disabled={filteredLogs.length === 0}
          className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          aria-label={`Exportar ${filteredLogs.length} registros a CSV`}
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          <span>Exportar CSV ({filteredLogs.length})</span>
        </button>
      </div>
      
      <PassengerList 
        logs={filteredLogs} 
        onEdit={handleOpenEditModal} 
        onTogglePaid={handleTogglePaid} 
        onToggleTraveled={handleToggleTraveled}
        onDelete={handleOpenDeleteModal} 
      />

      {isExportModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsExportModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Exportar Registros</h3>
              <button onClick={() => setIsExportModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Seleccione una opción:</p>
            <div className="space-y-3">
              <button
                onClick={() => handleCopyToClipboard(filteredLogs)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ClipboardIcon className="w-5 h-5" />
                Copiar Lista al Portapapeles
              </button>
              <button
                onClick={() => handleExportDetailedTXT(filteredLogs)}
                className="w-full text-center px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Descargar archivo TXT Detallado
              </button>
            </div>
          </div>
        </div>
      )}

      {editingLog && (
        <EditPassengerModal
          isOpen={!!editingLog}
          log={editingLog}
          onClose={handleCloseEditModal}
          onSave={handleSaveChanges}
        />
      )}

      {deletingLog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={handleCloseDeleteModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirmar Eliminación</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              ¿Está seguro de que desea eliminar el registro de <strong className="font-medium">{deletingLog.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};