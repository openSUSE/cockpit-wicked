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
     * Returns a promise that resolves to an array of model Connection objects.
     *
     * @return {Promise.<Array.<Connection>>} Promise that resolves to a list of interfaces
     */
    connections() {
        return new Promise((resolve, reject) => {
            this.client.getConfigurations()
                    .then(configurations => {
                        // TODO: memoize connections into _connections (?)
                        resolve(configurations.map(createConnection));
                    });
        });
    }

    /**
     * Returns a promise that resolves to an array of model Interface objects.
     *
     * @return {Promise.<Array.<Interface>>} Promise that resolves to a list of interfaces
     */
    interfaces() {
        return new Promise((resolve, reject) => {
            this.client.getInterfaces()
                    .then(interfaces => {
                        resolve(interfaces.map(createInterface));
                    });
        });
    }
}

export default WickedAdapter;
