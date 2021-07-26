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

import model from '../model';
import { typeFromWicked } from './utils';

/**
 * Set of factory functions to convert JSON data from Wicked into model interface objects.
 *
 * @module wicked/interfaces
 * @see module:model
 */

/**
 * Creates an interface from a Wicked interface
 *
 * @function createInterface(iface)
 *
 * @param {object} iface - Interface data from Wicked
 * @return {Interface} Interface model object
 */
const createInterface = (iface) => {
    const {
        name, addresses: assignedAddresses, client_state, status = ""
    } = iface.interface;
    const description = "";

    const ethtool = iface.ethtool || {};
    const { driver_info } = ethtool;
    const link = status.split(", ").includes("link-up");
    const driver = driver_info?.driver;

    const mac = iface?.ethernet?.address;
    const type = typeFromWicked(iface);

    const addresses = (assignedAddresses || []).map(model.createAddressConfig);

    const managed = !!client_state?.config?.origin;

    return model.createInterface({
        name, description, type, driver, mac, virtual: false, link, addresses, managed
    });
};

export {
    createInterface
};
