import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Bell, CheckSquare, Clock, Globe, Mail, MessageSquare, Play, Repeat2, RefreshCcw } from 'lucide-react';

const ICONS: Record<string, React.ElementType> = {
  email: Mail,
  task: CheckSquare,
  slack: MessageSquare,
  push: Bell,
  notification: Bell,
  webhook: Globe,
  http: Globe,
  delay: Clock,
  loop: Repeat2,
  update: RefreshCcw,
  wait: Clock,
  kudos: Play
};

function textValue(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function configSummary(data: NodeProps['data'], subtype: string) {
  if (subtype === 'email') return `Template ${textValue(data.template, 'Custom')} to ${textValue(data.recipients, 'employee')}`;
  if (subtype === 'slack') return `Post to ${textValue(data.channel, '#people-ops')}`;
  if (subtype === 'task') return `Assign to ${textValue(data.recipients, 'manager')} due ${textValue(data.dueOffset, '+3 days')}`;
  if (subtype === 'update') return `Set ${textValue(data.field, 'employee.status')} to ${textValue(data.value, 'active')}`;
  if (subtype === 'notification') return `Notify ${textValue(data.recipients, 'role:hr')}`;
  if (subtype === 'http' || subtype === 'webhook') return `POST ${textValue(data.url, 'external URL')}`;
  if (subtype === 'delay' || subtype === 'wait') return `Wait ${textValue(data.delayAmount, '2')} ${textValue(data.delayUnit, 'days')}`;
  if (subtype === 'loop') return `For each ${textValue(data.loopFilter, 'matching employee')}`;
  return textValue(data.message, subtype);
}

export function ActionNode({ data, isConnectable, selected }: NodeProps) {
  const subtype = typeof data.actionType === 'string' ? data.actionType : typeof data.subtype === 'string' ? data.subtype : 'play';
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
        <div className="mt-2 text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{subtype}</div>
        <div className="mt-1 line-clamp-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {configSummary(data, subtype)}
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
