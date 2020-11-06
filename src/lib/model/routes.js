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

let routeIndex = 0;

/**
 * @typedef {Object} Route
 * @property {boolean} isDefault - Whether the route is the default one
 * @property {string} destination - Destination network (?)
 * @property {string} gateway - Gateway
 * @property {string} interface - Name of the interface associated to this connection
 * @property {string} options - Additional options like metric
 */

/**
 * @function
 *
 * Returns an object representing a route
 *
 * @param {object} args - Route properties
 * @param {boolean} args.isDefault - Whether the route is a default one
 * @param {string} args.destination - Destination network
 * @param {string} args.gateway - Gateway
 * @param {string} args.device - Name of the interface associated to this connection
 * @param {string} args.options - Additional options like metric
 * @return {Route} Route object
 */

export const createRoute = ({ isDefault, destination, gateway, device, options } = {}) => {
    return {
        id: routeIndex++,
        isDefault,
        destination,
        gateway,
        device,
        options
    };
};
