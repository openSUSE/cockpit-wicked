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

const client = new NetworkClient();

describe("NetworkClient", () => {
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
        it("returns the list of interfaces", () => {
            expect.assertions(2);
            return client.getInterfaces().then(data => {
                expect(data).toHaveLength(4);

                const eth0 = data.find(i => i.name == 'eth0');
                expect(eth0).toEqual(
                    {
                        id: 1,
                        name: 'eth0',
                        description: '',
                        driver: 'virtio_net',
                        mac: '52:54:00:ab:66:d3',
                        type: 'eth',
                        virtual: false
                    }
                );
            });
        });
    });
});
