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

  // ✅ CRITICAL FIX → explicit generic
  const treeData = useMemo<OrgNodeData | null>(() => {
    const list = JSON.parse(JSON.stringify(mockEmployees)) as OrgNodeData[];
    const map = new Map<string, OrgNodeData>();
    let root: OrgNodeData | null = null;

    list.forEach((emp) => map.set(emp.id, emp));

    list.forEach((emp) => {
      if (emp.managerId && map.has(emp.managerId)) {
        const parent = map.get(emp.managerId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(emp);
      } else {
        root = emp;
      }
    });

    return root;
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-140px)]">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link href="/employees" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
            <ChevronLeft size={16} /> Back
          </Link>
          <h1 className="text-2xl font-bold">Organization Chart</h1>
        </div>

        <div className="flex gap-2">
          <ZoomIn size={18} />
          <ZoomOut size={18} />
          <Maximize size={18} />
          <Download size={18} />
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-center justify-center bg-white rounded-xl p-8 overflow-auto">
        {!mounted ? (
          <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
             <p className="text-sm text-slate-500 font-medium tracking-tight">Initializing hierarchy...</p>
          </div>
        ) : treeData ? (
          <Tree
            lineWidth="2px"
            lineColor="#cbd5e1"
            lineBorderRadius="8px"
            nodePadding="24px"
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