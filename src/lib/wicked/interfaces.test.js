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

import { createInterface } from './interfaces';

describe('#createInterface', () => {
    const wickedInterface = {
        interface: {
            name: 'eth0',
            status: 'ready, device-up, link-up, arp, broadcast, multicast',
            addresses: [
                { local: '192.168.1.101/24', broadcast: '192.168.1.155' },
                { local: 'fe80::3091:4019:f740:9b97/64' }
            ],
            client_state: {
                config: { origin: 'suse:compat:/etc/sysconfig/network/ifcfg-eth0' }
            }
        },
        ethtool: {
            driver_info: { driver: 'virtio_net' },
            link_detected: "true"
        },
        ethernet: {
            address: '52:54:00:11:22:33'
        },
    };

    it('returns an interface', () => {
        const iface = createInterface(wickedInterface);
        expect(iface).toEqual(expect.objectContaining({
            name: 'eth0',
            driver: 'virtio_net',
            mac: '52:54:00:11:22:33',
            description: '',
            type: 'eth',
            virtual: false,
            link: true,
            managed: true
        }));
    });

    it('includes the assigned addresses', () => {
        const iface = createInterface(wickedInterface);
        expect(iface.addresses).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: 'ipv4', local: '192.168.1.101/24' }),
            expect.objectContaining({ type: "ipv6", local: 'fe80::3091:4019:f740:9b97/64' })
        ]));
    });

    describe('when no origin is reported', () => {
        const wickedInterface = {
            interface: {
                name: 'eth0',
                client_state: {
                    config: { origin: '' }
                }
            }
        };

        it('sets "managed" to false', () => {
            const iface = createInterface(wickedInterface);
            expect(iface.managed).toBe(false);
        });
    });

    describe('when no client state is reported', () => {
        const wickedInterface = {
            interface: {
                name: 'eth0',
            }
        };

        it('sets "managed" to false', () => {
            const iface = createInterface(wickedInterface);
            expect(iface.managed).toBe(false);
        });
    });

    describe('when link is down', () => {
        const wickedInterface = {
            interface: {
                name: 'eth0',
                status: 'ready, device-up, arp, broadcast, multicast'
            }
        };

        it('sets "link" to false', () => {
            const iface = createInterface(wickedInterface);
            expect(iface.link).toBe(false);
        });
    });
});
