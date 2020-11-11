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
            expect(replaceFn).toHaveBeenCalledWith({
                BOOTPROTO: 'dhcp',
                NAME: 'eth0',
                STARTMODE: 'auto'
            });
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
            const conn = model.createConnection({
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
            const conn = model.createConnection({
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
    const lines = [
        { key: 'BOOTPROTO', value: 'dhcp' },
        { comment: '# Infer the name from the file name' },
        { key: 'NAME', value: 'eth0', commented: true },
    ]

    describe('#stringify', () => {
        it('returns a string in sysconfig place', () => {
            expect(parser.stringify(lines)).toEqual(
                "BOOTPROTO=\"dhcp\"\n# Infer the name from the file name\n# NAME=\"eth0\"\n"
            );
        });
    });

    describe('#parse', () => {
        let content = '## Type: boolean\n## Default: "no"\n\n WICKED_DEBUG="yes"\n#WICKED_LOG_LEVEL=info';

        it('returns an array containing one object for each line', () => {
            expect(parser.parse(content)).toEqual([
                { comment: '## Type: boolean' },
                { comment: '## Default: "no"' },
                { comment: '' },
                { key: 'WICKED_DEBUG', value: 'yes', commented: false },
                { key: 'WICKED_LOG_LEVEL', value: 'info', commented: true }
            ]);
        });
    })
});

describe('SysconfigFile', () => {
    const fileContent = [
        { key: 'NAME', value: 'eth0', commented: true },
        { key: 'BOOTPROTO', value: 'dhcp', commented: false }
    ];

    const readFn = () => {
        return new Promise((resolve, reject) => {
            process.nextTick(() => {
                resolve(fileContent)
            });
        });
    };

    const replaceFn = jest.fn();

    const file = new SysconfigFile('/foo/bar');

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
                STARTMODE: 'ifplugd'
            });

            expect(file.get('NAME')).toEqual('eth0');
            expect(file.get('BOOTPROTO')).toBeUndefined();
            expect(file.get('STARTMODE')).toEqual('ifplugd');
        })
    });

    describe('write', () => {
        it('writes the values to the file', async () => {
            await file.read();
            file.update({
                NAME: 'eth0',
                BOOTPROTO: undefined,
                STARTMODE: 'ifplugd'
            });
            file.write();

            expect(replaceFn).toHaveBeenCalledWith([
                { key: 'NAME', value: 'eth0', commented: false },
                { key: 'BOOTPROTO', value: 'dhcp', commented: true },
                { key: 'STARTMODE', value: 'ifplugd', commented: false }
            ]);
        });
    })
});
