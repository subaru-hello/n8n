import type { WorkflowEntity } from '@n8n/db';

import type { EntityReference } from '../../reference';
import type { WorkflowSubWorkflowRequirement } from '../workflow.types';

/**
 * The static id in `settings.errorWorkflow`, or undefined when there is no static dependency:
 * `DEFAULT` is a sentinel and an expression (`={{ ... }}`) resolves at runtime. Guards the
 * runtime type because package settings are validated only as an opaque object.
 */
function staticErrorWorkflowId(workflow: WorkflowEntity): string | undefined {
	const errorWorkflow = workflow.settings?.errorWorkflow;
	if (
		typeof errorWorkflow !== 'string' ||
		errorWorkflow === 'DEFAULT' ||
		errorWorkflow.startsWith('=')
	) {
		return undefined;
	}
	return errorWorkflow;
}

/** The workflow run on error, referenced by id in `settings.errorWorkflow`. */
export const errorWorkflowReference: EntityReference<WorkflowSubWorkflowRequirement> = {
	extract(workflow) {
		const referencedWorkflowId = staticErrorWorkflowId(workflow);
		return referencedWorkflowId ? [{ workflowId: workflow.id, referencedWorkflowId }] : [];
	},
	apply(workflow, bindings) {
		const currentId = staticErrorWorkflowId(workflow);
		if (!currentId || !workflow.settings) return;
		workflow.settings.errorWorkflow = bindings.workflows.get(currentId) ?? currentId;
	},
};
