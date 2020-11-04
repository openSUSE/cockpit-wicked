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

import Client from './client';

const client = new Client();

describe('#getInterfaces', () => {
    it('returns the active interfaces', () => {
        expect.assertions(2);

        return client.getInterfaces().then(data => {
            const names = data.map(i => i.interface.name);
            expect(names).toEqual(['lo', 'eth0', 'eth1', 'eth2', 'bond0']);
            const paths = data.map(i => i._attrs.path);
            expect(paths).toEqual([
                '/org/opensuse/Network/Interface/1',
                '/org/opensuse/Network/Interface/2',
                '/org/opensuse/Network/Interface/3',
                '/org/opensuse/Network/Interface/4',
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
            expect(names).toEqual(['lo', 'eth0', 'eth1', 'bond0', 'eth2']);

            // Check list data
            const bond0 = data.find(c => c.name === 'bond0');
            const bond0Slaves = bond0.bond.slaves.map(s => s.device);
            expect(bond0Slaves).toEqual(['eth1', 'eth2']);
        });
    });
});
