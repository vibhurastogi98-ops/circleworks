"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MarkerType,
  Node,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, GitBranch, Play, Plus, Save, Settings2, Trash2, Users, X, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppWorkflow, WorkflowNodeData } from "@/data/mockWorkflows";
import { ActionNode } from "./nodes/ActionNode";
import { ConditionNode } from "./nodes/ConditionNode";
import { TriggerNode } from "./nodes/TriggerNode";

type WorkflowBuilderProps = {
  initialData: AppWorkflow | null;
  onClose?: () => void;
};

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
};

const triggerEvents = [
  "Employee hired",
  "Employee terminated",
  "Pay period ends",
  "Timesheet submitted",
  "PTO request submitted",
  "Review due",
  "Date-based: X days before hire anniversary",
  "Date-based: X days before certification expiry",
  "Field changed: When employee department changes",
];

const actionTypes = [
  ["email", "Send email"],
  ["slack", "Send Slack message"],
  ["task", "Create task"],
  ["update", "Update employee field"],
  ["push", "Send push notification"],
  ["webhook", "Call webhook"],
  ["delay", "Wait X days/hours"],
] as const;

const operators = ["equals", "not equals", "contains", "greater than", "is empty"];

const employees = [
  "Alex Johnson - Software Engineer",
  "Sarah Smith - Marketing Manager",
  "Miguel Rodriguez - Sales Lead",
  "Priya Shah - HR Generalist",
];

const defaultTrigger: Node<WorkflowNodeData> = {
  id: "trigger-1",
  type: "trigger",
  position: { x: 80, y: 180 },
  data: { label: "Employee hired", triggerEvent: "Employee hired" },
};

function addDefaults(nodes: Node<WorkflowNodeData>[]) {
  return nodes.length ? nodes : [defaultTrigger];
}

function getNodeLabel(type: "trigger" | "condition" | "action") {
  if (type === "trigger") return "Employee hired";
  if (type === "condition") return "IF work_state = California";
  return "Send email";
}

function getNodeDefaults(type: "trigger" | "condition" | "action"): WorkflowNodeData {
  if (type === "trigger") return { label: "Employee hired", triggerEvent: "Employee hired" };
  if (type === "condition") {
    return { label: "IF work_state = California", conditionLogic: "AND", field: "work_state", operator: "equals", value: "California" };
  }
  return { label: "Send email", actionType: "email", template: "Welcome email", recipients: "Employee + manager" };
}

