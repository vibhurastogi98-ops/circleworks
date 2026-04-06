import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export function ConditionNode({ data, isConnectable, selected }: NodeProps) {
  return (
    <div className={`w-64 bg-white dark:bg-[#1E293B] rounded-xl border-2 transition-all shadow-sm ${
      selected 
        ? 'border-amber-500 shadow-amber-500/20' 
        : 'border-amber-200 dark:border-amber-800'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-slate-400 border-2 border-white dark:border-slate-900"
      />
      <div className="bg-amber-50 dark:bg-amber-900/30 px-4 py-3 border-b border-amber-100 dark:border-amber-800/50 rounded-t-[10px] flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-800 flex items-center justify-center transform rotate-45">
          <GitBranch className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 -rotate-45" />
        </div>
        <div className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
          Condition
        </div>
      </div>
      <div className="p-4">
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          {typeof data.label === 'string' ? data.label : 'If / Then...'}
        </div>
      </div>
      
      {/* True Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 -ml-8"
      />
      <div className="absolute -bottom-6 left-[calc(50%-44px)] text-[10px] font-bold text-emerald-600">
        TRUE
      </div>

      {/* False Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-red-500 border-2 border-white dark:border-slate-900 ml-8"
      />
      <div className="absolute -bottom-6 left-[calc(50%+20px)] text-[10px] font-bold text-red-600">
        FALSE
      </div>
    </div>
  );
}
