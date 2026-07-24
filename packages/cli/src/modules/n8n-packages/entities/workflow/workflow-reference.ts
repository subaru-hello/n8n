import type { WorkflowEntity } from '@n8n/db';

import { getStaticSubworkflowId, setStaticSubworkflowId } from './static-sub-workflow-id';
import type { ImportBindingMap } from '../../n8n-packages.types';

/**
 * One kind of cross-workflow reference (e.g. sub-workflow node selectors). Pairs the two
 * halves that must stay in sync: reading referenced ids for export requirements, and
 * rewriting them from source to target ids on import. Keeping both on one object means a
 * new reference site cannot add extraction without also providing the rewrite.
 */
export interface WorkflowReference {
	/** Referenced workflow ids in this workflow (feeds export requirements and import ordering). */
	extract(workflow: WorkflowEntity): string[];
	/** Rewrite those references in place, source id → target id. Ids absent from the map are kept. */
	apply(workflow: WorkflowEntity, bindings: ImportBindingMap): void;
}

/** Execute Workflow / Workflow Tool / Retriever nodes that select a sub-workflow by id. */
const subWorkflowNodeReference: WorkflowReference = {
	extract(workflow) {
		const ids: string[] = [];
		for (const node of workflow.nodes ?? []) {
			const id = getStaticSubworkflowId(node);
			if (id) ids.push(id);
		}
		return ids;
	},
	apply(workflow, bindings) {
		for (const node of workflow.nodes ?? []) {
			const currentId = getStaticSubworkflowId(node);
			if (!currentId) continue;
			const targetId = bindings.get(currentId);
			if (targetId) setStaticSubworkflowId(node, targetId);
		}
	},
};

/**
 * Every cross-workflow reference the import and export must keep in sync. Add a new site
 * here once and both the requirements extractor and the importer pick it up.
 */
export const workflowReferences: WorkflowReference[] = [subWorkflowNodeReference];
