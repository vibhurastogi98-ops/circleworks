"use client";

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Settings2, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Save,
  X,
  CheckCircle2,
  DollarSign,
  Percent,
  Clock,
  Briefcase,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockAgencyClients } from '@/data/mockAgencyBilling';
import { toast } from 'sonner';

export default function AgencyClientsSetupPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // New Client Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactName: "",
    billingRateType: "cost-plus",
    markupPercentage: 15,
    fixedFee: 0,
    hourlyRate: 0,
    billingCycle: "monthly",
    paymentTerms: "Net 30",
    accountingSync: "None"
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/agency/clients");
      const data = await res.json();
      if (data.success && data.clients?.length > 0) {
        setClients(data.clients);
      } else {
        setClients(mockAgencyClients);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      setClients(mockAgencyClients);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!confirm("Are you sure you want to remove this client? This will delete all associated data.")) return;

    try {
      const res = await fetch(`/api/agency/clients/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Client removed successfully");
        fetchClients();
      } else {
        toast.error(data.error || "Failed to remove client");
      }
    } catch (error) {
      toast.error("Error removing client");
    }
  };

  const handleEditClick = (client: any) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email || "",
      contactName: client.contactName || "",
      billingRateType: client.billingRateType,
      markupPercentage: client.markupPercentage || 15,
      fixedFee: client.fixedFee || 0,
      hourlyRate: client.hourlyRate || 0,
      billingCycle: client.billingCycle,
      paymentTerms: client.paymentTerms,
      accountingSync: client.accountingSync || "None"
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveClient = async () => {
    if (!formData.name) {
      toast.error("Client Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = selectedClient 
        ? `/api/agency/clients/${selectedClient.id}`
        : "/api/agency/clients";
      
      const method = selectedClient ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          companyId: 1 // Default for now
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(selectedClient ? "Client updated successfully" : "Client configuration saved successfully");
        setIsAddDialogOpen(false);
        fetchClients();
        resetForm();
      } else {
        toast.error(data.error || "Failed to save client");
      }
    } catch (error) {
      toast.error("Error saving client configuration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedClient(null);
    setFormData({
      name: "",
      email: "",
      contactName: "",
      billingRateType: "cost-plus",
      markupPercentage: 15,
      fixedFee: 0,
      hourlyRate: 0,
      billingCycle: "monthly",
      paymentTerms: "Net 30",
      accountingSync: "None"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Client Configuration</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Configure billing rates, markups, and payment terms for your staffing clients.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-200">
          <Plus className="w-4 h-4 mr-2" /> Add New Client
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-sm">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <Input 
          placeholder="Search clients..." 
          className="border-0 focus-visible:ring-0 bg-transparent h-9 text-sm"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="mt-4 text-sm text-slate-500 font-medium">Loading client configurations...</p>
        </div>
      ) : (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-100/80 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800">
              <TableRow className="hover:bg-transparent">
                <TableHead>Client</TableHead>
                <TableHead>Billing Type</TableHead>
                <TableHead>Markup / Rate</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Terms</TableHead>
                <TableHead>Accounting</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client, idx) => (
                <TableRow key={client.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/30 dark:bg-slate-900/20'} hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800 shadow-sm">
                        {client.logoUrl ? (
                          <img src={client.logoUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5 text-indigo-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{client.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{client.contactName || "No contact set"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-[11px] bg-white dark:bg-slate-950 font-bold border-slate-200 dark:border-slate-700">
                      {client.billingRateType?.replace('-', ' ') || 'Fixed'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {client.billingRateType === 'cost-plus' ? (
                      <div className="flex items-center text-emerald-600 font-bold text-sm">
                        <Percent className="w-3.5 h-3.5 mr-1" /> {client.markupPercentage}% Markup
                      </div>
                    ) : client.billingRateType === 'hourly' ? (
                      <div className="flex items-center text-blue-600 font-bold text-sm">
                        <Clock className="w-3.5 h-3.5 mr-1" /> {formatCurrency(client.hourlyRate || 0)}/hr
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-600 font-bold text-sm">
                        <Briefcase className="w-3.5 h-3.5 mr-1" /> {formatCurrency(client.fixedFee || 0)} Fixed
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="capitalize text-sm font-semibold text-slate-700 dark:text-slate-300">{client.billingCycle}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-black text-[10px] uppercase tracking-wider bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {client.paymentTerms}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {client.accountingSync === 'QuickBooks' && (
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px] font-black uppercase tracking-tighter shadow-sm">QBO</Badge>
                      )}
                      {client.accountingSync === 'Xero' && (
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 text-[10px] font-black uppercase tracking-tighter shadow-sm">Xero</Badge>
                      )}
                      {(client.accountingSync === 'None' || !client.accountingSync) && (
                        <span className="text-slate-400 text-[11px] italic font-medium">Manual Sync</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl">
                        <DropdownMenuItem className="cursor-pointer font-semibold py-2.5" onClick={() => handleEditClick(client)}>
                          <Edit2 className="w-4 h-4 mr-2.5 text-blue-500" /> Edit Configuration
                        </DropdownMenuItem>
                         <DropdownMenuItem className="cursor-pointer font-semibold py-2.5">
                          <Settings2 className="w-4 h-4 mr-2.5 text-indigo-500" /> Manage Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer font-semibold py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2.5" /> Remove Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 bg-slate-50/20">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-bold">No clients found matching your search</p>
                      <p className="text-xs text-slate-400 mt-1">Try a different keyword or add a new client.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsAddDialogOpen(open); }}>
        <DialogContent className="sm:max-w-[700px] border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden">
          <div className="p-10 bg-slate-50/50 dark:bg-slate-900/50 border-b relative">
            <DialogHeader className="text-center pt-4">
              <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">Setup Client Billing</DialogTitle>
              <DialogDescription className="text-slate-500 font-bold text-sm">
                Define the primary invoicing rules and accounting integration for this client.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Client Legal Name</label>
                  <Input 
                    placeholder="e.g. Acme Corporation LLC" 
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-11 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Billing Contact Email</label>
                  <Input 
                    type="email" 
                    placeholder="finance@acme.com" 
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-11 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Finance Manager Name</label>
                  <Input 
                    placeholder="e.g. Jane Smith" 
                    value={formData.contactName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, contactName: e.target.value})}
                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-11 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Invoicing Model</label>
                  <Select 
                    value={formData.billingRateType}
                    onValueChange={(val: string) => setFormData({...formData, billingRateType: val})}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-11 font-bold">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cost-plus">Cost-Plus Markup (Standard)</SelectItem>
                      <SelectItem value="fixed">Fixed Monthly Retainer</SelectItem>
                      <SelectItem value="hourly">Blended Hourly Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-5">
                {formData.billingRateType === 'cost-plus' ? (
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Markup Percentage (%)</label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={formData.markupPercentage} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, markupPercentage: Number(e.target.value)})}
                        className="pr-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-11 font-bold" 
                      />
                      <Percent className="w-4 h-4 absolute right-3 top-3.5 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Applied to gross labor costs & taxes.</p>
                  </div>
                ) : formData.billingRateType === 'hourly' ? (
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Blended Rate per Hour ($)</label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={formData.hourlyRate / 100} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, hourlyRate: Math.round(Number(e.target.value) * 100)})}
                        className="pr-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-11 font-bold" 
                      />
                      <DollarSign className="w-4 h-4 absolute right-3 top-3.5 text-slate-400" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Monthly Project Fee ($)</label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={formData.fixedFee / 100} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, fixedFee: Math.round(Number(e.target.value) * 100)})}
                        className="pr-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-11 font-bold" 
                      />
                      <DollarSign className="w-4 h-4 absolute right-3 top-3.5 text-slate-400" />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Invoicing Cycle</label>
                  <Select 
                    value={formData.billingCycle}
                    onValueChange={(val: string) => setFormData({...formData, billingCycle: val})}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-11 font-bold">
                      <SelectValue placeholder="Select cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Every Week</SelectItem>
                      <SelectItem value="bi-weekly">Every Two Weeks</SelectItem>
                      <SelectItem value="monthly">Monthly Full Cycle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Payment Due Terms</label>
                  <Select 
                    value={formData.paymentTerms}
                    onValueChange={(val: string) => setFormData({...formData, paymentTerms: val})}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-11 font-bold">
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 15">Net 15 Days</SelectItem>
                      <SelectItem value="Net 30">Net 30 Days</SelectItem>
                      <SelectItem value="Net 45">Net 45 Days</SelectItem>
                      <SelectItem value="Due Upon Receipt">Due Immediately</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-4 block">Accounting ERP Integration</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "QuickBooks", color: "emerald" },
                  { id: "Xero", color: "blue" },
                  { id: "Sage", color: "indigo" }
                ].map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setFormData({...formData, accountingSync: item.id})}
                    className={`border-2 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300 transform group active:scale-95 ${
                      formData.accountingSync === item.id 
                        ? `border-${item.color}-500 bg-${item.color}-50 dark:bg-${item.color}-500/10` 
                        : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950"
                    }`}
                  >
                    <span className={`font-black text-sm ${formData.accountingSync === item.id ? `text-${item.color}-700 dark:text-${item.color}-400` : "text-slate-500"}`}>{item.id}</span>
                    {formData.accountingSync === item.id && <CheckCircle2 className={`w-5 h-5 text-${item.color}-600`} />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 rounded-b-lg">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl font-bold h-11 px-8 hover:bg-white transition-all">Cancel</Button>
            <Button 
              onClick={handleSaveClient} 
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 min-w-[160px] rounded-xl font-bold h-11 shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                selectedClient ? 'Update Configuration' : 'Complete Setup'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
