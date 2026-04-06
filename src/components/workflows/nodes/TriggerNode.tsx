import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';

export function TriggerNode({ data, isConnectable, selected }: NodeProps) {
  return (
    <div className={`w-64 bg-white dark:bg-[#1E293B] rounded-xl border-2 transition-all shadow-sm ${
      selected 
        ? 'border-blue-500 shadow-blue-500/20' 
        : 'border-blue-200 dark:border-blue-800'
    }`}>
      <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 border-b border-blue-100 dark:border-blue-800/50 rounded-t-[10px] flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
          Trigger
        </div>
      </div>
      <div className="p-4">
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          {typeof data.label === 'string' ? data.label : 'Select Event...'}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-white dark:border-slate-900"
      />
    </div>
  );
}
