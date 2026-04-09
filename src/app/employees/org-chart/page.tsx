"use client";

import React, { useMemo, useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Download, ZoomIn, ZoomOut, Maximize, Minimize, Loader2, Users } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import dynamic from "next/dynamic";

// ✅ CRITICAL SSR FIX: Import library dynamically with ssr: false
const Tree = dynamic<any>(() => import("react-organizational-chart").then((mod) => mod.Tree), { ssr: false });
const TreeNode = dynamic<any>(() => import("react-organizational-chart").then((mod) => mod.TreeNode), { ssr: false });

interface OrgNodeData {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string;
  jobTitle: string;
  department: string;
  status: string;
  managerId: number | null;
  children?: OrgNodeData[];
}

function EmployeeCard({ node }: { node: OrgNodeData }) {
  return (
    <div className="inline-block">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-3 flex flex-col items-center gap-2 w-48 mx-auto group hover:shadow-md transition-all">
        <div className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden bg-slate-100">
          <img
            src={node.avatar}
            className="w-full h-full object-cover"
            alt={`${node.firstName} ${node.lastName}`}
          />
        </div>
        <div className="text-center w-full">
          <Link
            href={`/employees/${node.id}`}
            className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 block truncate"
          >
            {node.firstName} {node.lastName}
          </Link>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {node.jobTitle}
          </div>
          <div className="text-[10px] uppercase font-bold text-slate-400 mt-1 truncate">
            {node.department}
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Strong typed recursive renderer
function renderNodes(nodes: OrgNodeData[] | undefined): React.ReactNode {
  if (!nodes || nodes.length === 0) return null;

  return nodes.map((node: OrgNodeData) => (
    <TreeNode key={node.id} label={<EmployeeCard node={node} />}>
      {renderNodes(node.children)}
    </TreeNode>
  ));
}

export default function OrgChartPage() {
  const { data: employees, isLoading } = useEmployees();
  const [mounted, setMounted] = React.useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (chartContainerRef.current?.requestFullscreen) {
        chartContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    // Create a simple text representation of the org chart
    const generateOrgChartText = (node: OrgNodeData | null, level = 0): string => {
      if (!node) return '';
      
      const indent = '  '.repeat(level);
      let result = `${indent}${node.firstName} ${node.lastName} - ${node.jobTitle}\n`;
      
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          result += generateOrgChartText(child, level + 1);
        });
      }
      
      return result;
    };

    const orgChartText = generateOrgChartText(treeData);
    const blob = new Blob([orgChartText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'org-chart.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ✅ Robust hierarchy generation
  const treeData = useMemo<OrgNodeData | null>(() => {
    if (!employees || employees.length === 0) return null;

    // 1. Create a deep copy of the employees list
    const list: OrgNodeData[] = JSON.parse(JSON.stringify(employees));
    const map = new Map<number, OrgNodeData>();
    
    // 2. Index all employees by ID
    list.forEach(emp => {
      map.set(emp.id, { ...emp, children: [] });
    });

    const hierarchy: OrgNodeData[] = [];
    
    // 3. Connect all employees to their parents
    list.forEach(emp => {
      const node = map.get(emp.id)!;
      if (emp.managerId && map.has(emp.managerId)) {
        map.get(emp.managerId)!.children?.push(node);
      } else {
        hierarchy.push(node);
      }
    });

    // 4. Return the first root found (CEO or top-most manager)
    return hierarchy[0] || null;
  }, [employees]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-140px)]">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link href="/employees" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors">
            <ChevronLeft size={16} /> Back to Directory
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Organization Chart</h1>
        </div>

        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
          <button 
            onClick={handleZoomIn}
            className="p-2 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button 
            onClick={handleZoomOut}
            className="p-2 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <button 
            onClick={handleResetZoom}
            className="p-2 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Reset Zoom"
          >
            <span className="text-xs font-medium">{Math.round(zoomLevel * 100)}%</span>
          </button>
          <button 
            onClick={handleFullscreen}
            className="p-2 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          <button 
            onClick={handleDownload}
            className="p-2 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Download Org Chart"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div 
        ref={chartContainerRef}
        className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 overflow-auto shadow-sm relative"
        style={{
          minHeight: '400px'
        }}
      >
        {!mounted || isLoading ? (
          <div className="flex flex-col items-center gap-3">
             <Loader2 size={32} className="text-blue-600 animate-spin" />
             <p className="text-sm text-slate-500 font-medium">Building hierarchy...</p>
          </div>
        ) : treeData ? (
          <div 
            className="p-4 transition-transform duration-200 ease-in-out"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              minWidth: '600px'
            }}
          >
            <Tree
              lineWidth="3px"
              lineColor="#94a3b8"
              lineBorderRadius="16px"
              nodePadding="32px"
              label={<EmployeeCard node={treeData} />}
            >
              {renderNodes(treeData.children)}
            </Tree>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center max-w-sm">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Users size={32} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">Start Building Your Team</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Your organizational hierarchy will appear here once you add employees and assign managers.
              </p>
            </div>
            <Link href="/employees/new" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Add First Employee
            </Link>
          </div>
        )}
      </div>
    </div>
  );}