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

const transformDBusData = (data) => {
    return Object.keys(data).reduce((obj, key) => {
        const newKey = key.charAt(0).toLowerCase() + key.slice(1);
        return { ...obj, [newKey]: data[key].v };
    }, {});
};

export class NetworkClient {
    /**
     * Returns the list of available connection configurations
     *
     * @returns {Promise<Array|Error>} Resolves to an array of objects in case of success
     */
    getConnections() {
        return new Promise((resolve, reject) => {
            const client = cockpit.dbus("org.opensuse.YaST2.Network");
            client.call("/org/opensuse/YaST2/Network", "org.opensuse.YaST2.Network", "GetConnections")
                    .then(result => resolve(result[0].map(transformDBusData)))
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
                    .then(result => resolve(result[0].map(transformDBusData)))
                    .catch(reject);
        });
    }
}
