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

const connectionsFromDBus = [
    [
        {
            Description: { t: "s", v: "Ethernet Card #1" },
            Id:          { t: "i", v: 1 },
            Name:        { t: "s", v: "eth0" }
        }
    ]
];

const interfacesFromDBus = [
    [
        {
            Name: { t: "s", v: "eth0" },
            Type: { t: "s", v: "eth" }
        }
    ]
];

const dbusData = {
    GetConnections: connectionsFromDBus,
    GetInterfaces:  interfacesFromDBus
};

const dbusClient = {
    call: (object_path, iface, method) => {
        return new Promise((resolve, reject) => {
            process.nextTick(() => {
                resolve(dbusData[method]);
            });
        });
    }
}

const cockpit = {
    gettext: (text) => text,
    dbus: () => dbusClient
}

export default cockpit;
