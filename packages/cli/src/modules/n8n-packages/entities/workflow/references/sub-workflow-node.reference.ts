import {
	getSubworkflowId,
	isNodeWithWorkflowSelector,
	isResourceLocatorValue,
	type INode,
} from 'n8n-workflow';

import type { EntityReference } from '../../reference';
import type { WorkflowSubWorkflowRequirement } from '../workflow.types';

/**
 * The statically-referenced sub-workflow id of a node (Execute Workflow / Workflow Tool /
 * Retriever). Only a resource-locator or legacy plain-string `workflowId` on a `database`
 * source is a static dependency; expressions and other sources are runtime-resolved.
 */
export function getStaticSubworkflowId(node: INode): string | undefined {
	if (!isNodeWithWorkflowSelector(node)) return undefined;

	// Older nodes may omit `source`; database is their implicit default. Only a 'database'
	// source references a workflow by id.
	const { source = 'database' } = node.parameters;
	if (source !== 'database') return undefined;

	// Newer versions store the id in a resource-locator (resolved by the shared helper);
	// legacy versions store it as a plain string.
	const { workflowId: storedWorkflowId } = node.parameters;
	return toStaticId(getSubworkflowId(node) ?? storedWorkflowId);
}

/**
 * Writes `workflowId` back to the same location {@link getStaticSubworkflowId} reads from:
 * the resource-locator `value` for newer nodes, or the plain-string param for legacy ones.
 * Intended to be called only for nodes where `getStaticSubworkflowId` returned an id.
 */
export function setStaticSubworkflowId(node: INode, workflowId: string): void {
	const stored = node.parameters.workflowId;
	if (isResourceLocatorValue(stored)) {
		stored.value = workflowId;
	} else {
		node.parameters.workflowId = workflowId;
	}
}

function toStaticId(value: unknown): string | undefined {
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	// Expressions are resolved at runtime, so they are not static dependencies.
	if (trimmed === '' || trimmed.startsWith('=')) return undefined;
	return trimmed;
}

/** Execute Workflow / Workflow Tool / Retriever nodes that select a sub-workflow by id. */
export const subWorkflowNodeReference: EntityReference<WorkflowSubWorkflowRequirement> = {
	extract(workflow) {
		const requirements: WorkflowSubWorkflowRequirement[] = [];
		for (const node of workflow.nodes ?? []) {
			const referencedWorkflowId = getStaticSubworkflowId(node);
			if (referencedWorkflowId) {
				requirements.push({ workflowId: workflow.id, referencedWorkflowId });
			}
		}
		return requirements;
	},
	apply(workflow, bindings) {
		for (const node of workflow.nodes ?? []) {
			const currentId = getStaticSubworkflowId(node);
			if (!currentId) continue;
			const targetId = bindings.workflows.get(currentId);
			if (targetId) setStaticSubworkflowId(node, targetId);
		}
	},
};
