"use client";

import React, { useState } from 'react';
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
  Briefcase
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

export default function AgencyClientsSettings() {
  const [clients, setClients] = useState(mockAgencyClients);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Agency Clients Billing</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure billing rates, markups, and payment terms for your staffing clients.
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> Add New Client
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <Input 
          placeholder="Search clients..." 
          className="border-0 focus-visible:ring-0 bg-transparent"
        />
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
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
            {clients.map((client) => (
              <TableRow key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <img src={client.logoUrl} alt={client.name} className="w-8 h-8 rounded-md" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-50">{client.name}</div>
                      <div className="text-xs text-slate-500">{client.contactName}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize bg-slate-50 dark:bg-slate-900">
                    {client.billingRateType.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {client.billingRateType === 'cost-plus' ? (
                    <div className="flex items-center text-emerald-600 font-medium">
                      <Percent className="w-4 h-4 mr-1" /> {client.markupPercentage}% Markup
                    </div>
                  ) : client.billingRateType === 'hourly' ? (
                    <div className="flex items-center text-blue-600 font-medium">
                      <Clock className="w-4 h-4 mr-1" /> {formatCurrency(client.hourlyRate || 0)}/hr
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600 font-medium">
                      <Briefcase className="w-4 h-4 mr-1" /> {formatCurrency(client.fixedFee || 0)} Fixed
                    </div>
                  )}
                </TableCell>
                <TableCell className="capitalize">{client.billingCycle}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {client.paymentTerms}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {client.accountingSync === 'QuickBooks' && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">QuickBooks</Badge>
                    )}
                    {client.accountingSync === 'Xero' && (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Xero</Badge>
                    )}
                    {client.accountingSync === 'None' && (
                      <span className="text-slate-400 text-sm italic">Manual</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer">
                        <Edit2 className="w-4 h-4 mr-2" /> Edit Configuration
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <ExternalLink className="w-4 h-4 mr-2" /> Employee Allocations
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" /> Remove Client
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add/Edit Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedClient ? 'Edit Client Billing' : 'Setup Client Billing'}</DialogTitle>
            <DialogDescription>
              Define how this client will be invoiced for their staffed employees and project costs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Name</label>
                <Input placeholder="e.g. Acme Corp" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Billing Email</label>
                <Input type="email" placeholder="billing@client.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Billing Rating Type</label>
                <Select defaultValue="cost-plus">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cost-plus">Cost-Plus Markup %</SelectItem>
                    <SelectItem value="fixed">Fixed Monthly Fee</SelectItem>
                    <SelectItem value="hourly">Hourly Rate (Blended)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Markup Percentage (%)</label>
                <div className="relative">
                  <Input type="number" defaultValue="15" className="pr-8" />
                  <Percent className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Billing Cycle</label>
                <Select defaultValue="monthly">
                  <SelectTrigger>
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Terms</label>
                <Select defaultValue="Net 30">
                  <SelectTrigger>
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Due Upon Receipt">Due Upon Receipt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold text-sm">Accounting Integration</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-lg p-3 flex items-center justify-between cursor-pointer border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30">
                <span className="text-sm font-medium">QuickBooks</span>
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900">
                <span className="text-sm font-medium">Xero</span>
              </div>
              <div className="border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900">
                <span className="text-sm font-medium">Sage Intacct</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsAddDialogOpen(false)} className="bg-indigo-600 hover:bg-indigo-700">Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
