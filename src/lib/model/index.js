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

import startModeEnum from './startMode';
import bondingModeEnum from './bondingMode';
import interfaceType from './interfaceType';
import addressType from './addressType';

let connectionIndex = 0;
let interfaceIndex = 0;
let routeIndex = 0;

/**
 * Returns an object representing a route
 *
 * @param {object} args - Route properties
 * @param {boolean} args.default - Whether the route is a default one
 * @param {string} args.destination - Destination network
 * @param {string} args.gateway - Gateway
 * @param {string} args.interface - Name of the interface associated to this connection
 * @param {string} args.options - Additional options like metric
 */

export const createRoute = ({ isDefault, destination, gateway, device, options }) => {
    return {
        id: routeIndex++,
        isDefault,
        destination,
        gateway,
        device,
        options
    };
};

/**
 * Returns an object representing a connection
 *
 * @param {object} args - Connection properties
 * @param {string} args.name - Name
 * @param {string} args.description - Description
 * @param {string} args.type - Connection type ('eth', 'br', etc.)
 * @param {string} args.bootProto - Boot protocol ('dhcp', 'static', etc.)
 * @param {string} args.interfaceName - Name of the interface associated to this connection
 * @param {string} args.addresses - Addresses configurations
 * @param {boolean} args.virtual - Whether the associated device should be virtual
 * @returns {Interface}
 */
export const createConnection = ({
    name,
    description,
    type = interfaceType.ETHERNET,
    bootProto,
    interfaceName,
    startMode = startModeEnum.AUTO,
    addresses,
    ...rest
}) => {
    return {
        id: connectionIndex++,
        name,
        description,
        type,
        bootProto,
        interfaceName,
        startMode,
        addresses,
        virtual: interfaceType.isVirtual(type),
        ...propsByType(type, rest)
    };
};

/**
 * Returns an object representing additional properties based on the connection type
 *
 * @param {string} type - Connection type ('eth', 'br', etc.)
 * @param {object} props - Additional connection properties
 */
const propsByType = (type, props) => {
    const fn = propsByConnectionType[type];

    return (fn && fn(props)) || {};
};

/**
 * An object holding additional properties per connection.
 */
const propsByConnectionType = {
    [interfaceType.BONDING]: ({ bondingMode = bondingModeEnum.ACTIVE_BACKUP, options = "" }) => {
        return {
            bondingMode,
            options
        };
    },
    [interfaceType.BRIDGE]: ({ ports = [] }) => {
        return {
            ports
        };
    }
};

/**
 * Returns an address configuration object
 *
 * @param {object} args - Configuration attributes
 * @param {string} args.type - Address type ('IPv4' or 'IPv6')
 * @param {string} args.proto - Boot protocol ('DHCP', 'STATIC', etc.)
 * @param {string} args.address - IP address
 * @param {string} args.label - IP label
 * @return {object}
 * @todo The IP address deserves its own type
 */
export const createAddressConfig = ({
    type = addressType.IPV4,
    proto = bootProtocol.STATIC,
    address,
    label = ""
}) => {
    return {
        type,
        proto,
        address,
        label
    };
};

/**
 * Returns an object representing an interface
 *
 * @param {object} args - Interface properties
 * @param {string} args.name - Name
 * @param {string} args.description - Description
 * @param {string} args.driver - Kernel driver
 * @param {string} args.type - Connection type ('eth', 'br', etc.)
 * @param {string} args.mac - MAC address
 * @param {boolean} args.virtual - Whether the device is virtual or physical
 */
export const createInterface = ({
    name,
    description,
    driver,
    mac,
    type = "eth",
}) => {
    const virtual = interfaceType.isVirtual(type);
    return {
        id: interfaceIndex++,
        name,
        description,
        driver,
        mac,
        type,
        virtual
    };
};

export default {
    createInterface,
    createConnection,
    createRoute,
    createAddressConfig
};
