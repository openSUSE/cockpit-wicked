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

import { IfcfgFile, SysconfigParser, SysconfigFile, IfrouteParser, IfrouteFile } from './files';
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
            expect(ifcfg.getKey('BOOTPROTO')).toBe('dhcp');
            expect(ifcfg.getKey('NAME')).toBe('eth0');
            expect(ifcfg.getKey('STARTMODE')).toBe('auto');
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
                expect(ifcfg.getKey('BOOTPROTO')).toBe('dhcp');
                expect(ifcfg.getKey('IPADDR')).toBe('192.168.1.100/24');
                expect(ifcfg.getKey('IPADDR_1')).toBe('10.0.0.1/10');
                expect(ifcfg.getKey('LABEL_1')).toBe('private');
                expect(ifcfg.getKey('IPADDR_2')).toBe('10.0.0.2/10');
                expect(ifcfg.getKey('IPADDR_3')).toBe('2001:0db4:95b3:0000:0000:8a2e:0370:9335');
            });
        });

        describe('when there is some content', () => {
            const readFn = () => {
                return new Promise((resolve, reject) => {
                    process.nextTick(() => {
                        resolve([...fileContent]);
                    });
                });
            };

            beforeAll(() => {
                cockpit.file = jest.fn(() => {
                    return { read: readFn, replace: replaceFn };
                });
            });

            const conn = model.createConnection({
                name: 'eth0', type: interfaceType.ETHERNET
            });

            const fileContent = [
                { key: 'NAME', value: 'eth0', commented: true },
                { key: 'BOOTPROTO', value: 'dhcp', commented: false },
                { key: 'IPADDR_MYIP', value: '192.168.1.99/24' },
                { key: 'LABEL_MYIP', value: 'MYIP' },
                { key: 'UNKOWN', value: 'some value' }
            ];

            it('keeps the original values except the IP related ones', async () => {
                await ifcfg.read();
                ifcfg.update(conn);

                expect(ifcfg.getKey('NAME')).toBe('eth0');
                expect(ifcfg.getKey('UNKOWN')).toBe('some value');
                expect(ifcfg.getKey('IPADDR_MYIP')).toBeUndefined();
                expect(ifcfg.getKey('LABEL_MYIP')).toBeUndefined();
            });
        });

        describe('when it is a bridge device', () => {
            const conn = model.createConnection({
                name: 'br0', type: interfaceType.BRIDGE, bridge: { ports: ['eth0', 'eth1'] }
            });

            it('includes bridge settings', () => {
                ifcfg.update(conn);
                expect(ifcfg.getKey('BRIDGE')).toBe('yes');
                expect(ifcfg.getKey('BRIDGE_PORTS')).toBe('eth0 eth1');
            });
        });

        describe('when it is a bonding device', () => {
            const conn = model.createConnection({
                name: 'br0', type: interfaceType.BONDING,
                bond: { interfaces: ['eth0', 'eth1'], options: 'some-option' }
            });

            it('includes bonding settings', () => {
                ifcfg.update(conn);
                expect(ifcfg.getKey('BONDING_MASTER')).toBe('yes');
                expect(ifcfg.getKey('BONDING_SLAVE_0')).toBe('eth0');
                expect(ifcfg.getKey('BONDING_SLAVE_1')).toBe('eth1');
                expect(ifcfg.getKey('BONDING_MODULE_OPTS')).toBe('mode=active-backup some-option');
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
            expect(parser.stringify(lines)).toBe(
                "BOOTPROTO=\"dhcp\"\n# Infer the name from the file name\n# NAME=\"eth0\""
            );
        });

        it('includes a newline when the last line was added', () => {
            lines[lines.length - 1].added = true;
            expect(parser.stringify(lines)).toBe(
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
                { comment: '## Type: boolean', added: false },
                { comment: '## Default: "no"', added: false },
                { comment: '', added: false },
                { key: 'DEBUG', value: 'yes', added: false, commented: false },
                { key: 'LOG_LEVEL', value: 'info', added: false, commented: true },
                { key: 'MTU', value: '1500', added: false, commented: false },
                { key: 'LINK_REQUIRED', value: '', added: false, commented: false },
                { key: 'ZONE', value: '', added: false, commented: false }
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

    describe('getKey', () => {
        beforeAll(() => {
            cockpit.file = jest.fn(() => {
                return { read: readFn, replace: replaceFn };
            });
        });

        it('returns the value for the given key', async () => {
            await file.read();
            expect(file.getKey('NAME')).toBeUndefined();
            expect(file.getKey('BOOTPROTO')).toBe('dhcp');
            expect(file.getKey('STARTMODE')).toBeUndefined();
        });

        it('returns the default value if the key is not found', async () => {
            await file.read();
            expect(file.getKey('UNKNOWN', 'Some value')).toBe('Some value');
        });
    });

    describe('setKey', () => {
        beforeAll(() => {
            cockpit.file = jest.fn(() => {
                return { read: readFn, replace: replaceFn };
            });
        });

        it('sets the value for a given key', async () => {
            await file.read();
            file.setKey('NAME', 'eth0');
            file.setKey('BOOTPROTO', undefined);
            file.setKey('STARTMODE', 'ifplugd');

            expect(file.getKey('NAME')).toBe('eth0');
            expect(file.getKey('BOOTPROTO')).toBeUndefined();
            expect(file.getKey('STARTMODE')).toBe('ifplugd');
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

            expect(file.getKey('NAME')).toBe('eth0');
            expect(file.getKey('BOOTPROTO')).toBeUndefined();
            expect(file.getKey('STARTMODE')).toBe('ifplugd');
            expect(file.getKey('IPADDR')).toBe('');
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
                { key: 'NAME', value: 'eth0', commented: false, removed: false },
                { key: 'BOOTPROTO', value: 'dhcp', commented: true, removed: false },
                { key: 'STARTMODE', value: 'ifplugd', added: true, commented: false, removed: false },
                { key: 'IPADDR', value: '', added: true, commented: false, removed: false }
            ]);
        });
    });

    describe('#remove', () => {
        it('removes the file completely', async () => {
            await file.read();
            file.remove();
            expect(replaceFn).toHaveBeenCalledWith(null);
        });
    });
});

describe('IfrouteParser', () => {
    const parser = new IfrouteParser();
    const lines = [
        { destination: 'default', gateway: '192.168.1.1', netmask: '255.255.255.0' },
        { destination: '10.0.0.8', gateway: '10.163.28.1', options: 'option1' }
    ];

    describe('#stringify', () => {
        it('returns a string containing the routes in ifroute format', () => {
            expect(parser.stringify(lines)).toBe(
                "default\t192.168.1.1\t255.255.255.0\t-\t-\n10.0.0.8\t10.163.28.1\t-\t-\toption1"
            );
        });
    });

    describe('#parse', () => {
        const content = [
            "# The default route",
            "default\t192.168.1.1\t255.255.255.0\t-\t-",
            "10.0.0.8\t10.163.28.1\t-\t-\toption1"
        ].join('\n');

        it('returns an array containing one object for each route', () => {
            expect(parser.parse(content)).toEqual([
                {
                    destination: "default", device: undefined, gateway: "192.168.1.1",
                    netmask: "255.255.255.0", options: ""
                },
                {
                    destination: "10.0.0.8", device: undefined, gateway: "10.163.28.1",
                    netmask: undefined, options: "option1"
                }
            ]);
        });
    });
});

describe('IfrouteFile', () => {
    const fileContent = [
        { destination: 'default', gateway: '192.168.1.1', netmask: '255.255.255.0' },
    ];

    const readFn = () => {
        return new Promise((resolve, reject) => {
            process.nextTick(() => {
                resolve([...fileContent]);
            });
        });
    };

    const replaceFn = jest.fn();

    beforeAll(() => {
        cockpit.file = jest.fn(() => {
            return { read: readFn, replace: replaceFn };
        });
    });

    describe('constructor', () => {
        describe('when an interface is given', () => {
            it('sets the path to the specific routes file', () => {
                const file = new IfrouteFile('eth0');
                expect(file.path).toBe('/etc/sysconfig/network/ifroute-eth0');
                expect(cockpit.file).toHaveBeenCalledWith(
                    "/etc/sysconfig/network/ifroute-eth0", expect.anything()
                );
            });
        });

        describe('when no interface is given', () => {
            it('sets the path to the general routes file', () => {
                const file = new IfrouteFile();
                expect(file.path).toBe('/etc/sysconfig/network/routes');
                expect(cockpit.file).toHaveBeenCalledWith(
                    "/etc/sysconfig/network/routes", expect.anything()
                );
            });
        });
    });

    describe('#read', () => {
        it('returns an array containing the routes and including the interface', async () => {
            const file = new IfrouteFile('eth0');
            const routes = await file.read();
            expect(routes).toEqual([
                {
                    destination: 'default', gateway: '192.168.1.1', netmask: '255.255.255.0',
                    device: 'eth0'
                },
            ]);
        });
    });

    describe('#update', () => {
        it('updates the file content with the given routes', async () => {
            const file = new IfrouteFile('eth0');
            const routes = [{ destination: 'default', gateway: '192.168.1.2' }];
            await file.read();

            file.update(routes);
            expect(replaceFn).toHaveBeenCalledWith(routes);
        });
    });
});
