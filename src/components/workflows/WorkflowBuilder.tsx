"use client";

import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode } from './nodes/TriggerNode';
import { ConditionNode } from './nodes/ConditionNode';
import { ActionNode } from './nodes/ActionNode';
import { ArrowLeft, Save, Play, Settings2, X, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { AppWorkflow } from '@/data/mockWorkflows';

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
};

export default function WorkflowBuilder({ initialData }: { initialData: AppWorkflow | null }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
  
  const [workflowName, setWorkflowName] = useState(initialData?.name || 'Untitled Workflow');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [testMode, setTestMode] = useState(false);
  
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setTestMode(false);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  const addNode = (type: 'trigger' | 'condition' | 'action') => {
    const newNode: Node = {
      id: uuidv4(),
      type,
      position: { x: 250, y: nodes.length * 100 + 50 },
      data: { 
        label: type === 'trigger' ? 'New Trigger' : type === 'condition' ? 'New Condition' : 'New Action' 
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const updateNodeLabel = (label: string) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          node.data = { ...node.data, label };
        }
        return node;
      })
    );
    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label } });
  };

  const updateNodeSubtype = (subtype: string) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          node.data = { ...node.data, subtype };
        }
        return node;
      })
    );
    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, subtype } });
  };

  const saveWorkflow = () => {
    // Validate: Needs at least 1 trigger, no orphans ideally (but keep simple for mock)
    const hasTrigger = nodes.some(n => n.type === 'trigger');
    if (!hasTrigger) {
      toast.error('Workflow must have at least one Trigger node.');
      return;
    }
    toast.success('Workflow saved successfully and set to Active.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-[#0F172A] flex flex-col h-screen w-screen overflow-hidden">
      {/* Top Header */}
      <header className="h-16 px-4 bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/settings/workflows" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <input 
            type="text" 
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white"
            placeholder="Workflow Name"
          />
          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full uppercase">
            Draft
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setTestMode(!testMode); setSelectedNode(null); }}
            className={`flex items-center gap-2 px-3 py-1.5 font-medium rounded-md transition-colors text-sm ${
              testMode 
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Play className="w-4 h-4" />
            Test Mode
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
          <button 
            onClick={saveWorkflow}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm text-sm"
          >
            <Save className="w-4 h-4" />
            Save & Activate
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-50 dark:bg-[#0B1120]"
          >
            <Background color="#94a3b8" variant={BackgroundVariant.Dots} gap={16} size={1.5} />
            <Controls className="fill-slate-600 dark:fill-slate-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xl" />
            
            <Panel position="top-left" className="m-4 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase px-2 pt-1">Add Stage</div>
              <button onClick={() => addNode('trigger')} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                <div className="w-4 h-4 rounded-full bg-blue-500" /> Trigger
              </button>
              <button onClick={() => addNode('condition')} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                <div className="w-4 h-4 transform rotate-45 bg-amber-500 mt-1 mb-1 mx-0.5" /> Condition
              </button>
              <button onClick={() => addNode('action')} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                <div className="w-4 h-4 rounded bg-emerald-500" /> Action
              </button>
            </Panel>
          </ReactFlow>
        </div>

        {/* Right Sidebar - Properties or Test Mode */}
        {(selectedNode || testMode) && (
          <div className="w-80 bg-white dark:bg-[#1E293B] border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl animate-in slide-in-from-right-8 z-20">
            {testMode ? (
              // TEST MODE SIDEBAR
              <>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold">
                    <Play className="w-4 h-4" /> Simulation Mode
                  </div>
                  <button onClick={() => setTestMode(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Employee</label>
                  <div className="relative mb-6">
                    <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <select className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none
                      text-slate-900 dark:text-white">
                      <option>Alex Johnson (Software Engineer)</option>
                      <option>Sarah Smith (Marketing)</option>
                      <option>Miguel Rodriguez (Sales)</option>
                    </select>
                  </div>
                  
                  <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors mb-8">
                    Run Simulation
                  </button>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Execution Log</h4>
                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 shadow-inner">
                      <div className="text-slate-500">// Waiting for simulation to run...</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // EDIT NODE SIDEBAR
              <>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Settings2 className="w-4 h-4 text-slate-500" />
                    Edit {selectedNode?.type === 'trigger' ? 'Trigger' : selectedNode?.type === 'condition' ? 'Condition' : 'Action'}
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-6">
                  {/* Common Label Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                       Label
                    </label>
                    <input 
                      type="text" 
                      value={selectedNode?.data?.label as string || ''}
                      onChange={(e) => updateNodeLabel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Trigger specific */}
                  {selectedNode?.type === 'trigger' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Event Type
                      </label>
                      <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white">
                        <option>Employee Hired</option>
                        <option>Employee Terminated</option>
                        <option>Pay Period Ends</option>
                        <option>Date-based (Anniversary, Birthday)</option>
                        <option>Field Changed</option>
                      </select>
                    </div>
                  )}

                  {/* Condition specific */}
                  {selectedNode?.type === 'condition' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Rule
                      </label>
                      <div className="flex gap-2">
                        <select className="flex-1 px-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none text-slate-900 dark:text-white">
                          <option>Department</option>
                          <option>Work State</option>
                          <option>Employment Type</option>
                        </select>
                        <select className="w-20 px-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none text-slate-900 dark:text-white">
                          <option>equals</option>
                          <option>is not</option>
                          <option>contains</option>
                        </select>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Value..."
                        className="w-full mt-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-white"
                      />
                      <button className="text-xs font-medium text-amber-600 hover:text-amber-700 mt-2 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add AND rule
                      </button>
                    </div>
                  )}

                  {/* Action specific */}
                  {selectedNode?.type === 'action' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Action Component
                        </label>
                        <select 
                          value={selectedNode?.data?.subtype as string || 'email'}
                          onChange={(e) => updateNodeSubtype(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                        >
                          <option value="email">Send Email</option>
                          <option value="slack">Send Slack Message</option>
                          <option value="task">Create Task</option>
                          <option value="delay">Wait / Delay</option>
                          <option value="webhook">Call Webhook</option>
                          <option value="kudos">Send Kudos</option>
                        </select>
                      </div>
                      
                      {selectedNode?.data?.subtype === 'email' && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Template</label>
                          <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none text-slate-900 dark:text-white">
                            <option>Welcome to {`{{company_name}}`}</option>
                            <option>Action Required: I-9</option>
                            <option>Custom Text...</option>
                          </select>
                        </div>
                      )}
                    </>
                  )}

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                    <button 
                      onClick={() => {
                        setNodes(nds => nds.filter(n => n.id !== selectedNode?.id));
                        setSelectedNode(null);
                      }}
                      className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 font-medium rounded-lg text-sm transition-colors"
                    >
                      Delete Block
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
