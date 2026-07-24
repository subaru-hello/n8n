import { callerIdsReference } from './caller-ids.reference';
import { errorWorkflowReference } from './error-workflow.reference';
import { subWorkflowNodeReference } from './sub-workflow-node.reference';
import type { EntityReference } from '../../reference';
import type { WorkflowSubWorkflowRequirement } from '../workflow.types';

/**
 * Every reference a workflow holds to another workflow. Add a new site as one file in this
 * folder and register it here; the requirements extractor (export) and the importer (import)
 * both iterate this list, so the two halves cannot drift.
 */
export const workflowReferences: Array<EntityReference<WorkflowSubWorkflowRequirement>> = [
	subWorkflowNodeReference,
	errorWorkflowReference,
	callerIdsReference,
];
