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

import NetworkClient from '../lib/NetworkClient';
import { createConnection } from '../lib/model/connections';
import { createInterface } from '../lib/model/interfaces';
import cockpit from 'cockpit';
import { fixtureFile } from '../../test/helpers';

describe("NetworkClient", () => {
    const conn = createConnection({
        name: 'eth0'
    });

    const eth0 = createInterface({
        name: 'eth0',
        driver: 'virtio_net',
    });

    const lo = createInterface({ name: 'lo' });

    const adapter = {
        connections: jest.fn(() => Promise.all([conn])),
        interfaces: jest.fn(() => Promise.all([lo, eth0]))
    };

    const client = new NetworkClient(adapter);

    describe("#getConnections", () => {
        it("returns the list of connections", () => {
            expect.assertions(1);
            return client.getConnections().then(data => {
                const conn = data[0];
                expect(conn).toEqual(
                    expect.objectContaining({ name: "eth0" })
                );
            });
        });
    });

    describe("#getInterfaces", () => {
        it("returns the list of interfaces excluding the 'loopback' one", async () => {
            const interfaces = await client.getInterfaces();
            expect(interfaces).toHaveLength(1);
            expect(interfaces[0]).toEqual(expect.objectContaining({
                name: 'eth0',
                driver: 'virtio_net'
            }));
        });
    });

    describe("#getEssidList", () => {
        const iwlist = fixtureFile('iwlist.txt');

        it("returns the list of ESSIDs", async () => {
            cockpit.spawn = jest.fn(() => Promise.resolve(iwlist));
            const essidList = await client.getEssidList('wlo1');
            expect(essidList).toEqual(["MyWifi-01", "MyWifi-02"]);
        });
    });
});
