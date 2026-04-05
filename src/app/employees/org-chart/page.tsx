"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Download, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { mockEmployees, Employee } from "@/data/mockEmployees";
import { Tree, TreeNode } from "react-organizational-chart";

// Build a simple tree hierarchy from flat mock data
interface OrgNodeData extends Employee {
  children?: OrgNodeData[];
}

function EmployeeCard({ node }: { node: OrgNodeData }) {
  return (
    <div className="inline-block"> {/* Inline block ensures TreeNode wrapper sizing is correct */}
       <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-3 flex flex-col items-center gap-2 w-48 mx-auto relative group hover:shadow-md transition-all cursor-pointer">
         <img src={node.avatar} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700 shadow-sm object-cover" alt="" />
         <div className="text-center w-full">
           <Link href={`/employees/${node.id}`} className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1 block focus:outline-none">
             {node.firstName} {node.lastName}
           </Link>
           <div className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">{node.title}</div>
           <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">{node.department}</div>
         </div>
       </div>
    </div>
  );
}

// Recursive rendering component
function renderNodes(nodes?: OrgNodeData[]) {
  if (!nodes || nodes.length === 0) return null;
  return nodes.map(node => (
    <TreeNode key={node.id} label={<EmployeeCard node={node} />}>
      {renderNodes(node.children)}
    </TreeNode>
  ));
}

export default function OrgChartPage() {
  const treeData = useMemo(() => {
    const list = JSON.parse(JSON.stringify(mockEmployees)) as OrgNodeData[];
    const map = new Map<string, OrgNodeData>();
    let root: OrgNodeData | null = null;
    
    list.forEach(emp => map.set(emp.id, emp));
    
    list.forEach(emp => {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div className="flex flex-col gap-2">
          <Link href="/employees" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors w-fit">
            <ChevronLeft size={16} /> Back to Directory
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Organization Chart</h1>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700" title="Zoom In"><ZoomIn size={18} /></button>
           <button className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700" title="Zoom Out"><ZoomOut size={18} /></button>
           <button className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700" title="Fit to Screen"><Maximize size={18} /></button>
           <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
           <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
             <Download size={16} /> Export
           </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-inner overflow-auto p-8 flex items-center justify-center">
         <div className="min-w-max pb-16">
           {treeData ? (
             <Tree 
                lineWidth={'2px'} 
                lineColor={'#cbd5e1'} // tailwind slate-300
                lineBorderRadius={'8px'} 
                nodePadding={'24px'}
                label={<EmployeeCard node={treeData} />}
             >
                {renderNodes(treeData.children)}
             </Tree>
           ) : (
             <div className="text-slate-500">No hierarchy found.</div>
           )}
         </div>
      </div>
    </div>
  );
}
