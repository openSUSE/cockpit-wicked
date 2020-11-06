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

import addressType from './addressType';

let addressConfigIndex = 0;

/**
 * @typedef {Object} AddressConfig
 * @property {string} type - Address type ('IPv4' or 'IPv6')
 * @property {string} local - Local IP address
 * @property {string} label - IP label
 */

/**
 * @function
 *
 * Returns an address configuration object
 *
 * @param {object} args - Configuration attributes
 * @param {string} args.type - Address type ('IPv4' or 'IPv6')
 * @param {string} args.local - Local IP address
 * @param {string} args.label - IP label
 * @return {AddressConfig}
 * @todo The IP address deserves its own type
 */
export const createAddressConfig = ({
    type,
    local,
    label = ""
} = {}) => {
    if (!type) {
        type = local ? addressType.from(local) : addressType.IPV4;
    }

    return {
        id: addressConfigIndex++,
        type,
        local,
        label
    };
};
