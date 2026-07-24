import type { WorkflowEntity } from '@n8n/db';
import type { INode, NodeParameterValueType } from 'n8n-workflow';

import { workflowReferences } from '../workflow-reference';

const EXECUTE_WORKFLOW = 'n8n-nodes-base.executeWorkflow';

function node(workflowId: NodeParameterValueType): INode {
	return {
		id: 'n',
		name: 'n',
		type: EXECUTE_WORKFLOW,
		typeVersion: 1.2,
		position: [0, 0],
		parameters: { workflowId },
	};
}

const workflow = (nodes: INode[]) => ({ nodes }) as WorkflowEntity;
const resourceLocator = (value: string) => ({ __rl: true, mode: 'id', value });

// The registry currently holds only the sub-workflow node reference; iterate it as a whole
// so the test stays valid as more references are added.
const extractAll = (wf: WorkflowEntity) => workflowReferences.flatMap((ref) => ref.extract(wf));
const applyAll = (wf: WorkflowEntity, bindings: Map<string, string>) =>
	workflowReferences.forEach((ref) => ref.apply(wf, bindings));

describe('workflowReferences', () => {
	it('extracts referenced ids from resource-locator and legacy string selectors', () => {
		const wf = workflow([node(resourceLocator('child-a')), node('child-b')]);

		expect(extractAll(wf).sort()).toEqual(['child-a', 'child-b']);
	});

	it('rewrites referenced ids through the binding map, leaving unknown ids untouched', () => {
		const wf = workflow([
			node(resourceLocator('child-a')),
			node('child-b'),
			node(resourceLocator('external')),
		]);

		applyAll(
			wf,
			new Map([
				['child-a', 'A'],
				['child-b', 'B'],
			]),
		);

		expect(extractAll(wf).sort()).toEqual(['A', 'B', 'external']);
	});
});
