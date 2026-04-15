"use client"; 

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
import { formatDate } from "@/utils/formatDate";
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
  const [invoices, setInvoices] = useState<any[]>(mockAgencyInvoices);
  const [clients, setClients] = useState<any[]>(mockAgencyClients);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [invRes, clientRes] = await Promise.all([
          fetch("/api/agency/invoices"),
          fetch("/api/agency/clients")
        ]);
        
        const invData = await invRes.json();
        const clientData = await clientRes.json();

        if (invData.success && invData.invoices?.length > 0) {
          setInvoices(invData.invoices);
        }
        
        let currentClients = mockAgencyClients;
        if (clientData.success && clientData.clients?.length > 0) {
          setClients(clientData.clients);
          currentClients = clientData.clients;
        }

        // Generate chart data based on loaded clients
        setRevenueData(currentClients.map((c: any) => ({ 
          name: c.name, 
          revenue: Math.floor(Math.random() * 50000 + 20000) 
        })));

      } catch (error) {
        console.error("Failed to fetch billing data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
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

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    clientId: "",
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    amount: 0,
    periodStart: new Date().toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "Draft"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExportROI = () => {
    // Premium CSV generation and download
    const headers = ["Client", "Revenue", "Labor Cost", "Markup", "ROI%"];
    const rows = clients.map(c => [
      c.name,
      (Math.floor(Math.random() * 50000) + 10000).toString(),
      (Math.floor(Math.random() * 30000) + 5000).toString(),
      "15%",
      "22.5%"
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `ROI_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("ROI Report generated and download started (CSV)");
  };

  const handleCreateInvoice = async () => {
    if (!newInvoice.clientId || !newInvoice.amount) {
      alert("Please fill in all required fields (Client and Amount)");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/agency/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newInvoice,
          clientId: Number(newInvoice.clientId),
          amount: Math.round(newInvoice.amount * 100), // Convert to cents
          companyId: 1 // Default for now
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Invoice generated successfully!");
        setIsCreateDialogOpen(false);
        // Refresh invoices
        const invRes = await fetch("/api/agency/invoices");
        const invData = await invRes.json();
        if (invData.success) setInvoices(invData.invoices);
        setNewInvoice({
          clientId: "",
          invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
          amount: 0,
          periodStart: new Date().toISOString().split('T')[0],
          periodEnd: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "Draft"
        });
      } else {
        toast.error(data.error || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Error connecting to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateAndSubmit = () => {
    if (!newInvoice.clientId) {
      toast.error("Please select a client");
      return;
    }
    if (newInvoice.amount <= 0) {
      toast.error("Please enter a valid invoice amount");
      return;
    }
    handleCreateInvoice();
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Client Invoicing</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage agency billings, track receivables, and analyze client revenue.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportROI} className="hover:bg-slate-50 dark:hover:bg-slate-800">
            <Download className="w-4 h-4 mr-2" /> Export ROI
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
            onClick={() => setIsCreateDialogOpen(true)}
          >
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
                <Input 
                  placeholder="Search invoices..." 
                  className="pl-9" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => setStatusFilter("All")}>All Statuses</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Paid")}>Paid Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Sent")}>Sent Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Draft")}>Draft Only</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-sm">Last 30 Days</Button>
              <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30">
                {statusFilter === "All" ? "All Statuses" : `${statusFilter} Only`}
              </Badge>
            </div>
          </div>

          <Card className="shadow-none border-slate-200 dark:border-slate-800 !overflow-visible min-h-[600px]">
            <div className="pb-40">
              <Table>
                <TableHeader className="bg-slate-100/80 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800">
                  <TableRow className="hover:bg-transparent">
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
                {filteredInvoices.map((invoice, idx) => (
                  <TableRow key={invoice.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/30 dark:bg-slate-900/20'} hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10`}>
                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-slate-50">{invoice.clientName}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{invoice.invoiceNumber}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                    </TableCell>
                    <TableCell className="font-bold">{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                         <DropdownMenuItem className="cursor-pointer">
                          <Eye className="w-4 h-4 mr-2 text-indigo-500" /> Quick View
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
            </div>
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

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="p-8 bg-slate-50/50 dark:bg-slate-900/50 border-b relative">
            <DialogHeader className="pt-2">
              <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Create Custom Invoice</DialogTitle>
              <DialogDescription className="text-slate-500 font-semibold mt-1">
                Generate a manual invoice for specialized services or corrections.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Client</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                  value={newInvoice.clientId}
                  onChange={(e) => setNewInvoice({...newInvoice, clientId: e.target.value})}
                >
                  <option value="">Choose a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Invoice Number</label>
                <Input 
                  value={newInvoice.invoiceNumber}
                  onChange={(e) => setNewInvoice({...newInvoice, invoiceNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Amount ($)</label>
                <Input 
                  type="number" 
                  placeholder="0.00"
                  value={newInvoice.amount || ""}
                  onChange={(e) => setNewInvoice({...newInvoice, amount: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Period Start</label>
                <Input 
                  type="date" 
                  value={newInvoice.periodStart}
                  onChange={(e) => setNewInvoice({...newInvoice, periodStart: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Period End</label>
                <Input 
                  type="date" 
                  value={newInvoice.periodEnd}
                  onChange={(e) => setNewInvoice({...newInvoice, periodEnd: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Due Date</label>
                <Input 
                  type="date" 
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-900 border-t gap-3">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl font-bold h-11 px-6">Cancel</Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 min-w-[160px] rounded-xl font-bold h-11 shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02]" 
              onClick={validateAndSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Generate Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <p className="text-sm text-slate-500">Issued: {formatDate(selectedInvoice.createdAt)}</p>
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
                  <p className="font-medium">Due Date: {formatDate(selectedInvoice.dueDate)}</p>
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
