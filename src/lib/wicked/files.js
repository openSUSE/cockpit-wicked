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

/**
 * Classes to deal with sysconfig network configuration files
 *
 * @module wicked/files
 */

import cockpit from 'cockpit';
import bootProtocol from '../model/bootProtocol';

/**
 * @ignore
 */
const connectionToSysconfig = (connection) => {
    return {
        NAME: connection.name,
        BOOTPROTO: bootProtoFor(connection),
        STARTMODE: connection.startMode,
        ...addressesToSysconfig(connection),
        ...bridgeToSysconfig(connection.bridge),
        ...bondToSysconfig(connection.bond),
        ...vlanToSysconfig(connection.vlan)
    };
};

const bootProtoFor = (connection) => {
    const {
        ipv4: { bootProto: ipv4Proto, addresses: ipv4Addresses },
        ipv6: { bootProto: ipv6Proto, addresses: ipv6Addresses }
    } = connection;

    if (ipv4Proto === bootProtocol.DHCP && ipv6Proto === bootProtocol.DHCP) {
        return bootProtocol.DHCP;
    } else if (ipv4Proto === bootProtocol.DHCP) {
        return bootProtocol.DHCP4;
    } else if (ipv6Proto === bootProtocol.DHCP) {
        return bootProtocol.DHCP6;
    } else if (ipv4Addresses.length > 0 || ipv6Addresses.length > 0) {
        return bootProtocol.STATIC;
    } else {
        return bootProtocol.NONE;
    }
};

const addressesToSysconfig = (connection) => {
    const ipv4 = ipToSysconfig(connection.ipv4);
    const ipv6 = ipToSysconfig(connection.ipv6, connection.ipv4.addresses.length);
    return { ...ipv4, ...ipv6 };
};

const bridgeToSysconfig = (bridge) => {
    if (bridge === undefined) return {};
    return {
        BRIDGE: 'yes',
        BRIDGE_PORTS: bridge.ports.join(' ')
        // FIXME: add stp
        // BRIDGE_STP: bridge.stp ? 'on' : 'off',
    };
};

const bondToSysconfig = (bond) => {
    if (bond === undefined) return {};
    const interfaces = bond.interfaces
            .reduce((all, iface, n) => { return { ...all, [`BONDING_SLAVE_${n}`]: iface } }, {});
    return {
        BONDING_MASTER: 'yes',
        BONDING_MODULE_OPTS: `mode=${bond.mode} ${bond.options}`,
        ...interfaces
    };
};

const ipToSysconfig = (ip, initialIndex = 0) => {
    if (ip === undefined || ip.addresses === undefined) return {};

    return ip.addresses.reduce((all, address, n) => {
        const addressIndex = n + initialIndex;
        const { local, label = "" } = address;
        const suffix = (addressIndex === 0) ? "" : `_${addressIndex}`;

        let data = { [`IPADDR${suffix}`]: local };
        if (label !== "") data = { ...data, [`LABEL${suffix}`]: label };

        return { ...all, ...data };
    }, {});
};

const vlanToSysconfig = (vlan) => {
    if (vlan === undefined) return {};
    return {
        VLAN_ID: vlan.vlanId,
        ETHERDEVICE: vlan.parentDevice
    };
};

/**
 * Parser to read/write the configuration data
 *
 * @todo Add support for reading the content.
 */
class SysconfigParser {
    stringify(data) {
        return Object
                .entries(data)
                .filter(([k, v]) => v !== undefined)
                .map(([k, v]) => `${k}="${v}"`)
                .join("\n")
                .concat("\n");
    }
}

/**
 * Class to handle an `ifcfg-[name]` configuration file
 */
class IfcfgFile {
    /**
     * @param {string} Interface's name
     */
    constructor(path) {
        this.path = path;
    }

    /**
     * Update file content using the data from the given connection
     *
     * @param {Connection} connection - Connection containing the data to write to the file
     * @return {Promise<string,object>} Promise from the cockpit.file `replace()` function
     */
    update(connection) {
        const sysconfigData = connectionToSysconfig(connection);
        const file = cockpit.file(this.path, { syntax: new SysconfigParser(), superuser: "require" });
        return file.replace(sysconfigData);
    }
}

export {
    IfcfgFile,
    SysconfigParser
};
