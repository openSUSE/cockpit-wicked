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
    type: interfaceType.ETHERNET,
    bootProto: bootProtocol.DHCP
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
    });
});
