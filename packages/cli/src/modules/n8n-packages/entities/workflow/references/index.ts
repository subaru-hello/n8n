import type { WorkflowEntity } from '@n8n/db';

import { callerIdsReference } from './caller-ids.reference';
import { errorWorkflowReference } from './error-workflow.reference';
import { subWorkflowNodeReference } from './sub-workflow-node.reference';
import type { EntityReference } from '../../reference';
import type { WorkflowSubWorkflowRequirement } from '../workflow.types';

/**
 * Every reference a workflow holds to another workflow. Add a new site as one file in this
 * folder and register it here: the importer applies each, and {@link extractWorkflowRequirements}
 * collects each for the export manifest — so the two halves cannot drift.
 */
export const workflowReferences: Array<EntityReference<WorkflowSubWorkflowRequirement>> = [
	subWorkflowNodeReference,
	errorWorkflowReference,
	callerIdsReference,
];

/**
 * Aggregates every workflow reference's requirements for the export manifest, deduped by
 * referenced workflow id — a workflow referenced by several sites appears once.
 */
export function extractWorkflowRequirements(
	workflow: WorkflowEntity,
): WorkflowSubWorkflowRequirement[] {
	const byId = new Map<string, WorkflowSubWorkflowRequirement>();
	for (const reference of workflowReferences) {
		for (const requirement of reference.extract(workflow)) {
			if (!byId.has(requirement.referencedWorkflowId)) {
				byId.set(requirement.referencedWorkflowId, requirement);
			}
		}
	}
	return [...byId.values()];
}
