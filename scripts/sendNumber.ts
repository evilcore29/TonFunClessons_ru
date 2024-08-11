import { toNano } from '@ton/core';
import { Counter } from '../wrappers/Counter';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const counter = provider.open(Counter.createFromConfig({}, await compile('Counter')));

    // * 123n это число 123 в типом bigint
    await counter.sendNumber(provider.sender(), toNano('0.01'), 123n);
}
