import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play, Mail, CheckSquare, MessageSquare, Bell, Globe, Clock } from 'lucide-react';

const ICONS: Record<string, React.ElementType> = {
  email: Mail,
  task: CheckSquare,
  slack: MessageSquare,
  push: Bell,
  webhook: Globe,
  delay: Clock,
  kudos: Play
};

export function ActionNode({ data, isConnectable, selected }: NodeProps) {
  const subtype = typeof data.subtype === 'string' ? data.subtype : 'play';
  const Icon = ICONS[subtype] || Play;

  return (
    <div className={`w-64 bg-white dark:bg-[#1E293B] rounded-xl border-2 transition-all shadow-sm ${
      selected 
        ? 'border-emerald-500 shadow-emerald-500/20' 
        : 'border-emerald-200 dark:border-emerald-800'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-slate-400 border-2 border-white dark:border-slate-900"
      />
      <div className="bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 border-b border-emerald-100 dark:border-emerald-800/50 rounded-t-[10px] flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
          Action
        </div>
      </div>
      <div className="p-4">
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          {typeof data.label === 'string' ? data.label : 'Execute action...'}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900"
      />
    </div>
  );
}
