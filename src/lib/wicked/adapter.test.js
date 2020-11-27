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
import { SysconfigFile } from './files';

jest.mock('./client');
jest.mock('./files');


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

describe('#setDownConnection', () => {
    const setDownConnectionMock = jest.fn();

    beforeAll(() => {
        Client.mockImplementation(() => {
            return {
                setDownConnection: setDownConnectionMock
            };
        });
    });

    afterAll(() => {
        setDownConnectionMock.mockClear();
    });

    it('asks the wicked client to set up the given connection', async () => {
        const client = new Client();
        const adapter = new Adapter(client);

        adapter.setDownConnection({ name:  'eth0' });

        expect(setDownConnectionMock).toHaveBeenCalledWith('eth0');
    });

    it('returns undefined when action is performed successfully', async () => {
        setDownConnectionMock.mockImplementation(name => Promise.resolve());

        const client = new Client();
        const adapter = new Adapter(client);

        const result = await adapter.setDownConnection({ name: 'eth0' });
        expect(result).toBeUndefined();
    });

    it('throws an error when something goes wrong', async () => {
        const error = { message: 'Something goes wrong', exit_status: 157 };

        setDownConnectionMock.mockImplementation(name => Promise.reject(error));

        const client = new Client();
        const adapter = new Adapter(client);

        await expect(adapter.setDownConnection({ name: 'eth0' })).rejects.toEqual(error);
    });
});

describe('#setUpConnection', () => {
    const setUpConnectionMock = jest.fn();

    beforeAll(() => {
        Client.mockImplementation(() => {
            return {
                setUpConnection: setUpConnectionMock
            };
        });
    });

    afterAll(() => {
        setUpConnectionMock.mockClear();
    });

    it('asks the wicked client to set up the given connection', async () => {
        const client = new Client();
        const adapter = new Adapter(client);

        adapter.setUpConnection({ name:  'eth0' });

        expect(setUpConnectionMock).toHaveBeenCalledWith('eth0');
    });

    it('returns undefined when action is performed successfully', async () => {
        setUpConnectionMock.mockImplementation(name => Promise.resolve());

        const client = new Client();
        const adapter = new Adapter(client);

        const result = await adapter.setUpConnection({ name: 'eth0' });
        expect(result).toBeUndefined();
    });

    it('throws an error when something goes wrong', async () => {
        const error = { message: 'Something goes wrong', exit_status: 157 };

        setUpConnectionMock.mockImplementation(name => Promise.reject(error));

        const client = new Client();
        const adapter = new Adapter(client);

        await expect(adapter.setUpConnection({ name: 'eth0' })).rejects.toEqual(error);
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

    it('asks the wicked client to reload the connection', async () => {
        const client = new Client();
        const adapter = new Adapter(client);

        adapter.reloadConnection('eth0');

        expect(reloadConnectionMock).toHaveBeenCalledWith('eth0');
    });

    it('returns undefined when action is performed successfully', async () => {
        reloadConnectionMock.mockImplementation(name => Promise.resolve());

        const client = new Client();
        const adapter = new Adapter(client);

        const result = await adapter.reloadConnection('eth0');
        expect(result).toBeUndefined();
    });

    it('throws an error when something goes wrong', async () => {
        const error = { message: 'Something goes wrong', exit_status: 157 };

        reloadConnectionMock.mockImplementation(name => Promise.reject(error));

        const client = new Client();
        const adapter = new Adapter(client);

        await expect(adapter.reloadConnection('eth0')).rejects.toEqual(error);
    });

    describe('#dnsSettings', () => {
        const client = new Client();
        const adapter = new Adapter(client);

        const dnsSettings = {
            NETCONFIG_DNS_POLICY: 'auto',
            NETCONFIG_DNS_STATIC_SERVERS: '8.8.8.8',
            NETCONFIG_DNS_STATIC_SEARCHLIST: 'suse.com'
        };

        const setMock = jest.fn();

        beforeAll(() => {
            SysconfigFile.mockImplementation(() => {
                return {
                    read: () => Promise.resolve(),
                    write: () => Promise.resolve(),
                    get: (key) => {
                        return dnsSettings[key];
                    },
                    set: setMock
                }
            });
        });

        afterEach(() => {
            SysconfigFile.mockClear();
        })

        it('returns the DNS settings', async () => {
            expect(await adapter.dnsSettings()).toEqual({
                policy: 'auto',
                nameServers: ['8.8.8.8'],
                searchList: ['suse.com']
            });
        });

        it('writes the DNS settings', async () => {
            await adapter.updateDnsSettings({
                policy: 'auto',
                nameServers: ['8.8.8.8', '1.1.1.1'],
                searchList: ['suse.com', 'suse.de']
            });

            expect(setMock).toHaveBeenCalledWith(
                'NETCONFIG_DNS_POLICY', 'auto'
            );
            expect(setMock).toHaveBeenCalledWith(
                'NETCONFIG_DNS_STATIC_SERVERS', '8.8.8.8 1.1.1.1')
            ;
            expect(setMock).toHaveBeenCalledWith(
                'NETCONFIG_DNS_STATIC_SEARCHLIST', 'suse.com suse.de'
            );
        })
    });
});
