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
import WickedAdapter from './wicked/adapter';

/**
 * Class responsible for interacting with the network.
 *
 * This class should be the entry point when it comes to read or modify the
 * network configuration.
 */
class NetworkClient {
    constructor(adapter) {
        this.adapter = adapter || new WickedAdapter();
    }

    /**
     * Returns the list of available connection configurations
     *
     * @returns {Promise<Array|Error>} Resolves to an array of objects in case of success
     */
    getConnections() {
        return this.adapter.connections();
    }

    /**
     * Returns the list of available interfaces
     *
     * @returns {Promise<Array|Error>} Resolves to an array of objects in case of success
     */
    getInterfaces() {
        return this.adapter.interfaces();
    }

    /**
     * Returns the list of configured routes
     *
     * @returns {Promise<Array|Error>} Resolves to an array of objects in case of success
     */
    getRoutes() {
        return new Promise((resolve, reject) => resolve([]));
    }

    /**
     * Update the given connection
     *
     * It asks the network system to update the information for the given connection
     *
     * @param {Connection} Connection - Connection to update
     * @return {Promise<Connection|Error>}
     */
    updateConnection(connection) {
        return new Promise((resolve, reject) => {
            this.adapter.updateConnection(connection)
                    .then(() => resolve(connection))
                    .catch(error => {
                        console.error("Error while updating the connection:", error);
                        reject(error);
                    });
        });
    }

    /**
     * Update routes
     *
     * @param {Array<Object>} connections - List of routes to update
     * @returns {Promise<Array|Error>} Resolves to an array of connection objects in case of success
     */
    updateRoutes(routes) {
        return new Promise((resolve, reject) => resolve([]));
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

export default NetworkClient;
