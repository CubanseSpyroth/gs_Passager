
import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService.ts';
import type { NewPassengerLog, AppLocations } from '../types.ts';

export const RegisterScreen: React.FC = () => {
  const [locations, setLocations] = useState<AppLocations>(databaseService.getLocations());
  const [formData, setFormData] = useState<NewPassengerLog>({
    date: new Date().toISOString().split('T')[0],
    name: '',
    phone: '',
    amount: 0,
    pickupLocation: '',
    destination: '',
    paid: false,
    traveled: false,
    idCardNumber: '',
  });

  useEffect(() => {
    // Initialize default destination from dynamic list
    if (locations.destinations.length > 0 && !formData.destination) {
        setFormData(prev => ({ ...prev, destination: locations.destinations[0] }));
    }
  }, [locations]);

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue: any = value;
    if (name === 'amount') finalValue = parseFloat(value) || 0;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || formData.amount <= 0 || !formData.destination) {
      setError('Por favor, complete los campos obligatorios.');
      return;
    }

    try {
      databaseService.addPassenger(formData);
      setSuccess('¡Guardado exitosamente!');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        name: '',
        phone: '',
        amount: 0,
        pickupLocation: '',
        destination: locations.destinations[0] || '',
        paid: false,
        traveled: false,
        idCardNumber: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al guardar.');
    }
  };

  const currentPickupOptions = formData.destination ? (locations.pickupPoints[formData.destination] || []) : [];

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Nuevo Registro</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">{error}</div>}
        {success && <div className="p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-md">{success}</div>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nombre completo" required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">Destino</label>
            <select name="destination" value={formData.destination} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                {locations.destinations.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">Importe (CUP)</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} required min="0" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">Carnet ID (Opcional)</label>
            <input type="number" name="idCardNumber" value={formData.idCardNumber || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">Teléfono (Opcional)</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
            </div>

            <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Lugar de Recogida</label>
            <input type="text" name="pickupLocation" list="pickup-options" value={formData.pickupLocation} onChange={handleChange} placeholder="Escriba o seleccione de la lista" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
            <datalist id="pickup-options">
                {currentPickupOptions.map(o => <option key={o} value={o} />)}
            </datalist>
            </div>
        </div>

        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-bold shadow-lg">
            Guardar Registro
        </button>
      </form>
    </div>
  );
};