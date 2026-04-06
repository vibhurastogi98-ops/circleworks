import { Node, Edge } from '@xyflow/react';

export type WorkflowStatus = 'Active' | 'Paused' | 'Draft';

export type AppWorkflow = {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  status: WorkflowStatus;
  lastRun?: string;
  runCount: number;
  template: boolean;
  nodes: Node[];
  edges: Edge[];
};

// Common initial position setup helper
const pos = (x: number, y: number) => ({ x, y });

export const MOCK_TEMPLATES: AppWorkflow[] = [];

// Combine templates with existing active ones
export const MOCK_ACTIVE_WORKFLOWS: AppWorkflow[] = [];
