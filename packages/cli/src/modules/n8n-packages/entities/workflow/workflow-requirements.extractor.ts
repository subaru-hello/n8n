import type { WorkflowEntity } from '@n8n/db';
import { Service } from '@n8n/di';

import { workflowReferences } from './references';
import type { WorkflowSubWorkflowRequirement } from './workflow.types';
import type { RequirementsExtractor } from '../requirements-extractor';

@Service()
export class WorkflowRequirementsExtractor
	implements RequirementsExtractor<WorkflowSubWorkflowRequirement>
{
	extract(workflow: WorkflowEntity): WorkflowSubWorkflowRequirement[] {
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
}
