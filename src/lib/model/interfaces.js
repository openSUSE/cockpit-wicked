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

import interfaceType from './interfaceType';

let interfaceIndex = 0;

/**
 * @typedef {Object} Interface
 * @property {string} name - Connection name
 * @property {string} description - Connection description
 * @property {string} type - Connection type (@see model/interfaceType)
 * @property {string} mac - MAC address
 * @property {string} driver - Kernel driver
 * @property {boolean} virtual - Whether the device is virtual or physical
 */

/**
 * @function
 *
 * Returns an object representing a Network interface
 *
 * @param {object} args - Interface properties
 * @param {string} args.name - Name
 * @param {string} args.description - Description
 * @param {string} args.type - Connection type ('eth', 'br', etc.)
 * @param {string} args.mac - MAC address
 * @param {string} args.driver - Kernel driver
 * @param {Array<object>} args.addresses - Assigned IP addresses
 * @return {Interface}
 */
export const createInterface = ({
    name,
    description,
    driver,
    mac,
    type = "eth",
    link = true,
    addresses = [],
    managed = false
}) => {
    const virtual = interfaceType.isVirtual(type);
    return {
        id: interfaceIndex++,
        name,
        description,
        driver,
        mac,
        type,
        virtual,
        link,
        addresses,
        managed
    };
};
