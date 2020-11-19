/*
 * Copyright (c) [2020] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of version 2 of the GNU General Public License as published
 * by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, contact SUSE LLC.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

import Adapter from './adapter';
import Client from './client';

jest.mock('./client');

const eth0_conn = { name: 'eth0' };
const br1_conn = { name: 'br0', bridge: { ports: ['eth0'] } };
const eth0_iface = { interface: { name: 'eth0' } };

const configurations = [eth0_conn, br1_conn];
const interfaces = [eth0_iface];

const resolveTo = (result) => () => {
    return new Promise((resolve) => {
        process.nextTick(() => resolve(result));
    });
};

describe('#connections', () => {
    describe('if there are no connections', () => {
        beforeAll(() => {
            Client.mockImplementation(() => {
                return {
                    getConfigurations: resolveTo(undefined),
                    getInterfaces: resolveTo(interfaces)
                };
            });
        });

        it('returns an empty collection', () => {
            const client = new Client();
            const adapter = new Adapter(client);

            expect.assertions(1);
            return adapter.connections().then(conns => {
                expect(conns).toEqual([]);
            });
        });
    });

    describe('when there are available connections', () => {
        beforeAll(() => {
            Client.mockImplementation(() => {
                return {
                    getConfigurations: resolveTo(configurations),
                    getInterfaces: resolveTo(interfaces)
                };
            });
        });

        it('returns the list of connections', () => {
            const client = new Client();
            const adapter = new Adapter(client);

            expect.assertions(1);
            return adapter.connections().then(conns => {
                expect(conns).toEqual([
                    expect.objectContaining({ name: 'eth0', type: 'eth' }),
                    expect.objectContaining({ name: 'br0', type: 'br' }),
                ]);
            });
        });
    });
});

describe('#interfaces', () => {
    const eth0_conn = { name: 'eth0' };
    const br1_conn = { name: 'br0', bridge: { ports: ['eth0'] } };
    const eth0_iface = { interface: { name: 'eth0' } };

    const configurations = [eth0_conn, br1_conn];
    const interfaces = [eth0_iface];

    const resolveTo = (result) => () => {
        return new Promise((resolve) => {
            process.nextTick(() => resolve(result));
        });
    };

    beforeAll(() => {
        Client.mockImplementation(() => {
            return {
                getConfigurations: resolveTo(configurations),
                getInterfaces: resolveTo(interfaces)
            };
        });
    });

    it('returns the list of interfaces', () => {
        const client = new Client();
        const adapter = new Adapter(client);

        return adapter.interfaces().then(interfaces => {
            expect(interfaces).toEqual([
                expect.objectContaining({ name: 'eth0', type: 'eth', virtual: false }),
                expect.objectContaining({ name: 'br0', type: 'br', virtual: true }),
            ]);
        });
    });
});

describe('#reloadConnection', () => {
    const reloadConnectionMock = jest.fn();

    beforeAll(() => {
        Client.mockImplementation(() => {
            return {
                reloadConnection: reloadConnectionMock
            };
        });
    });

    afterAll(() => {
        reloadConnectionMock.mockClear();
    });

    it('returns the conneciton name if everything works', async () => {
        reloadConnectionMock.mockImplementation(name => Promise.resolve(name));

        const client = new Client();
        const adapter = new Adapter(client);

        const name = await adapter.reloadConnection("eth0");
        expect(name).toEqual("eth0");
    });

    it('returns the connection name even if there is a known and ignored error', async () => {
        const error = { message: "This error should be ignored", exit_status: 162 };

        reloadConnectionMock.mockImplementation(name => Promise.reject(error));

        const client = new Client();
        const adapter = new Adapter(client);

        const name = await adapter.reloadConnection("eth0");
        expect(name).toEqual("eth0");
    });

    it('rejects if there is a not ignored error', async () => {
        const error = { message: "This error should be ignored", exit_status: 157 };

        reloadConnectionMock.mockImplementation(name => Promise.reject(error));

        const client = new Client();
        const adapter = new Adapter(client);

        await expect(adapter.reloadConnection("eth0")).rejects.toEqual(error);
    });
});
