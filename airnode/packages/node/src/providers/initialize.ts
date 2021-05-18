import flatMap from 'lodash/flatMap';
import isEmpty from 'lodash/isEmpty';
import { go } from '../utils/promise-utils';
import * as logger from '../logger';
import { buildEVMState } from '../providers/state';
import { spawnNewProvider } from '../providers/worker';
import { Config, EVMProviderState, LogsData, ProviderState, WorkerOptions } from '../types';
import { WORKER_PROVIDER_INITIALIZATION_TIMEOUT } from '../constants';

async function initializeEVMProvider(
  state: ProviderState<EVMProviderState>,
  workerOpts: WorkerOptions
): Promise<LogsData<ProviderState<EVMProviderState> | null>> {
  const initialization = () => spawnNewProvider(state, workerOpts);

  // Each provider gets 20 seconds to initialize. If it fails to initialize
  // in this time, it is ignored. It is important to catch any potential errors
  // here as a single promise rejecting will cause Promise.all to reject
  const [err, logsWithRes] = await go(initialization, { timeoutMs: WORKER_PROVIDER_INITIALIZATION_TIMEOUT });
  if (err || !logsWithRes) {
    const log = logger.pend('ERROR', `Unable to initialize provider:${state.settings.name}`, err);
    return [[log], null];
  }
  return logsWithRes;
}

export async function initialize(
  coordinatorId: string,
  config: Config,
  workerOpts: WorkerOptions
): Promise<LogsData<ProviderState<EVMProviderState>[]>> {
  const { chains } = config;

  if (isEmpty(chains)) {
    throw new Error('One or more chains must be defined in the provided config');
  }

  const EVMChains = chains.filter((c) => c.type === 'evm');

  // Providers are identified by their index in the array. This allows users
  // to configure duplicate providers safely (if they want the added redundancy)
  const EVMInitializations = flatMap(
    EVMChains.map((chain) => {
      return chain.providerNames.map(async (providerName) => {
        const state = buildEVMState(coordinatorId, chain, providerName, config);
        return initializeEVMProvider(state, workerOpts);
      });
    })
  );

  const providerStates = await Promise.all(EVMInitializations);
  const logs = flatMap(providerStates.map((ps) => ps[0]));
  const successfulResponses = providerStates.filter((ps) => !!ps[1]);
  const successfulProviders = successfulResponses.map((ps) => ps[1]) as ProviderState<EVMProviderState>[];
  return [logs, successfulProviders];
}
