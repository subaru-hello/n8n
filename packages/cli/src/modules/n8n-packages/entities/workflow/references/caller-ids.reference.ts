import type { EntityReference } from '../../reference';
import type { WorkflowSubWorkflowRequirement } from '../workflow.types';

/**
 * `settings.callerIds` is a comma-separated allowlist of workflow ids permitted to call this
 * workflow as a sub-workflow. It is not a dependency — a caller outside the package is fine —
 * so it contributes no requirements, but the ids still need remapping on import.
 */
export const callerIdsReference: EntityReference<WorkflowSubWorkflowRequirement> = {
	extract() {
		return [];
	},
	apply(workflow, bindings) {
		const { settings } = workflow;
		// settings is opaque at the schema level, so a non-string callerIds would crash `.split`.
		if (!settings?.callerIds || typeof settings.callerIds !== 'string') return;

		settings.callerIds = settings.callerIds
			.split(',')
			.map((raw) => raw.trim())
			.filter((id) => id !== '')
			.map((id) => bindings.workflows.get(id) ?? id)
			.join(',');
	},
};
