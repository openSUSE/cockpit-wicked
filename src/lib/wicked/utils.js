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

import interfaceType from '../model/interfaceType';

const PROPERTY_TO_TYPE = {
    bond: interfaceType.BONDING,
    bridge: interfaceType.BRIDGE
};

/**
 * It tries to infer the interface type from an object from Wicked
 *
 * @param {object} wickedJson - Information from Wicked (a configuration or an interface object)
 * @returns {string} Interface type
 */
const typeFromWicked = (wickedJson) => {
    const property = Object.keys(PROPERTY_TO_TYPE).find(k => wickedJson.hasOwnProperty(k));
    return property ? PROPERTY_TO_TYPE[property] : interfaceType.ETHERNET;
};

export {
    typeFromWicked
};
