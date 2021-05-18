import rawConfig from '../../config-data/config.json';
import * as node from '@airnode/node';

const config = node.config.parseConfig(rawConfig[0]);

function encodeBody(data: node.WorkerResponse): string {
  return JSON.stringify(data);
}

export async function startCoordinator() {
  await node.handlers.startCoordinator(config);
  const response = { ok: true, data: { message: 'Coordinator completed' } };
  return { statusCode: 200, body: encodeBody(response) };
}

export async function initializeProvider(event: any) {
  const stateWithConfig = { ...event.state, config };

  const [err, initializedState] = await node.promiseUtils.go(node.handlers.initializeProvider(stateWithConfig));
  if (err || !initializedState) {
    const msg = `Failed to initialize provider: ${stateWithConfig.settings.name}`;
    const errorLog = node.logger.pend('ERROR', msg, err);
    const body = encodeBody({ ok: false, errorLog });
    return { statusCode: 500, body };
  }

  const body = encodeBody({ ok: true, data: node.providerState.scrub(initializedState) });
  return { statusCode: 200, body };
}

export async function callApi(event: any) {
  const { aggregatedApiCall, logOptions } = event;
  const [logs, apiCallResponse] = await node.handlers.callApi(config, aggregatedApiCall);
  node.logger.logPending(logs, logOptions);
  const response = encodeBody({ ok: true, data: apiCallResponse });
  return { statusCode: 200, body: response };
}

export async function processProviderRequests(event: any) {
  const stateWithConfig = { ...event.state, config };

  const [err, updatedState] = await node.promiseUtils.go(node.handlers.processTransactions(stateWithConfig));
  if (err || !updatedState) {
    const msg = `Failed to process provider requests: ${stateWithConfig.settings.name}`;
    const errorLog = node.logger.pend('ERROR', msg, err);
    const body = encodeBody({ ok: false, errorLog });
    return { statusCode: 500, body };
  }

  const body = encodeBody({ ok: true, data: node.providerState.scrub(updatedState) });
  return { statusCode: 200, body };
}
