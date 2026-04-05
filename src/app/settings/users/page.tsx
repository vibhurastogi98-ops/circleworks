"use client";

import React, { useState } from "react";
import { Plus, MoreVertical, Shield, ShieldAlert, ShieldCheck, Mail, Trash2 } from "lucide-react";
import { mockUsers } from "@/data/mockSettings";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "sonner";

export default function UsersSettingsPage() {
  const { isNewUser } = useDashboardData();
  const [users, setUsers] = useState(isNewUser ? mockUsers.slice(0, 1) : mockUsers);
  const [showModal, setShowModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Super Admin");
  const [editUser, setEditUser] = useState<any>(null);

  const handleUpdateRole = () => {
    if (!editUser) return;
    setUsers(users.map(u => u.id === editUser.id ? editUser : u));
    setEditUser(null);
    toast.success(`Role for ${editUser.name} updated to ${editUser.role}.`);
  };

  const handleInvite = () => {
    if (!inviteEmail) return;
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: inviteEmail.split("@")[0].charAt(0).toUpperCase() + inviteEmail.split("@")[0].slice(1),
      email: inviteEmail,
      role: inviteRole,
      mfaState: "Pending" as const,
      lastLogin: new Date().toISOString(),
      status: "Invited" as const
    };
    setUsers([...users, newUser]);
    setShowModal(false);
    setInviteEmail("");
    toast.success(`Invite sent to ${inviteEmail}`, {
      description: "The user will receive an email to set up their account."
    });
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast.info("User access revoked successfully.");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage administrative access. {users.length} of 10 admin seats used.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Invite Admin
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Admin</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">MFA Status</th>
                <th className="px-6 py-3">Last Login</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{user.role}</td>
                  <td className="px-6 py-4">
                    {user.mfaState === "Enabled" ? (
                      <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-bold">
                        <ShieldCheck size={14} /> Enabled
                      </span>
                    ) : user.mfaState === "Pending" ? (
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
                        <Shield size={14} /> Pending Setup
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-bold">
                        <ShieldAlert size={14} /> Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${user.status === "Active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <button 
                        onClick={() => setEditUser({...user})}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Edit Role"
                      >
                        <Shield size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors"
                        title="Revoke access"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invite Admin</h3>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com" 
                    type="email" 
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Role</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                >
                  <option>Super Admin</option>
                  <option>HR Manager</option>
                  <option>Payroll Admin</option>
                  <option>Operations</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
              <button 
                onClick={handleInvite}
                disabled={!inviteEmail}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-sm"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditUser(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Adjust Permissions: {editUser.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{editUser.email}</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Assign New Role</label>
                <select 
                  value={editUser.role}
                  onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                >
                  <option>Super Admin</option>
                  <option>HR Manager</option>
                  <option>Payroll Admin</option>
                  <option>Operations</option>
                </select>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  Changing a user's role will immediately update their access levels across the platform. Some changes may require the user to re-authenticate.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setEditUser(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
              <button 
                onClick={handleUpdateRole}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm"
              >
                Update Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
