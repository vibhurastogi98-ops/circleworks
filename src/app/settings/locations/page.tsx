"use client";

import React, { useState } from "react";
import { Plus, Edit3, MapPin, Users, X, Map, Globe, Trash2 } from "lucide-react";
import { mockLocations } from "@/data/mockSettings";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "sonner";

export default function LocationsSettingsPage() {
  const { isNewUser } = useDashboardData();
  const [locations, setLocations] = useState(mockLocations);
  const [showModal, setShowModal] = useState(false);
  const [editingLoc, setEditingLoc] = useState<any>(null);

  // New Location Form State
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newTz, setNewTz] = useState("America/New_York (EST)");

  const handleEdit = (loc: any) => {
    setEditingLoc(loc);
    setNewName(loc.name);
    // Split address back into street and city if possible
    const [street, city] = loc.address.split(", ");
    setNewAddress(street || loc.address);
    setNewCity(city || "");
    setNewState(loc.state);
    setNewTz(loc.timezone);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!newName || !newAddress) return;

    if (editingLoc) {
       // Update logic
       setLocations((prev) => prev.map(l => 
         l.id === editingLoc.id 
           ? { ...l, name: newName, address: `${newAddress}, ${newCity}`, state: newState, timezone: newTz } 
           : l
       ));
       toast.success(`Location "${newName}" updated.`);
    } else {
       // Create logic
       const newLoc = {
         id: Math.random().toString(36).substr(2, 9),
         name: newName,
         address: `${newAddress}, ${newCity}`,
         state: newState,
         timezone: newTz,
         employeeCount: 0
       };
       setLocations([...locations, newLoc]);
       toast.success(`Location "${newName}" added.`);
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string, name: string) => {
    setLocations(prev => prev.filter(l => l.id !== id));
    toast.info(`Location "${name}" removed.`);
  };

  const resetForm = () => {
    setEditingLoc(null);
    setNewName("");
    setNewAddress("");
    setNewCity("");
    setNewState("");
  };

  const displayLocations = isNewUser
    ? locations.map(l => ({ ...l, employeeCount: 0 }))
    : locations;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Locations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage office locations and default timezones.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Add Location
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Location Name</th>
                <th className="px-6 py-3">Address</th>
                <th className="px-6 py-3">State</th>
                <th className="px-6 py-3">Timezone</th>
                <th className="px-6 py-3 text-right">Employees</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayLocations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" /> {loc.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{loc.address}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{loc.state}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{loc.timezone}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 font-medium text-slate-900 dark:text-white">
                      <Users size={14} className="text-slate-400" />
                      {loc.employeeCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleEdit(loc)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(loc.id, loc.name)}
                      className="p-1.5 ml-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingLoc ? "Edit Location" : "Add Location"}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block font-mono">Location Name</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Chicago Hub" 
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block font-mono">Address</label>
                <input 
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="123 Main St" 
                  className="w-full px-3 py-2 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="City" 
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                  />
                  <input 
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    placeholder="State (e.g. IL)" 
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-mono" 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block font-mono">Timezone</label>
                <select 
                  value={newTz}
                  onChange={(e) => setNewTz(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white appearance-none"
                >
                  <option>America/New_York (EST)</option>
                  <option>America/Chicago (CST)</option>
                  <option>America/Denver (MST)</option>
                  <option>America/Los_Angeles (PST)</option>
                </select>
              </div>
              <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center mt-2 overflow-hidden opacity-60">
                <Map className="text-slate-400 mb-1" size={20} />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Mapbox Preview Placeholder</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
              <button 
                onClick={handleSave}
                disabled={!newName || !newAddress}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-sm"
              >
                {editingLoc ? "Update" : "Save Location"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
