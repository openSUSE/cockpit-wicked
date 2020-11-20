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

import { IfcfgFile, SysconfigParser, SysconfigFile } from './files';
import model from '../model';
import interfaceType from '../model/interfaceType';
import bootProtocol from '../model/bootProtocol';
import cockpit from 'cockpit';

const conn = model.createConnection({
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
            expect(ifcfg.get('BOOTPROTO')).toEqual('dhcp');
            expect(ifcfg.get('NAME')).toEqual('eth0');
            expect(ifcfg.get('STARTMODE')).toEqual('auto');
        });

        describe('when it contains multiple addresses', () => {
            const conn = model.createConnection({
                name: 'eth0', type: interfaceType.ETHERNET, ipv4: {
                    bootProto: bootProtocol.DHCP,
                    addresses: [
                        { local: '192.168.1.100/24' }, { local: '10.0.0.1/10', label: 'private' },
                        { local: '10.0.0.2/10' }
                    ]
                }, ipv6: {
                    bootProto: bootProtocol.DHCP,
                    addresses: [
                        { local: '2001:0db4:95b3:0000:0000:8a2e:0370:9335' }
                    ]
                }
            });

            it('includes all the addresses and their labels', () => {
                ifcfg.update(conn);
                expect(ifcfg.get('BOOTPROTO')).toEqual('dhcp');
                expect(ifcfg.get('IPADDR')).toEqual('192.168.1.100/24');
                expect(ifcfg.get('IPADDR_1')).toEqual('10.0.0.1/10');
                expect(ifcfg.get('LABEL_1')).toEqual('private');
                expect(ifcfg.get('IPADDR_2')).toEqual('10.0.0.2/10');
                expect(ifcfg.get('IPADDR_3')).toEqual('2001:0db4:95b3:0000:0000:8a2e:0370:9335');
            });
        });

        describe('when it is a bridge device', () => {
            const conn = model.createConnection({
                name: 'br0', type: interfaceType.BRIDGE, bridge: { ports: ['eth0', 'eth1'] }
            });

            it('includes bridge settings', () => {
                ifcfg.update(conn);
                expect(ifcfg.get('BRIDGE')).toEqual('yes');
                expect(ifcfg.get('BRIDGE_PORTS')).toEqual('eth0 eth1');
            });
        });

        describe('when it is a bonding device', () => {
            const conn = model.createConnection({
                name: 'br0', type: interfaceType.BONDING,
                bond: { interfaces: ['eth0', 'eth1'], options: 'some-option' }
            });

            it('includes bonding settings', () => {
                ifcfg.update(conn);
                expect(ifcfg.get('BONDING_MASTER')).toEqual('yes');
                expect(ifcfg.get('BONDING_SLAVE_0')).toEqual('eth0');
                expect(ifcfg.get('BONDING_SLAVE_1')).toEqual('eth1');
                expect(ifcfg.get('BONDING_MODULE_OPTS')).toEqual('mode=active-backup some-option');
            });
        });
    });
});

describe('SysconfigParser', () => {
    const parser = new SysconfigParser();
    const lines = [
        { key: 'BOOTPROTO', value: 'dhcp' },
        { comment: '# Infer the name from the file name' },
        { key: 'NAME', value: 'eth0', commented: true },
    ];

    describe('#stringify', () => {
        it('returns a string in sysconfig place', () => {
            expect(parser.stringify(lines)).toEqual(
                "BOOTPROTO=\"dhcp\"\n# Infer the name from the file name\n# NAME=\"eth0\"\n"
            );
        });
    });

    describe('#parse', () => {
        const content = [
            '## Type: boolean',
            '## Default: "no"',
            '',
            'DEBUG="yes"',
            '#LOG_LEVEL="info"',
            'MTU=1500',
            'LINK_REQUIRED=',
            'ZONE=""'
        ].join('\n');

        it('returns an array containing one object for each line', () => {
            expect(parser.parse(content)).toEqual([
                { comment: '## Type: boolean' },
                { comment: '## Default: "no"' },
                { comment: '' },
                { key: 'DEBUG', value: 'yes', commented: false },
                { key: 'LOG_LEVEL', value: 'info', commented: true },
                { key: 'MTU', value: '1500', commented: false },
                { key: 'LINK_REQUIRED', value: '', commented: false },
                { key: 'ZONE', value: '', commented: false }
            ]);
        });
    });
});

describe('SysconfigFile', () => {
    const fileContent = [
        { key: 'NAME', value: 'eth0', commented: true },
        { key: 'BOOTPROTO', value: 'dhcp', commented: false }
    ];

    const readFn = () => {
        return new Promise((resolve, reject) => {
            process.nextTick(() => {
                resolve([...fileContent]);
            });
        });
    };

    const replaceFn = jest.fn();

    const file = new SysconfigFile('/tmp/foo/bar');

    describe('get', () => {
        beforeAll(() => {
            cockpit.file = jest.fn(() => {
                return { read: readFn, replace: replaceFn };
            });
        });

        it('returns the value for the given key', async () => {
            await file.read();
            expect(file.get('NAME')).toBeUndefined();
            expect(file.get('BOOTPROTO')).toEqual('dhcp');
            expect(file.get('STARTMODE')).toBeUndefined();
        });
    });

    describe('set', () => {
        beforeAll(() => {
            cockpit.file = jest.fn(() => {
                return { read: readFn, replace: replaceFn };
            });
        });

        it('sets the value for a given key', async () => {
            await file.read();
            file.set('NAME', 'eth0');
            file.set('BOOTPROTO', undefined);
            file.set('STARTMODE', 'ifplugd');

            expect(file.get('NAME')).toEqual('eth0');
            expect(file.get('BOOTPROTO')).toBeUndefined();
            expect(file.get('STARTMODE')).toEqual('ifplugd');
        });
    });

    describe('update', () => {
        it('updates multiple values', async () => {
            await file.read();
            file.update({
                NAME: 'eth0',
                BOOTPROTO: undefined,
                STARTMODE: 'ifplugd',
                IPADDR: ''
            });

            expect(file.get('NAME')).toEqual('eth0');
            expect(file.get('BOOTPROTO')).toBeUndefined();
            expect(file.get('STARTMODE')).toEqual('ifplugd');
            expect(file.get('IPADDR')).toEqual('');
        });
    });

    describe('write', () => {
        it('writes the values to the file', async () => {
            await file.read();
            file.update({
                NAME: 'eth0',
                BOOTPROTO: undefined,
                STARTMODE: 'ifplugd',
                IPADDR: ''
            });
            file.write();

            expect(replaceFn).toHaveBeenCalledWith([
                { key: 'NAME', value: 'eth0', commented: false },
                { key: 'BOOTPROTO', value: 'dhcp', commented: true },
                { key: 'STARTMODE', value: 'ifplugd', commented: false },
                { key: 'IPADDR', value: '', commented: false }
            ]);
        });
    });
});
