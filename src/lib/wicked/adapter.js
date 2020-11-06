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

import Client from './client';
import { createConnection } from './connections';
import { createInterface } from './interfaces';
import model from '../model';
import { IfcfgFile, IfrouteFile } from './files';

/**
 * This class is responsible for retrieving and updating Wicked's configuration.
 *
 * It relies on WickedClient to get the needed information from Wicked. However,
 * it uses the `sysconfig` files as the mechanism to modify the configuration.
 *
 * @class
 */
class WickedAdapter {
    constructor(client) {
        this.client = client || new Client();
    }

    /**
     * Return a promise that resolves to an array of model Connection objects.
     *
     * @return {Promise.<Array.<Connection>>} Promise that resolves to a list of interfaces
     */
    async connections() {
        const conns = await this.client.getConfigurations();
        return conns.map(createConnection).filter(c => c.name !== 'lo');
    }

    /**
     * Return a promise that resolves to an array of model Interface objects.
     *
     * @return {Promise.<Array.<Interface>>} Promise that resolves to a list of interfaces
     */
    async interfaces() {
        const wickedIfaces = await this.client.getInterfaces();
        const ifaces = wickedIfaces.map(createInterface).filter(i => i.name !== 'lo');

        const conns = await this.connections();
        const names = ifaces.map(i => i.name);
        conns.forEach(c => {
            if (!names.includes(c.name)) {
                const virtualInterface = model.createInterface({
                    name: c.name, type: c.type, virtual: true, link: false
                });
                ifaces.push(virtualInterface);
            }
        });

        return ifaces;
    }

    /**
     * Callback for interface changes
     *
     * @callback interfaceChangeCallback
     * @param {string} signal - The signal which caused the change.
     * @param {Interface} iface - Affected interface.
     */

    /**
     * Registers a callback to be called when an interface changes
     *
     * @param {interfaceChangeCallback} fn - Callback to be called when an interface changes
     */
    onInterfaceChange(fn) {
        this.client.onInterfaceChange((signal, iface) => {
            const data = (signal === 'deviceDelete') ? { ...iface, link: false } : iface;
            fn(signal, createInterface(data));
        });
    }

    async routes() {
        let result = await new IfrouteFile().read();

        const ifaces = await this.interfaces();

        for (const iface of ifaces) {
            const ifaceRoutes = await new IfrouteFile(iface.name).read();
            result = result.concat(ifaceRoutes);
        }

        return result;
    }

    /**
     * Add a new connection to Wicked
     *
     * @param {Connection} connection - Connection to add
     * @return {Promise<Connection,Error>} Promise that resolve to the added connection
     */
    addConnection(connection) {
        return new Promise((resolve, reject) => {
            this.updateConnectionConfig(connection)
                    .then(() => this.reloadConnection(connection.name))
                    .then(() => resolve(connection))
                    .catch(reject);
        });
    }

    /**
     * Update the configuration of a connection
     *
     * @param {Connection} connection - Connection to update
     * @return {Promise<Connection,Error>} Promise that resolve to the added connection
     */
    updateConnection(connection) {
        return new Promise((resolve, reject) => {
            this.updateConnectionConfig(connection)
                    .then(() => this.reloadConnection(connection.name))
                    .then(() => resolve(connection))
                    .catch(reject);
        });
    }

    /**
     * Update route files
     *
     *
     * @param {Array<module:model/routes~Route>} routes - routes to update
     * @return {Promise<Connection,Error>}
     */
    async updateRoutes(routes) {
        const NO_DEVICE_KEY = "none";

        const routesByDevice = routes.reduce((routes, route) => {
            const key = route.device || NO_DEVICE_KEY;
            routes[key] ||= [];
            routes[key].push(route);
            return routes;
        }, {});

        const promises = [];

        Object.keys(routesByDevice)
                .forEach(k => {
                    const device = k !== NO_DEVICE_KEY ? k : undefined;
                    const promise = new IfrouteFile(device).update(routesByDevice[k]);
                    promises.push(promise);
                });

        return Promise.all(promises);
    }

    /**
     * Update the configuration file of a connection
     *
     * @param {Connection} connection - Connection to update
     * @return {Promise<Connection,Error>} Promise that resolve to the added connection
     */
    updateConnectionConfig(connection) {
        const filePath = `/etc/sysconfig/network/ifcfg-${connection.name}`;
        const file = new IfcfgFile(filePath);
        return file.update(connection);
    }

    /**
     * Reload a connection
     *
     * @return {Promise} Result of the operation
     */
    reloadConnection(name) {
        return this.client.reloadConnection(name);
    }
}

export default WickedAdapter;
