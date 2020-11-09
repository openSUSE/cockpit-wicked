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

import { createConnection, mergeConnection } from './connections';
import bondingMode from './bondingMode';
import bootProtocol from './bootProtocol';
import interfaceType from './interfaceType';

describe('#createConnection', () => {
    it('creates an ethernet type connection', () => {
        const conn = createConnection({ name: 'eth0' });
        expect(conn).toEqual(expect.objectContaining({ name: 'eth0', type: 'eth' }));
    });

    it('sets IPv4 and IPv6 to DHCP', () => {
        const conn = createConnection({ name: 'eth0' });
        expect(conn.ipv4).toEqual({ addresses: [], bootProto: bootProtocol.DHCP });
        expect(conn.ipv6).toEqual({ addresses: [], bootProto: bootProtocol.DHCP });
    });

    describe('when it is a bridge device', () => {
        it('sets the default bride configuration', () => {
            const conn = createConnection({ name: 'br0', type: interfaceType.BRIDGE });
            expect(conn.bridge).toEqual({ ports: [] });
        });

        it('sets the bridge configuration to the given values', () => {
            const conn = createConnection({
                name: 'br0', type: interfaceType.BRIDGE, bridge: { ports: ['eth0'] }
            });
            expect(conn.bridge).toEqual({ ports: ['eth0'] });
        });
    });

    describe('when it is a bond device', () => {
        it('sets the default bonding configuration', () => {
            const conn = createConnection({ name: 'bond0', type: interfaceType.BONDING });
            expect(conn.bond).toEqual({
                interfaces: [], mode: bondingMode.ACTIVE_BACKUP, options: ""
            });
        });

        it('sets the bonding configuration to the given values', () => {
            const conn = createConnection({
                name: 'bond0', type: interfaceType.BONDING,
                bond: { interfaces: ['eth0'], mode: bondingMode.BALANCE_RR, options: "some-option" }
            });

            expect(conn.bond).toEqual({
                interfaces: ['eth0'], mode: bondingMode.BALANCE_RR, options: "some-option"
            });
        });
    });

    describe('when it is a vlan device', () => {
        it('sets the vlan configuration to the given values', () => {
            const conn = createConnection({
                name: 'vlan10', type: interfaceType.VLAN,
                vlan: { parentDevice: 'eth0', vlanId: 10 }
            });
            expect(conn.vlan).toEqual({ vlanId: 10, parentDevice: 'eth0' });
        });
    });
});

describe('#mergeConnection', () => {
    it('updates the connection with the given values', () => {
        const conn = createConnection({ name: 'eth0' });
        const mergedConn = mergeConnection(conn, { name: 'eth1' });
        expect(mergedConn).toEqual(expect.objectContaining({ name: 'eth1' }));
    });
});
