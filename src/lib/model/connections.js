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
import startModeEnum from './startMode';
import bootProtocol from '../model/bootProtocol';
import bondingModeEnum from '../model/bondingMode';

let connectionIndex = 0;

/**
 * @typedef {Object} IPConf
 * @property {Array<Object>} addresses - Address configurations
 * @property {string} bootProto - Boot protocol (@see model/bootProtocol)
 */

/**
 * @typedef {Object} Connection
 * @property {string} name - Connection name
 * @property {string} description - Connection description
 * @property {string} type - Connection type (@see model/interfaceType)
 * @property {string} interfaceName - Associated interface name
 * @property {string} startMode - the connection start mode (@see model/startMode)
 * @property {IPconf} ipv4 - IPv4 configuration
 * @property {IPconf} ipv6 - IPv6 configuration
 * @property {boolean} exists - Whether the connection was loaded from the system or not
 * @property {boolean} virtual - Whether it corresponds to a virtual interface or not
 */

/**
 * @function
 *
 * Returns an object representing a connection
 *
 * @param {object}  args - Connection properties
 * @param {string}  args.name - Name
 * @param {string}  args.description - Description
 * @param {string}  args.type - Connection type (@see model/interfaceType)
 * @param {string}  args.interfaceName - Name of the interface associated to this connection
 * @param {string}  args.startMode - the connection start mode (@see model/startMode)
 * @param {IPConf}  args.ipv4 - Configuration for IPv4
 * @param {IPConf}  args.ipv6 - Configuration for IPv6
 * @param {boolean} [args.exists=true] - Whether the connection was loaded from the system or not
 *
 * @return {Connection} Connection object
 */
export const createConnection = ({
    name,
    description,
    type = interfaceType.ETHERNET,
    interfaceName,
    startMode = startModeEnum.AUTO,
    ipv4 = { addresses: [], bootProto: bootProtocol.DHCP },
    ipv6 = { addresses: [], bootProto: bootProtocol.DHCP },
    exists = true,
    ...rest
}) => {
    return {
        id: connectionIndex++,
        name,
        description,
        type,
        interfaceName,
        startMode,
        ipv4,
        ipv6,
        exists,
        virtual: interfaceType.isVirtual(type),
        ...propsByType(type, rest)
    };
};

/**
 * @function
 *
 * Returns an object representing additional properties based on the connection type
 *
 * @param {string} type - Connection type ('eth', 'br', etc.)
 * @param {object} props - Additional connection properties
 *
 * @ignore
 */
const propsByType = (type, props) => {
    const fn = propsByConnectionType[type];

    return (fn && fn(props)) || {};
};

/**
 * An object holding additional properties per connection.
 *
 * @ignore
 */
const propsByConnectionType = {
    [interfaceType.BONDING]: ({ bond = {} } = {}) => {
        const { mode = bondingModeEnum.ACTIVE_BACKUP, options = "", interfaces = [] } = bond;
        return {
            bond: {
                mode,
                options,
                interfaces
            }
        };
    },
    [interfaceType.BRIDGE]: ({ bridge = {} } = {}) => {
        const { ports = [] } = bridge;
        return {
            bridge: { ports }
        };
    },
    [interfaceType.VLAN]: ({ vlan = {} } = {}) => {
        const { vlanId = 0, parentDevice } = vlan;
        return {
            vlan: { vlanId, parentDevice }
        };
    },
    [interfaceType.WIRELESS]: ({ wireless = {} } = {}) => {
        return { wireless };
    }
};

/**
 * Updates a connection with a set of changes
 */
export const mergeConnection = (connection, changes) => {
    return { ...connection, ...changes };
};
