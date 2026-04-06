"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Download, ZoomIn, ZoomOut, Maximize, Loader2, Users } from "lucide-react";
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

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

        <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
          <button className="hover:text-blue-600 transition-colors"><ZoomIn size={20} /></button>
          <button className="hover:text-blue-600 transition-colors"><ZoomOut size={20} /></button>
          <button className="hover:text-blue-600 transition-colors"><Maximize size={20} /></button>
          <button className="hover:text-blue-600 transition-colors"><Download size={20} /></button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 overflow-auto shadow-sm">
        {!mounted || isLoading ? (
          <div className="flex flex-col items-center gap-3">
             <Loader2 size={32} className="text-blue-600 animate-spin" />
             <p className="text-sm text-slate-500 font-medium">Building hierarchy...</p>
          </div>
        ) : treeData ? (
          <div className="p-4">
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