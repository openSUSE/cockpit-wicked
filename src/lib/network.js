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

import cockpit from 'cockpit';

const KEYS_MAP = {
    Default: "isDefault",
    Interface: "device"
};

const dataKeyFromDBus = (key) => {
    return KEYS_MAP[key] || key.charAt(0).toLowerCase() + key.slice(1);
};

const dataKeyToDBus = (key) => {
    return Object.keys(KEYS_MAP).find((k) => KEYS_MAP[k] === key) || key.charAt(0).toUpperCase() + key.slice(1);
};

const dataFromDBus = (data) => {
    return Object.keys(data).reduce((obj, key) => {
        const newKey = dataKeyFromDBus(key);

        return { ...obj, [newKey]: data[key].v };
    }, {});
};

const dataToDBus = (data) => {
    return Object.keys(data).reduce((obj, key) => {
        if (data[key] === undefined) return obj;

        const newValue = valueVariant(data[key]);
        const newKey = dataKeyToDBus(key);

        return { ...obj, [newKey]: newValue };
    }, {});
};

const valueVariant = (value) => {
    if (value instanceof Array) {
        return cockpit.variant('av', value.map(dataToDBus));
    } else if (typeof value === 'object' && value !== null) {
        return cockpit.variant('a{sv}', dataToDBus(value));
    } else if (typeof value === 'number') {
        return cockpit.variant('i', value);
    } else if (typeof value === 'boolean') {
        return cockpit.variant('b', value);
    } else {
        return cockpit.variant('s', value);
    }
};

// TODO: reduce duplication in get* methods
export class NetworkClient {
    /**
     * Returns the list of available connection configurations
     *
     * @returns {Promise<Array|Error>} Resolves to an array of objects in case of success
     */
    getConnections() {
        return new Promise((resolve, reject) => {
            const client = cockpit.dbus("org.opensuse.YaST2.Network");
            client.call("/org/opensuse/YaST2/Network",
                        "org.opensuse.YaST2.Network", "GetConnections")
                    .then(result => resolve(result[0].map(dataFromDBus)))
                    .catch(reject);
        });
    }

    /**
     * Returns the list of available interfaces
     *
     * @returns {Promise<Array|Error>} Resolves to an array of objects in case of success
     */
    getInterfaces() {
        return new Promise((resolve, reject) => {
            const client = cockpit.dbus("org.opensuse.YaST2.Network");
            client.call("/org/opensuse/YaST2/Network", "org.opensuse.YaST2.Network", "GetInterfaces")
                    .then(result => resolve(result[0].map(dataFromDBus)))
                    .catch(reject);
        });
    }

    /**
    * Returns the list of configured routes
    *
    * @returns {Promise<Array|Error>} Resolves to an array of objects in case of success
    */
    getRoutes() {
        return new Promise((resolve, reject) => {
            const client = cockpit.dbus("org.opensuse.YaST2.Network");
            client.call("/org/opensuse/YaST2/Network", "org.opensuse.YaST2.Network", "GetRoutes")
                    .then(result => resolve(result[0].map(dataFromDBus)))
                    .catch(reject);
        });
    }

    /**
     * Update connections
     *
     * @param {Array<Object>} connections - List of connections to update
     * @returns {Promise<Array|Error>} Resolves to an array of connection objects in case of success
     */
    updateConnections(connections) {
        const dbusConnections = Object.values(connections).map(dataToDBus);

        return new Promise((resolve, reject) => {
            const client = cockpit.dbus("org.opensuse.YaST2.Network");
            client.call("/org/opensuse/YaST2/Network", "org.opensuse.YaST2.Network", "UpdateConnections", [dbusConnections])
                    .then(result => resolve(result[0].map(dataFromDBus)))
                    .catch(reject);
        });
    }

    /**
     * Update routes
     *
     * @param {Array<Object>} connections - List of routes to update
     * @returns {Promise<Array|Error>} Resolves to an array of connection objects in case of success
     */
    updateRoutes(routes) {
        const dbusRoutes = routes.map(dataToDBus);

        return new Promise((resolve, reject) => {
            const client = cockpit.dbus("org.opensuse.YaST2.Network");
            client.call("/org/opensuse/YaST2/Network", "org.opensuse.YaST2.Network", "UpdateRoutes", [dbusRoutes])
                    .then(result => resolve(result[0].map(dataFromDBus)))
                    .catch(reject);
        });
    }

    getEssidList(iface) {
        return new Promise((resolve, reject) => {
            const link_up = `ip link set ${iface} ip`;
            const scan = `iwlist ${iface} scan`;
            const grep_and_cut_essid = "/usr/bin/grep ESSID | /usr/bin/cut -d':' -f2 | /usr/bin/cut -d'\"' -f2";
            const sort = "/usr/bin/sort -u";

            cockpit.spawn(["bash", "-c", `${link_up} && ${scan} | ${grep_and_cut_essid} | ${sort}`], { superuser: true });
        });
    }
}
