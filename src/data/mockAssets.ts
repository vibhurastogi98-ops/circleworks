export type AssetType = 'Laptop' | 'Monitor' | 'Phone' | 'Keyboard' | 'Badge' | 'Parking Pass' | 'Other';
export type AssetStatus = 'Available' | 'Assigned' | 'In Repair' | 'Retired';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  serialNumber: string;
  assignedTo: string | null; // employee name
  assignedToId: number | null;
  status: AssetStatus;
  purchaseDate: string;
  value: number; // in cents
  notes: string;
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  assetName: string;
  assetType: AssetType;
  serialNumber: string;
  employeeId: number;
  employeeName: string;
  assignedAt: string;
  returnedAt: string | null;
  status: 'Active' | 'Returned' | 'Overdue';
}

export const ASSET_TYPES: AssetType[] = [
  'Laptop', 'Monitor', 'Phone', 'Keyboard', 'Badge', 'Parking Pass', 'Other'
];

export const ASSET_STATUSES: AssetStatus[] = [
  'Available', 'Assigned', 'In Repair', 'Retired'
];

export const ASSET_TYPE_ICONS: Record<AssetType, string> = {
  'Laptop': '💻',
  'Monitor': '🖥️',
  'Phone': '📱',
  'Keyboard': '⌨️',
  'Badge': '🪪',
  'Parking Pass': '🅿️',
  'Other': '📦',
};

export const mockAssets: Asset[] = [
  {
    id: 'ast-1',
    name: 'MacBook Pro 16" M3 Max',
    type: 'Laptop',
    serialNumber: 'C02ZW1L3MD6R',
    assignedTo: 'Priya Sharma',
    assignedToId: 1,
    status: 'Assigned',
    purchaseDate: '2024-06-15',
    value: 349900,
    notes: 'AppleCare+ until 2027',
  },
  {
    id: 'ast-2',
    name: 'MacBook Pro 14" M3 Pro',
    type: 'Laptop',
    serialNumber: 'C02ZW1L3MD7S',
    assignedTo: 'Marcus Chen',
    assignedToId: 2,
    status: 'Assigned',
    purchaseDate: '2024-07-01',
    value: 249900,
    notes: '',
  },
  {
    id: 'ast-3',
    name: 'Dell UltraSharp 27" 4K',
    type: 'Monitor',
    serialNumber: 'DL-4K27-00142',
    assignedTo: 'Priya Sharma',
    assignedToId: 1,
    status: 'Assigned',
    purchaseDate: '2024-06-15',
    value: 62999,
    notes: '',
  },
  {
    id: 'ast-4',
    name: 'Dell UltraSharp 27" 4K',
    type: 'Monitor',
    serialNumber: 'DL-4K27-00143',
    assignedTo: null,
    assignedToId: null,
    status: 'Available',
    purchaseDate: '2024-06-15',
    value: 62999,
    notes: 'Spare for new hires',
  },
  {
    id: 'ast-5',
    name: 'iPhone 15 Pro',
    type: 'Phone',
    serialNumber: 'DNQXK0ABCD1',
    assignedTo: 'Derek Lawson',
    assignedToId: 4,
    status: 'Assigned',
    purchaseDate: '2024-09-20',
    value: 99900,
    notes: 'Company phone for sales team',
  },
  {
    id: 'ast-6',
    name: 'Logitech MX Keys',
    type: 'Keyboard',
    serialNumber: 'LG-MXK-88421',
    assignedTo: null,
    assignedToId: null,
    status: 'In Repair',
    purchaseDate: '2024-03-10',
    value: 9999,
    notes: 'Keys sticking, sent to vendor',
  },
  {
    id: 'ast-7',
    name: 'Building Access Badge',
    type: 'Badge',
    serialNumber: 'BDG-2024-0045',
    assignedTo: 'Keiko Tanaka',
    assignedToId: 3,
    status: 'Assigned',
    purchaseDate: '2024-09-14',
    value: 2500,
    notes: 'Access to floors 2-4',
  },
  {
    id: 'ast-8',
    name: 'Garage Parking Pass',
    type: 'Parking Pass',
    serialNumber: 'PKG-SF-0019',
    assignedTo: null,
    assignedToId: null,
    status: 'Available',
    purchaseDate: '2024-01-01',
    value: 0,
    notes: 'Level B2, spot 19',
  },
  {
    id: 'ast-9',
    name: 'ThinkPad X1 Carbon Gen 11',
    type: 'Laptop',
    serialNumber: 'PF-48SJ21',
    assignedTo: null,
    assignedToId: null,
    status: 'Retired',
    purchaseDate: '2021-04-15',
    value: 189900,
    notes: 'End of life, recycled',
  },
  {
    id: 'ast-10',
    name: 'LG 34" UltraWide',
    type: 'Monitor',
    serialNumber: 'LG-UW34-00071',
    assignedTo: 'Felicia Grant',
    assignedToId: 5,
    status: 'Assigned',
    purchaseDate: '2024-02-20',
    value: 79999,
    notes: '',
  },
];

