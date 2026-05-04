export interface WorkflowActionPayload {
  workflowId: string;
  workflowName: string;
  triggeredBy: "automation";
  actionType: "update_field" | "create_task" | "send_email" | "change_status";
  entityType: "employee" | "task" | "job" | "onboarding";
  entityId: string | number;
  changedFields: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
  timestamp: string;
}

/**
 * Emit 'workflow.action.executed' to all clients in the company room.
 * Call this from any server-side route/service after a workflow action runs.
 */
export function emitWorkflowAction(
  companyId: number,
  payload: WorkflowActionPayload
): void {
  // @ts-ignore – global.io is attached by the custom Next.js server
  if (typeof global !== "undefined" && global.io) {
    // @ts-ignore
    global.io.to(`company:${companyId}`).emit("workflow.action.executed", payload);
  }
}
