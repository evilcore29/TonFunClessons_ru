import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

// * все что находится в этом файле - обертка, которая эмулирует контракт, с целью проведения тестов

export type CounterConfig = {};

// * counterConfigToCell - функция которая преобразовывает конфиг CounterConfig в ячейку и возвращает ее
export function counterConfigToCell(config: CounterConfig): Cell {
    // * записываем число 0, длины 64 бита
    // * теперь при создании контракта, в его хранилище будет лежать 0
    return beginCell().storeUint(0, 64).endCell();
}

// * в этот класс можно дописывать методы для взаимодействия с контрактом
export class Counter implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new Counter(address);
    }

    // * метод, который позволяет делать обертку контракта, и использовать ее в своих тестах
    static createFromConfig(config: CounterConfig, code: Cell, workchain = 0) {
        const data = counterConfigToCell(config);
        const init = { code, data };
        return new Counter(contractAddress(workchain, init), init);
    }

    // * Все методы обёртки, которые отправляют сообщения, должны иметь префикс send в начале. Все методы обёртки, которые вызывают гет-методы, должны иметь префикс get в начале.
    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    // * Лучше всегда использовать тип bigint для чисел в обёртках смарт-контрактов, так как он поддерживает очень большие числа и является более точным, чем number.
    // * provider.internal() - отправляет внутренее сообщение
    async sendNumber(provider: ContractProvider, via: Sender, value: bigint, number: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(number, 32).endCell(),
        });
    }

    // * при вызове гет методов никаких сообщений к контракту не посылается
    async getTotal(provider: ContractProvider) {
        const res = await provider.get('get_total', []);
        return res.stack.readBigNumber();
    }
}

// * deployed contract address
// * https://testnet.tonscan.org/address/EQD4eA1SdQOivBbTczzElFmfiKu4SXNL4S29TReQwzzr_70k
// * возможно так как код контракта уже неоднократно повторялся, его адрес не уникальный. Из-за этого там уже есть история помимо моего сообщения