export const mockAssetAssignments: AssetAssignment[] = [
  {
    id: 'asgn-1',
    assetId: 'ast-1',
    assetName: 'MacBook Pro 16" M3 Max',
    assetType: 'Laptop',
    serialNumber: 'C02ZW1L3MD6R',
    employeeId: 1,
    employeeName: 'Priya Sharma',
    assignedAt: '2024-06-15',
    returnedAt: null,
    status: 'Active',
  },
  {
    id: 'asgn-2',
    assetId: 'ast-3',
    assetName: 'Dell UltraSharp 27" 4K',
    assetType: 'Monitor',
    serialNumber: 'DL-4K27-00142',
    employeeId: 1,
    employeeName: 'Priya Sharma',
    assignedAt: '2024-06-15',
    returnedAt: null,
    status: 'Active',
  },
  {
    id: 'asgn-3',
    assetId: 'ast-2',
    assetName: 'MacBook Pro 14" M3 Pro',
    assetType: 'Laptop',
    serialNumber: 'C02ZW1L3MD7S',
    employeeId: 2,
    employeeName: 'Marcus Chen',
    assignedAt: '2024-07-01',
    returnedAt: null,
    status: 'Active',
  },
  {
    id: 'asgn-4',
    assetId: 'ast-5',
    assetName: 'iPhone 15 Pro',
    assetType: 'Phone',
    serialNumber: 'DNQXK0ABCD1',
    employeeId: 4,
    employeeName: 'Derek Lawson',
    assignedAt: '2024-09-20',
    returnedAt: null,
    status: 'Overdue',
  },
  {
    id: 'asgn-5',
    assetId: 'ast-7',
    assetName: 'Building Access Badge',
    assetType: 'Badge',
    serialNumber: 'BDG-2024-0045',
    employeeId: 3,
    employeeName: 'Keiko Tanaka',
    assignedAt: '2024-09-14',
    returnedAt: null,
    status: 'Active',
  },
  {
    id: 'asgn-6',
    assetId: 'ast-10',
    assetName: 'LG 34" UltraWide',
    assetType: 'Monitor',
    serialNumber: 'LG-UW34-00071',
    employeeId: 5,
    employeeName: 'Felicia Grant',
    assignedAt: '2024-02-20',
    returnedAt: null,
    status: 'Active',
  },
];

// Helper: get assets assigned to a specific employee ID
export const getAssetsForEmployee = (employeeId: number) =>
  mockAssetAssignments.filter(a => a.employeeId === employeeId && a.status === 'Active');

// Helper: get assets assigned to a specific employee name
export const getAssetsForEmployeeName = (name: string) =>
  mockAssetAssignments.filter(a => a.employeeName === name && a.status !== 'Returned');
