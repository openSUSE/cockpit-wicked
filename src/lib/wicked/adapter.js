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
import { SysconfigFile, IfcfgFile, IfrouteFile } from './files';

/**
 * This class is responsible for retrieving and updating wicked's configuration.
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
     * Return the wicked's service name
     *
     * @return {string} wicked's service name
     */
    serviceName() {
        return 'wicked';
    }

    /**
     * Return a promise that resolves to an array of model Connection objects.
     *
     * @return {Promise.<Array.<Connection>>} Promise that resolves to a list of interfaces
     */
    async connections() {
        const conns = await this.client.getConfigurations() || [];
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
                    name: c.name, type: c.type, virtual: true, link: false, managed: true
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
            // Do not trust in the calculated managed value. When changing an interface
            // status the `client_state` element might be missing.
            const { managed, ...newIface } = createInterface(data);
            fn(signal, newIface);
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

    /*
     * Obtains the DNS global settings from /etc/sysconfig/network/config
     */
    async dnsSettings() {
        const filePath = `/etc/sysconfig/network/config`;
        const file = new SysconfigFile(filePath);
        await file.read();
        const policy = file.getKey("NETCONFIG_DNS_POLICY", "");
        const nameServers = file.getKey("NETCONFIG_DNS_STATIC_SERVERS", "").split(" ")
                .filter(Boolean);
        const searchList = file.getKey("NETCONFIG_DNS_STATIC_SEARCHLIST", "").split(" ")
                .filter(Boolean);

        return model.createDnsSettings({ policy, nameServers, searchList });
    }

    /**
     * Write the DNS global settings to /etc/sysconfig/network/config
     *
     * @return {Promise} Result of the operation
     */
    async updateDnsSettings({ policy, nameServers, searchList }) {
        const filePath = `/etc/sysconfig/network/config`;
        const file = new SysconfigFile(filePath);
        await file.read();
        file.setKey("NETCONFIG_DNS_POLICY", policy);
        file.setKey("NETCONFIG_DNS_STATIC_SERVERS", nameServers.join(" "));
        file.setKey("NETCONFIG_DNS_STATIC_SEARCHLIST", searchList.join(" "));
        return file.write();
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
                    .then(() => resolve(connection))
                    .catch(reject);
        });
    }

    /**
     * Remove a given connection from Wicked
     *
     * @param {Connection} connection - Connection to be removed
     * @return {Promise} Result of the operation
     */
    deleteConnection(connection) {
        return new Promise((resolve, reject) => {
            this.deleteConnectionConfig(connection)
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
                    .then(() => resolve(connection))
                    .catch(reject);
        });
    }

    /**
     * Set Up a connection
     *
     * @throws will throw an error if something goes wrong
     */
    setUpConnection(connection) {
        return this.client.setUpConnection(connection.name);
    }

    /**
     * Set Up a connection
     *
     * @throws will throw an error if something goes wrong
     */
    setDownConnection(connection) {
        return this.client.setDownConnection(connection.name);
    }

    /**
     * Reload a connection
     *
     * @throws will throw an error if something goes wrong
     */
    async reloadConnection(name) {
        return this.client.reloadConnection(name);
    }

    /**
     * Update route files
     *
     * @param {Object.<string|number, module/model/routes~Route} routes - routes to update
     * @return {Promise<Connection,Error>} Promise that resolve to the added connection
     */
    async updateRoutes(routes) {
        const NO_DEVICE_KEY = "none";

        // Include all known interfaces to ensure successful deletions
        const ifaces = await this.interfaces();
        const ifacesNames = ifaces.map(i => i.name);
        const keys = [NO_DEVICE_KEY, ...ifacesNames];
        const routesByDevice = Object.fromEntries(keys.map(k => [k, []]));

        // Collect routes by device
        Object.values(routes).forEach((route) => {
            const device = route.device || NO_DEVICE_KEY;
            // It could be possible to receive routes for an unknown interface
            routesByDevice[device] ||= [];
            routesByDevice[device].push(route);
        });

        // Write route files
        const promises = [];
        Object.keys(routesByDevice)
                .forEach(k => {
                    const device = k === NO_DEVICE_KEY ? undefined : k;
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
    async updateConnectionConfig(connection) {
        const filePath = `/etc/sysconfig/network/ifcfg-${connection.name}`;
        const file = new IfcfgFile(filePath);
        await file.read();
        file.update(connection);
        return file.write();
    }

    /**
     * Delete the configuration file of a connection
     *
     * @param {Connection} connection - Connection to update
     * @return {Promise} Result of the operation
     */
    deleteConnectionConfig(connection) {
        const filePath = `/etc/sysconfig/network/ifcfg-${connection.name}`;
        const file = new IfcfgFile(filePath);
        return file.remove();
    }
}

export default WickedAdapter;
