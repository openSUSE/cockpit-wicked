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

import { IfcfgFile, SysconfigParser } from './files';
import { createConnection } from '../model';
import interfaceType from '../model/interfaceType';
import bootProtocol from '../model/bootProtocol';
import cockpit from 'cockpit';

const conn = createConnection({
    name: 'eth0',
    type: interfaceType.ETHERNET
});
const replaceFn = jest.fn();
const ifcfg = new IfcfgFile('/tmp/ifcfg-eth0');

describe('IfcfgFile', () => {
    describe('#update', () => {
        beforeAll(() => {
            cockpit.file = jest.fn(() => {
                return { replace: replaceFn };
            });
        });

        it('updates file content', () => {
            ifcfg.update(conn);
            expect(replaceFn).toHaveBeenCalledWith({
                BOOTPROTO: 'none',
                NAME: 'eth0',
                STARTMODE: 'auto'
            });
        });

        describe('when it contains multiple addresses', () => {
            const conn = createConnection({
                name: 'eth0', type: interfaceType.ETHERNET, ipv4: {
                    bootProto: bootProtocol.DHCP,
                    addresses: [
                        { address: '192.168.1.100/24' }, { address: '10.0.0.1/10', label: 'private' },
                        { address: '10.0.0.2/10' }
                    ]
                }, ipv6: {
                    bootProto: bootProtocol.DHCP,
                    addresses: [
                        { address: '2001:0db4:95b3:0000:0000:8a2e:0370:9335' }
                    ]
                }
            });

            it('includes all the addresses and their labels', () => {
                ifcfg.update(conn);
                expect(replaceFn).toHaveBeenCalledWith(expect.objectContaining({
                    BOOTPROTO: 'dhcp',
                    IPADDR: '192.168.1.100/24',
                    IPADDR_1: '10.0.0.1/10',
                    LABEL_1: 'private',
                    IPADDR_2: '10.0.0.2/10',
                    IPADDR_3: '2001:0db4:95b3:0000:0000:8a2e:0370:9335'
                }));
            });
        });

        describe('when it is a bridge device', () => {
            const conn = createConnection({
                name: 'br0', type: interfaceType.BRIDGE, bridge: { ports: ['eth0', 'eth1'] }
            });

            it('includes bridge settings', () => {
                ifcfg.update(conn);
                expect(replaceFn).toHaveBeenCalledWith(expect.objectContaining({
                    BRIDGE: 'yes',
                    BRIDGE_PORTS: 'eth0 eth1'
                }));
            });
        });

        describe('when it is a bonding device', () => {
            const conn = createConnection({
                name: 'br0', type: interfaceType.BONDING,
                bond: { interfaces: ['eth0', 'eth1'], options: 'some-option' }
            });

            it('includes bonding settings', () => {
                ifcfg.update(conn);
                expect(replaceFn).toHaveBeenCalledWith(expect.objectContaining({
                    BONDING_MASTER: 'yes',
                    BONDING_SLAVE_0: 'eth0',
                    BONDING_SLAVE_1: 'eth1',
                    BONDING_MODULE_OPTS: 'mode=active-backup some-option'
                }));
            });
        });
    });
});

describe('SysconfigParser', () => {
    const parser = new SysconfigParser();
    const data = {
        BOOTPROTO: 'dhcp',
        NAME: 'eth0'
    };

    describe('#stringify', () => {
        it('returns a string in sysconfig place', () => {
            expect(parser.stringify(data)).toEqual(
                "BOOTPROTO=\"dhcp\"\nNAME=\"eth0\"\n"
            );
        });

        describe('when some value is undefined', () => {
            const data = {
                BOOTPROTO: undefined,
                NAME: 'eth0'
            };

            it('does not include in the file', () => {
                expect(parser.stringify(data)).toEqual("NAME=\"eth0\"\n");
            });
        });
    });
});
