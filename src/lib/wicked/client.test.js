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

import cockpit from 'cockpit';
import Client from './client';

import { fixtureFile } from '../../../test/helpers';

const client = new Client();

describe('WickedClient', () => {
    const spawnResponses = {
        '/usr/sbin/wicked show-xml': fixtureFile('show-xml.xml'),
        '/usr/sbin/wicked show-config': fixtureFile('show-config.xml')
    };

    beforeAll(() => {
        cockpit.spawn = jest.fn(args => {
            return new Promise((resolve, reject) => {
                process.nextTick(() => {
                    const cmd = args.join(' ');
                    const response = spawnResponses[cmd];
                    resolve(response);
                });
            });
        });
    });

    describe('#getInterfaces', () => {
        it('returns the active interfaces', () => {
            expect.assertions(2);

            return client.getInterfaces().then(data => {
                const names = data.map(i => i.interface.name);
                expect(names).toEqual(['lo', 'eth0', 'eth1', 'eth2', 'eth3', 'bond0']);
                const paths = data.map(i => i._attrs.path);
                expect(paths).toEqual([
                    '/org/opensuse/Network/Interface/1',
                    '/org/opensuse/Network/Interface/2',
                    '/org/opensuse/Network/Interface/3',
                    '/org/opensuse/Network/Interface/4',
                    '/org/opensuse/Network/Interface/5',
                    '/org/opensuse/Network/Interface/6'
                ]);
            });
        });
    });

    describe('#getConfigurations', () => {
        it('returns configurations', () => {
            expect.assertions(2);

            return client.getConfigurations().then(data => {
                const names = data.map(c => c.name);
                expect(names).toEqual(['lo', 'eth0', 'eth1', 'bond0', 'eth2', 'eth3', 'br0']);

                // Check list data
                const bond0 = data.find(c => c.name === 'bond0');
                const bond0Slaves = bond0.bond.slaves.map(s => s.device);
                expect(bond0Slaves).toEqual(['eth1', 'eth2']);
            });
        });
    });

    describe('#getInterfaceByPath', () => {
        it('returns the configuration with the given D-Bus path', () => {
            expect.assertions(1);

            return client.getInterfaceByPath('/org/opensuse/Network/Interface/2').then(data => {
                expect(data.interface.name).toBe('eth0');
            });
        });

        it('returns undefined if the interface is not found', async () => {
            expect.assertions(1);

            const iface = await client.getInterfaceByPath('/org/opensuse/Network/Interface/99');
            expect(iface).toBeUndefined();
        });
    });

    // FIXME: We should be testing reloadConnection, setUpConnection and setDownConnection instead.
    describe('#runCommand', () => {
        beforeAll(() => {
            cockpit.spawn = jest.fn();
        });

        afterAll(() => {
            cockpit.spawn.mockRestore();
        });

        it('resolves with commands output', () => {
            cockpit.spawn.mockImplementation(() => Promise.resolve());

            const client = new Client();

            const promise = client.runCommand("ifup", "eth0");
            return expect(promise).resolves.toBeUndefined();
        });

        it('resolves with the error message if there is an expected error', () => {
            const error = { message: "This error should be ignored", exit_status: 163 };

            cockpit.spawn.mockImplementation(() => Promise.reject(error));
            expect.assertions(1);

            const client = new Client();
            return expect(client.runCommand('ifup', 'eth1')).resolves.toEqual(error.message);
        });

        it('rejects if there is a not expected error', () => {
            const error = { message: "This error should not be ignored", exit_status: 157 };

            cockpit.spawn.mockImplementation(() => Promise.reject(error));
            expect.assertions(1);

            const client = new Client();
            return expect(client.runCommand('ifup', 'eth1')).rejects.toEqual(error);
        });
    });
});
