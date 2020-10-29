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
 * This class is responsible for retrieving and transforming the information needed from Wicked.
 */
export default class Adapter {
    constructor(client) {
        this.client = client || new Client();
    }

    connections() {
        return new Promise((resolve, _reject) => {
            this.client.getConfigurations()
                  .then(configurations => {
                      // TODO: memoize connections into _connections (?)
                      resolve(configurations.map(createConnection));
                  });
        });
    }

    interfaces() {
        return new Promise((resolve, _reject) => {
            this.client.getInterfaces()
                .then(interfaces => {
                    resolve(interfaces.map(createInterface));
                })
        });
    }

}
