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

import { createConnection } from './connections';
import interfaceType from '../model/interfaceType';
import startMode from '../model/startMode';
import bootProtocol from '../model/bootProtocol';
import addressType from '../model/addressType';
import bondingMode from '../model/bondingMode';

describe('#createConnection', () => {
    const wickedConfig = {
        name: 'eth0',
        control: {
            mode: 'boot',
            boot_stage: 'localfs',
            persistent: 'true'
        },
        'ipv4:dhcp': {
            enabled: 'true'
        },
        'ipv4:static': {
            addresses: [
                { local: '192.168.1.2/24', label: 'backup' },
                { local: '192.168.2.1/24', label: 'private' },
            ],
        },
        'ipv6:dhcp': {
            enabled: 'true'
        }
    };

    describe('when it is an ethernet connection', () => {
        it('sets the type to "ethernet"', () => {
            const connection = createConnection(wickedConfig);
            expect(connection.type).toEqual(interfaceType.ETHERNET);
            expect(connection.startMode).toEqual(startMode.NFSROOT);
        });
    });

    it('sets the IPV4 address configurations', () => {
        const connection = createConnection(wickedConfig);
        expect(connection.ipv4.addresses).toEqual([
            expect.objectContaining({ type: addressType.IPV4, address: '192.168.1.2/24', label: 'backup' }),
            expect.objectContaining({ type: addressType.IPV4, address: '192.168.2.1/24', label: 'private' })
        ]);
    });

    it('do not set a boot protocol', () => {
        const connection = createConnection(wickedConfig);
        expect(connection.bootProto).toBeUndefined();
    });

    describe('when it is a brige device', () => {
        const wickedConfig = {
            name: 'br0',
            bridge: {
                stp: true,
                ports: ['eth0', 'eth1']
            }

        };

        it('sets the bridge specific properties', () => {
            const connection = createConnection(wickedConfig);
            expect(connection.bridge).toEqual({
                ports: ['eth0', 'eth1']
            });
        });
    });

    describe('when it is a bond device', () => {
        const wickedConfig = {
            name: 'bond0',
            bond: {
                mode: 'balance-rr',
                miimon: { frequency: "100", "carrier-detect": "netif" },
                slaves: ['eth0', 'eth1'],
                options: 'some-option'
            },
        };

        it('sets the bonding specific properties', () => {
            const conn = createConnection(wickedConfig);
            expect(conn.bond).toEqual({
                mode: bondingMode.BALANCE_RR,
                interfaces: ['eth0', 'eth1'],
                options: 'some-option'
            });
        });
    });
});
