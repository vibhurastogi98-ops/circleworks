"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Download, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { mockEmployees, Employee } from "@/data/mockEmployees";
import dynamic from "next/dynamic";

// ✅ CRITICAL SSR FIX: Import library dynamically with ssr: false
const Tree = dynamic<any>(() => import("react-organizational-chart").then((mod) => mod.Tree), { ssr: false });
const TreeNode = dynamic<any>(() => import("react-organizational-chart").then((mod) => mod.TreeNode), { ssr: false });

interface OrgNodeData extends Employee {
  children?: OrgNodeData[];
}

function EmployeeCard({ node }: { node: OrgNodeData }) {
  return (
    <div className="inline-block">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-3 flex flex-col items-center gap-2 w-48 mx-auto group hover:shadow-md transition-all">
        <img
          src={node.avatar}
          className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700 shadow-sm object-cover"
          alt=""
        />
        <div className="text-center w-full">
          <Link
            href={`/employees/${node.id}`}
            className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 block"
          >
            {node.firstName} {node.lastName}
          </Link>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {node.title}
          </div>
          <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Robust hierarchy generation
  const treeData = useMemo<OrgNodeData | null>(() => {
    // 1. Create a deep copy of the employees list
    const list: OrgNodeData[] = JSON.parse(JSON.stringify(mockEmployees));
    const map = new Map<string, OrgNodeData>();
    
    // 2. Index all employees by ID
    list.forEach(emp => map.set(emp.id, emp));

    // 3. Connect all employees to their parents
    list.forEach(emp => {
      if (emp.managerId && map.has(emp.managerId)) {
        const parent = map.get(emp.managerId)!;
        if (!parent.children) parent.children = [];
        // Ensure we don't accidentally duplicate
        if (!parent.children.find(c => c.id === emp.id)) {
          parent.children.push(emp);
        }
      }
    });

    // 4. Explicitly find the CEO (emp-100) as the primary root
    const ceo = map.get('emp-100');
    if (ceo) return ceo;

    // 5. Fallback: find any node that has no manager (or whose manager isn't in the list)
    return list.find(emp => !emp.managerId || !map.has(emp.managerId)) || null;
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-140px)]">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link href="/employees" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
            <ChevronLeft size={16} /> Back
          </Link>
          <h1 className="text-2xl font-black text-slate-900 drop-shadow-sm">Organization Chart</h1>
          <div className="h-1 w-12 bg-blue-600 rounded-full mt-1.5" />
        </div>

        <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
          <button className="hover:text-blue-600 transition-colors"><ZoomIn size={20} /></button>
          <button className="hover:text-blue-600 transition-colors"><ZoomOut size={20} /></button>
          <button className="hover:text-blue-600 transition-colors"><Maximize size={20} /></button>
          <button className="hover:text-blue-600 transition-colors"><Download size={20} /></button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 overflow-auto shadow-inner">
        {!mounted ? (
          <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
             <p className="text-sm text-slate-500 font-medium tracking-tight">Initializing hierarchy...</p>
          </div>
        ) : treeData ? (
          <Tree
            lineWidth="3px"
            lineColor="#64748b"
            lineBorderRadius="16px"
            nodePadding="32px"
            label={<EmployeeCard node={treeData} />}
          >
            {renderNodes(treeData.children)}
          </Tree>
        ) : (
          <div>No hierarchy found</div>
        )}
      </div>
    </div>
  );
}