export default function WorkflowBuilder({ initialData, onClose }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WorkflowNodeData>>(addDefaults(initialData?.nodes || []));
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialData?.edges || []);
  const [workflowName, setWorkflowName] = useState(initialData?.template ? `${initialData.name} copy` : initialData?.name || "Untitled Workflow");
  const [workflowStatus, setWorkflowStatus] = useState<"Active" | "Paused" | "Draft">(initialData?.template ? "Draft" : initialData?.status || "Draft");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [testEmployee, setTestEmployee] = useState(employees[0]);
  const [simulationRun, setSimulationRun] = useState(false);

  const { data: employeeOptions = employees } = useQuery({
    queryKey: ["workflow-test-employees"],
    queryFn: async () => employees,
    staleTime: 60_000,
  });

  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) || null, [nodes, selectedNodeId]);
  const selectedEdge = useMemo(() => edges.find((edge) => edge.id === selectedEdgeId) || null, [edges, selectedEdgeId]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((currentEdges) =>
        addEdge(
          {
            ...params,
            id: `${params.source}-${params.sourceHandle || "out"}-${params.target}-${uuidv4().slice(0, 5)}`,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          currentEdges,
        ),
      );
    },
    [setEdges],
  );

  const addNode = (type: "trigger" | "condition" | "action") => {
    if (type === "trigger" && nodes.some((node) => node.type === "trigger")) {
      toast.error("Every workflow can only have one trigger.");
      return;
    }

    const newNode: Node<WorkflowNodeData> = {
      id: `${type}-${uuidv4()}`,
      type,
      position: { x: 120 + nodes.length * 210, y: 180 + (nodes.length % 2) * 130 },
      data: getNodeDefaults(type),
    };
    setNodes((currentNodes) => currentNodes.concat(newNode));
    setSelectedNodeId(newNode.id);
    setSelectedEdgeId(null);
  };

  const updateSelectedNode = (patch: Partial<WorkflowNodeData>) => {
    if (!selectedNode) return;

    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: { ...node.data, ...patch },
            }
          : node,
      ),
    );
  };

  const deleteSelectedNode = () => {
    if (!selectedNode) return;
    if (selectedNode.type === "trigger") {
      toast.error("The trigger is required and cannot be deleted.");
      return;
    }
    setNodes((currentNodes) => currentNodes.filter((node) => node.id !== selectedNode.id));
    setEdges((currentEdges) => currentEdges.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNodeId(null);
  };

  const deleteSelectedConnection = () => {
    if (!selectedEdge) return;
    setEdges((currentEdges) => currentEdges.filter((edge) => edge.id !== selectedEdge.id));
    setSelectedEdgeId(null);
    toast.success("Connection removed.");
  };

  const validateWorkflow = () => {
    const errors: string[] = [];
    const triggerNodes = nodes.filter((node) => node.type === "trigger");
    if (triggerNodes.length !== 1) errors.push("Workflow must have exactly one trigger.");
    if (nodes.length > 1) {
      const connectedNodeIds = new Set(edges.flatMap((edge) => [edge.source, edge.target]));
      const orphanNodes = nodes.filter((node) => node.type !== "trigger" && !connectedNodeIds.has(node.id));
      if (orphanNodes.length) errors.push("Every condition/action node must be connected.");
    }
    nodes.forEach((node) => {
      if (!node.data.label) errors.push(`${node.type} node is missing a label.`);
      if (node.type === "trigger" && !node.data.triggerEvent) errors.push("Trigger event is required.");
      if (node.type === "action" && !node.data.actionType) errors.push("Action type is required.");
      if (node.type === "condition" && (!node.data.field || !node.data.operator)) errors.push("Condition field and operator are required.");
    });
    return errors;
  };

  const saveWorkflow = () => {
    const errors = validateWorkflow();
    if (errors.length) {
      toast.error("Workflow validation failed", { description: errors[0] });
      return;
    }
    setWorkflowStatus("Active");
    toast.success("Workflow saved and activated.");
  };

  const simulationSteps = nodes.map((node, index) => {
    if (node.type === "trigger") return `Matched trigger: ${node.data.triggerEvent}`;
    if (node.type === "condition") return `Evaluated condition: ${node.data.field} ${node.data.operator} ${node.data.value || "(blank)"}`;
    return `Would run action: ${node.data.label}`;
  });

  return (
    <div className="fixed inset-0 z-[80] flex h-screen w-screen flex-col overflow-hidden bg-slate-50 dark:bg-[#0F172A]">
      <header className="z-10 flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]">
        <div className="flex min-w-0 items-center gap-4">
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close workflow builder">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={workflowName}
            onChange={(event) => setWorkflowName(event.target.value)}
            className="min-w-0 bg-transparent text-lg font-bold text-slate-900 outline-none dark:text-white"
            placeholder="Workflow Name"
          />
          <button
            type="button"
            onClick={() => setWorkflowStatus((current) => (current === "Active" ? "Paused" : "Active"))}
            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${workflowStatus === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}
          >
            {workflowStatus}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant={testMode ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              setTestMode((current) => !current);
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            className="gap-2"
          >
            <Play className="h-4 w-4" /> Test with employee
          </Button>
          <Button type="button" onClick={saveWorkflow} className="gap-2 bg-blue-600 hover:bg-blue-700" size="sm">
            <Save className="h-4 w-4" /> Save + Activate
          </Button>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => {
              setSelectedNodeId(node.id);
              setSelectedEdgeId(null);
              setTestMode(false);
            }}
            onEdgeClick={(_, edge) => {
              setSelectedEdgeId(edge.id);
              setSelectedNodeId(null);
              setTestMode(false);
            }}
            onPaneClick={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed } }}
            fitView
            className="bg-white"
          >
            <Background color="#cbd5e1" variant={BackgroundVariant.Dots} gap={18} size={1.4} />
            <Controls className="border-slate-200 bg-white shadow-xl" />

            <Panel position="top-left" className="m-4 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="px-2 pt-1 text-[10px] font-bold uppercase text-slate-400">Drag-drop nodes</div>
              <button onClick={() => addNode("trigger")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
                <Zap className="h-4 w-4 text-blue-600" /> Trigger
              </button>
              <button onClick={() => addNode("condition")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
                <GitBranch className="h-4 w-4 text-amber-600" /> Condition
              </button>
              <button onClick={() => addNode("action")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Action
              </button>
            </Panel>

            {selectedEdge && (
              <Panel position="top-center" className="m-4 rounded-xl border border-red-200 bg-white p-2 shadow-xl">
                <button onClick={deleteSelectedConnection} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" /> Delete connection
                </button>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {(selectedNode || testMode) && (
          <aside className="z-20 flex h-full w-96 flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#1E293B]">
            {testMode ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-200 bg-purple-50 p-4 dark:border-slate-800 dark:bg-purple-500/10">
                  <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300"><Play className="h-4 w-4" /> Test Mode</div>
                  <button onClick={() => setTestMode(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X className="h-5 w-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Select employee</label>
                  <div className="relative mb-6">
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <select value={testEmployee} onChange={(event) => setTestEmployee(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                      {employeeOptions.map((employee) => <option key={employee}>{employee}</option>)}
                    </select>
                  </div>

                  <button onClick={() => setSimulationRun(true)} className="mb-8 w-full rounded-lg bg-purple-600 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-purple-700">
                    Run workflow in simulation
                  </button>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">What would happen</h4>
                    <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 shadow-inner">
                      {simulationRun ? (
                        <div className="space-y-2">
                          <div className="text-emerald-300">employee = {testEmployee}</div>
                          {simulationSteps.map((step, index) => <div key={`${step}-${index}`}>{index + 1}. {step}</div>)}
                          <div className="text-blue-300">No live actions were executed.</div>
                        </div>
                      ) : (
                        <div className="text-slate-500">// Waiting for simulation to run...</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><Settings2 className="h-4 w-4 text-slate-500" /> Edit {selectedNode?.type}</div>
                  <button onClick={() => setSelectedNodeId(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X className="h-5 w-5" /></button>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Label</label>
                    <input value={selectedNode?.data.label || ""} onChange={(event) => updateSelectedNode({ label: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                  </div>

                  {selectedNode?.type === "trigger" && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Trigger event</label>
                      <select value={selectedNode.data.triggerEvent || ""} onChange={(event) => updateSelectedNode({ triggerEvent: event.target.value, label: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                        {triggerEvents.map((event) => <option key={event}>{event}</option>)}
                      </select>
                    </div>
                  )}

                  {selectedNode?.type === "condition" && (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">IF / THEN logic</label>
                        <select value={selectedNode.data.conditionLogic || "AND"} onChange={(event) => updateSelectedNode({ conditionLogic: event.target.value as "AND" | "OR" })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                          <option>AND</option>
                          <option>OR</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input value={selectedNode.data.field || ""} onChange={(event) => updateSelectedNode({ field: event.target.value })} placeholder="work_state" className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                        <select value={selectedNode.data.operator || "equals"} onChange={(event) => updateSelectedNode({ operator: event.target.value })} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                          {operators.map((operator) => <option key={operator}>{operator}</option>)}
                        </select>
                        <input value={selectedNode.data.value || ""} onChange={(event) => updateSelectedNode({ value: event.target.value, label: `IF ${selectedNode.data.field || "field"} ${selectedNode.data.operator || "equals"} ${event.target.value}` })} placeholder="California" className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                      </div>
                      <button className="text-xs font-bold text-amber-600 hover:text-amber-700"><Plus className="mr-1 inline h-3 w-3" /> Add AND/OR rule</button>
                    </div>
                  )}

                  {selectedNode?.type === "action" && (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Action</label>
                        <select value={selectedNode.data.actionType || "email"} onChange={(event) => updateSelectedNode({ actionType: event.target.value, label: actionTypes.find(([value]) => value === event.target.value)?.[1] || "Action" })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                          {actionTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </div>

                      {selectedNode.data.actionType === "email" && (
                        <>
                          <input value={selectedNode.data.template || ""} onChange={(event) => updateSelectedNode({ template: event.target.value })} placeholder="Email template" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                          <input value={selectedNode.data.recipients || ""} onChange={(event) => updateSelectedNode({ recipients: event.target.value })} placeholder="Recipients" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                        </>
                      )}
                      {selectedNode.data.actionType === "slack" && (
                        <>
                          <input value={selectedNode.data.channel || ""} onChange={(event) => updateSelectedNode({ channel: event.target.value })} placeholder="#people-ops" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                          <textarea value={selectedNode.data.message || ""} onChange={(event) => updateSelectedNode({ message: event.target.value })} placeholder="Message text" className="h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                        </>
                      )}
                      {selectedNode.data.actionType === "task" && (
                        <>
                          <input value={selectedNode.data.recipients || ""} onChange={(event) => updateSelectedNode({ recipients: event.target.value })} placeholder="Assign to role" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                          <input value={selectedNode.data.dueOffset || ""} onChange={(event) => updateSelectedNode({ dueOffset: event.target.value })} placeholder="Due date offset, e.g. +3 days" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                        </>
                      )}
                      {selectedNode.data.actionType === "webhook" && (
                        <>
                          <input value={selectedNode.data.url || ""} onChange={(event) => updateSelectedNode({ url: event.target.value })} placeholder="https://example.com/webhook" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                          <textarea value={selectedNode.data.payload || ""} onChange={(event) => updateSelectedNode({ payload: event.target.value })} placeholder='{"employeeId":"{{employee.id}}"}' className="h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                        </>
                      )}
                      {selectedNode.data.actionType === "delay" && (
                        <div className="grid grid-cols-2 gap-2">
                          <input value={selectedNode.data.delayAmount || ""} onChange={(event) => updateSelectedNode({ delayAmount: event.target.value })} placeholder="3" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                          <select value={selectedNode.data.delayUnit || "days"} onChange={(event) => updateSelectedNode({ delayUnit: event.target.value as "hours" | "days" })} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                            <option value="hours">hours</option>
                            <option value="days">days</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
                    <button onClick={deleteSelectedNode} className="w-full rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20">
                      Delete node
                    </button>
                  </div>
                </div>
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
