import type { WorkflowEntity } from '@n8n/db';

import type { RequirementsExtractor } from './requirements-extractor';
import type { PackageImportBindings } from '../n8n-packages.types';

/**
 * A cross-entity reference carried inside a workflow — a sub-workflow, credential, tag, or
 * variable it points at. Pairs the two halves that must stay in sync: extracting the
 * references for the export manifest (via {@link RequirementsExtractor}) and rewriting them
 * from source to target ids on import. Keeping both on one object means a new reference kind
 * cannot add extraction without also providing the rewrite, or vice versa.
 */
export interface EntityReference<TRequirement> extends RequirementsExtractor<TRequirement> {
	/** Rewrite the references in place using the resolved source→target import bindings. */
	apply(workflow: WorkflowEntity, bindings: PackageImportBindings): void;
}
