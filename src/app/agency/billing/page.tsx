"use client";

import React, { useState } from 'react';
import { 
  Receipt, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  MoreHorizontal,
  Mail,
  CreditCard,
  TrendingUp,
  FileText,
  History,
  ArrowUpRight,
  Plus,
  Building2,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronRight,
  ChevronDown
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  mockAgencyInvoices, 
  mockAgencyInvoiceItems,
  mockAgencyClients 
} from '@/data/mockAgencyBilling';
import { useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const billingVolumeData = [
  { month: 'Jan', revenue: 45000, margin: 6750 },
  { month: 'Feb', revenue: 52000, margin: 7800 },
  { month: 'Mar', revenue: 48000, margin: 7200 },
  { month: 'Apr', revenue: 61000, margin: 9150 },
  { month: 'May', revenue: 55000, margin: 8250 },
  { month: 'Jun', revenue: 67000, margin: 10050 },
];

export default function AgencyBillingDashboard() {
  const [invoices, setInvoices] = useState(mockAgencyInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    // Prevent hydration mismatch by generating data on client
    setRevenueData(mockAgencyClients.map(c => ({ 
      name: c.name, 
      revenue: Math.floor(Math.random() * 50000 + 20000) 
    })));
  }, []);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Paid</Badge>;
      case 'Sent':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Sent</Badge>;
      case 'Approved':
        return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none">Approved</Badge>;
      case 'Draft':
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 underline decoration-indigo-500 underline-offset-8">Client Invoicing</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage agency billings, track receivables, and analyze client revenue.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export ROI
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4 mr-2" /> Create Custom Invoice
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-indigo-500 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Outstanding</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(2850000)}</p>
                <div className="flex items-center mt-2 text-xs text-emerald-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+12.5% from last month</span>
                </div>
              </div>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Collected (MTD)</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(4125000)}</p>
                <div className="flex items-center mt-2 text-xs text-emerald-600">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  <span>Target: 95%</span>
                </div>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Overdue Invoices</p>
                <p className="text-2xl font-bold mt-1">12</p>
                <div className="flex items-center mt-2 text-xs text-amber-600">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span>Avg. 8 days late</span>
                </div>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Drafts (Auto-Gen)</p>
                <p className="text-2xl font-bold mt-1">8</p>
                <div className="flex items-center mt-2 text-xs text-blue-600">
                  <History className="w-3 h-3 mr-1" />
                  <span>From latest payroll run</span>
                </div>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1">
          <TabsTrigger value="invoices">Invoice Management</TabsTrigger>
          <TabsTrigger value="reports">Billing Reports</TabsTrigger>
          <TabsTrigger value="sync">Accounting Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input placeholder="Search invoices..." className="pl-9" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-sm">Last 30 Days</Button>
              <Button variant="ghost" className="text-sm">All Statuses</Button>
            </div>
          </div>

          <Card className="shadow-none border-slate-200 dark:border-slate-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50/50">
                  <TableHead>Client</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="cursor-pointer hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-slate-50">{invoice.clientName}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{invoice.invoiceNumber}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-bold">{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                            <Eye className="w-4 h-4 mr-2" /> Preview PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit3 className="w-4 h-4 mr-2" /> Edit Line Items
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-blue-600">
                            <Send className="w-4 h-4 mr-2" /> Send via Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Download className="w-4 h-4 mr-2" /> Download CSV
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Billing Volume</CardTitle>
                <CardDescription>Revenue vs Gross Margin trajectory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={billingVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Client</CardTitle>
                <CardDescription>Top contributors this quarter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Accounts Receivable Aging</CardTitle>
              <CardDescription>Unpaid invoices grouped by days outstanding</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center py-8 px-4">
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-1">Current</p>
                  <p className="text-2xl font-bold">{formatCurrency(1250000)}</p>
                  <Badge variant="outline" className="mt-2">6 Invoices</Badge>
                </div>
                <div className="w-px h-16 bg-slate-200"></div>
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-1">1-30 Days</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(850000)}</p>
                  <Badge variant="outline" className="mt-2 text-blue-600 border-blue-200">4 Invoices</Badge>
                </div>
                <div className="w-px h-16 bg-slate-200"></div>
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-1">31-60 Days</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(450000)}</p>
                  <Badge variant="outline" className="mt-2 text-amber-600 border-amber-200">2 Invoices</Badge>
                </div>
                <div className="w-px h-16 bg-slate-200"></div>
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-1">61+ Days</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(300000)}</p>
                  <Badge variant="outline" className="mt-2 text-red-600 border-red-200">1 Invoice</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sync">
          <Card className="max-w-3xl mx-auto shadow-sm">
            <CardHeader>
              <CardTitle>Accounting Integration Status</CardTitle>
              <CardDescription>Automatic syncing of invoices and payments to your ledger.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50 dark:bg-slate-900 border-indigo-200 dark:border-indigo-900">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/QuickBooks_Logo.svg/1200px-QuickBooks_Logo.svg.png" className="h-6" alt="QuickBooks" />
                  </div>
                  <div>
                    <h4 className="font-semibold">QuickBooks Online</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Connected to "CircleWorks Agency"
                    </p>
                  </div>
                </div>
                <Button variant="outline">Settings</Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Sync Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <p className="font-medium text-sm">Auto-Sync on Send</p>
                    <p className="text-xs text-slate-500 mt-1">Automatically push invoices to QBO when sent to client.</p>
                  </div>
                  <div className="p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border-indigo-200 bg-indigo-50/50">
                    <p className="font-medium text-sm">Payment Reconciliation</p>
                    <p className="text-xs text-slate-500 mt-1">Mark invoices as paid once transaction clears in QBO.</p>
                  </div>
                  <div className="p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <p className="font-medium text-sm">Class Tracking</p>
                    <p className="text-xs text-slate-500 mt-1">Map agency clients to QBO Classes for profit reporting.</p>
                  </div>
                  <div className="p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <p className="font-medium text-sm">Draft Review</p>
                    <p className="text-xs text-slate-500 mt-1">Hold auto-generated invoices in Draft until manual approval.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-sm">Automated Client Reminders</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-emerald-50/50 border-emerald-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium">7 Days Before Due</span>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-emerald-50/50 border-emerald-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium">On Due Date</span>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-amber-50/50 border-amber-100">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium">3 Days Overdue (Final Notice)</span>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">Enabled</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Preview Modal */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">CircleWorks Agency</h2>
                    <p className="text-slate-500">123 Market St, San Francisco, CA 94105</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <h1 className="text-4xl font-black text-slate-200 uppercase tracking-tighter">Invoice</h1>
                  <p className="font-mono text-sm">#{selectedInvoice.invoiceNumber}</p>
                  <p className="text-sm text-slate-500">Issued: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-100">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bill To:</h4>
                  <p className="font-bold text-lg">{selectedInvoice.clientName}</p>
                  <p className="text-slate-500">Finance Department</p>
                  <p className="text-slate-500">billing@{selectedInvoice.clientName.toLowerCase().replace(/\s+/g, '')}.com</p>
                </div>
                <div className="space-y-2 text-right">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Terms:</h4>
                  <p className="font-medium">Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                  <p className="text-indigo-600 font-semibold">Status: {selectedInvoice.status}</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[400px]">Description</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Markup</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAgencyInvoiceItems.filter(item => item.invoiceId === selectedInvoice.id || selectedInvoice.id === 1).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.description}</div>
                        {item.employeeName && <div className="text-xs text-slate-500">Staff: {item.employeeName}</div>}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.cost)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.markup)}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col items-end space-y-2 pt-6 border-t font-semibold">
                <div className="flex w-[300px] justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedInvoice.amount * 0.85)}</span>
                </div>
                <div className="flex w-[300px] justify-between text-indigo-600">
                  <span>Markup (15%)</span>
                  <span>{formatCurrency(selectedInvoice.amount * 0.15)}</span>
                </div>
                <div className="flex w-[300px] justify-between text-2xl font-black mt-4 pt-4 border-t border-slate-900 leading-none">
                  <span>Total Due</span>
                  <span>{formatCurrency(selectedInvoice.amount)}</span>
                </div>
              </div>
            </div>
            <DialogFooter className="bg-slate-50 p-4 rounded-b-lg border-t gap-2">
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
              <Button className="bg-indigo-600">
                <Send className="w-4 h-4 mr-2" /> Send to Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
