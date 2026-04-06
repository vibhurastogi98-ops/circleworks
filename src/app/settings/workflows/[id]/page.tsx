"use client";

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import WorkflowBuilder from '@/components/workflows/WorkflowBuilder';
import { MOCK_ACTIVE_WORKFLOWS, MOCK_TEMPLATES } from '@/data/mockWorkflows';

export default function BuilderPage() {
  const params = useParams();
  const id = params?.id as string;

  // Find initial data if it's editing an existing one or a template
  const initialData = useMemo(() => {
    if (id === 'new') return null;
    const all = [...MOCK_ACTIVE_WORKFLOWS, ...MOCK_TEMPLATES];
    return all.find(w => w.id === id) || null;
  }, [id]);

  return <WorkflowBuilder initialData={initialData} />;
}
