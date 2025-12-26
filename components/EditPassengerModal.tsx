import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService.ts';
import type { PassengerLog, AppLocations } from '../types.ts';

interface EditPassengerModalProps {
  isOpen: boolean;
  log: PassengerLog;
  onClose: () => void;
  onSave: (updatedLog: PassengerLog) => void;
}

export const EditPassengerModal: React.FC<EditPassengerModalProps> = ({ isOpen, log, onClose, onSave }) => {
  const [locations] = useState<AppLocations>(databaseService.getLocations());
  const [formData, setFormData] = useState<PassengerLog>(log);

  useEffect(() => {
    setFormData(log);
  }, [log]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
        }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  const currentPickupOptions = formData.destination ? (locations.pickupPoints[formData.destination] || []) : [];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Editar Pasajero</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nombre</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fecha</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Destino</label>
                <select name="destination" value={formData.destination} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                    {locations.destinations.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Importe (CUP)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Carnet ID (Opcional)</label>
                <input type="number" name="idCardNumber" value={formData.idCardNumber || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Teléfono (Opcional)</label>
                <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Lugar de Recogida</label>
            <input type="text" name="pickupLocation" list="edit-pickup-options" value={formData.pickupLocation || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
            <datalist id="edit-pickup-options">
                {currentPickupOptions.map(o => <option key={o} value={o} />)}
            </datalist>
          </div>

          <div className="flex gap-4 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="paid" checked={formData.paid} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-green-600" />
                <span className="text-sm font-medium">Pagado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="traveled" checked={formData.traveled} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600" />
                <span className="text-sm font-medium">Viajó</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
};