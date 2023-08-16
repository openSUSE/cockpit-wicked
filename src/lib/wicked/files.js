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
import wirelessAuthMode from '../model/wirelessAuthMode';

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
        ...vlanToSysconfig(connection.vlan),
        ...wirelessToSysconfig(connection.wireless)
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

const wirelessAuthToSysconfig = (wireless) => {
    const attrsAuthMode = {
        [wirelessAuthMode.WPA_PSK]: {
            WIRELESS_WPA_PSK: wireless.password
        },
        [wirelessAuthMode.WPA_EAP]: {
            WIRELESS_EAP_MODE: wireless.eapMode,
            WIRELESS_EAP_AUTH: wireless.eapAuth,
            WIRELESS_WPA_PASSWORD: wireless.password
        }
    };

    return attrsAuthMode[wireless.authMode];
};

const wirelessToSysconfig = (wireless) => {
    if (wireless === undefined) return {};

    const authAttributes = wirelessAuthToSysconfig(wireless);

    return {
        WIRELESS_AP_SCANMODE: '1',
        WIRELESS_AUTH_MODE: wireless.authMode,
        WIRELESS_ESSID: wireless.essid,
        WIRELESS_MODE: wireless.mode,
        ...authAttributes
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
 * @typedef {Object} SysconfigFileLine
 * @property {string} comment - Comment content. The whole line is considered a comment.
 * @property {string} key - Variable name
 * @property {object} value - Variable value
 * @property {boolean} commented - Whether the line is commented (used only when key/value are present)
 */

/**
 * Parser to read/write the configuration data
 *
 * @todo Add support for reading the content.
 */
class SysconfigParser {
    /**
     * Returns the text representation of the file content
     *
     * @param {Array<SysconfigFileLine>} lines - List of objects representing each line
     * @see parse
     */
    stringify(lines) {
        const textLines = lines.reduce((all, line) => {
            if (line.removed) {
                return all;
            } else if (line.comment !== undefined) {
                return [...all, line.comment];
            } else {
                const { key, value, commented } = line;
                const newLine = `${key}="${value}"`;
                return [...all, commented ? `# ${newLine}` : newLine];
            }
        }, []);
        // make sure to have a newline at the end of the file
        if (lines.length !== 0 && lines[lines.length - 1].added) textLines.push('');

        return textLines.join("\n");
    }

    /**
     * Returns the content of the file as an array of objects
     *
     * The object is different depending on the content. If it is a comment,
     * it only has a 'comment' key with the content as value:
     *
     *   { comment: "## Type: integer" }
     *
     * If it is a key/value pair, the object contains a pair of 'key'
     * and 'value' keys.
     *
     *   { key: "AUTO6_WAIT_AT_BOOT", value: "" }
     *
     * @param {string} text - File content
     * @return {Array<SysconfigFileLine>} An array of objects describing each line
     */
    parse(text) {
        // eslint-disable-next-line prefer-regex-literals
        const keyValueLine = new RegExp(/^ *(#)? *([A-Za-z_0-9]+) *= *"?([^"]*)"?/);

        const lines = text.split(/\r?\n/);
        return lines.reduce((content, line) => {
            const matches = line.match(keyValueLine);
            if (matches === null) {
                return [...content, { comment: line, added: false }];
            } else {
                return [...content, {
                    key: matches[2], value: matches[3], commented: (matches[1] === '#'), added: false
                }];
            }
        }, []);
    }
}

/**
 * Class that represents a sysconfig configuration file
 *
 * This is a quite limited class that does not do any conversion type and does not know
 * about arrays (like IPADDR_1, IPADDR_2, etc.).
 */
class SysconfigFile {
    /**
     * @param {string} path - File path
     */
    constructor(path) {
        this.path = path;
        this.data = [];
    }

    read() {
        const file = cockpit.file(this.path, { syntax: new SysconfigParser(), superuser: "require" });
        return new Promise((resolve, reject) => {
            file.read()
                    .then(content => {
                        if (content) this.data = content;
                        resolve(this);
                    })
                    .catch(reject);
        });
    }

    /**
     * Get the value for a given variable
     *
     * @param {string} key - Variable name
     * @param {*} [defaultValue] - Default value in case of not found value
     * @return {string|*} - Variable value or defaultValue if not found
     */
    getKey(key, defaultValue) {
        const line = this.data.find(l => l.key === key);
        return (line && !line.commented && !line.removed) ? line.value : defaultValue;
    }

    removeKey(key) {
        const line = this.data.find(l => l.key === key);
        if (line) line.removed = true;
    }

    /**
     * Set the value for a given variable
     *
     * @param {string} key - Variable name
     * @param {string,undefined} value - Value to assign to the variable
     */
    setKey(key, value) {
        const line = this.data.find(l => l.key === key);
        const someValue = (value !== undefined && value !== null);

        if (!line && someValue) {
            this.data.push({ key, value, commented: false, removed: false, added: true });
        } else if (line) {
            line.removed = false;
            if (someValue) {
                line.value = value;
                line.commented = false;
            } else {
                line.commented = true;
            }
        }
    }

    /**
     * Set values for multiple variables
     *
     * @param {Object<String,String>} values - Set of variables names and values.
     *   Values are indexed by its variable name.
     */
    update(values) {
        Object.entries(values).forEach(([k, v]) => this.setKey(k, v));
    }

    /**
     * Writes current values to the file
     *
     * @return {Promise}
     */
    write() {
        const file = cockpit.file(this.path, { syntax: new SysconfigParser(), superuser: "require" });
        return file.replace(this.data);
    }

    /**
     * Removes the file
     *
     * @return {Promise}
     */
    remove() {
        const file = cockpit.file(this.path, { superuser: "require" });
        return file.replace(null);
    }
}

/**
 * Class to handle an `ifcfg-[name]` configuration file
 */
class IfcfgFile extends SysconfigFile {
    /**
     * Update file content using the data from the given connection
     *
     * @param {Connection} connection - Connection containing the data to write to the file
     * @return {Promise<string,object>} Promise from the cockpit.file `replace()` function
     */
    update(connection) {
        const keysToRemove = /^(IPADDR|LABEL|NETMASK|PREFIXLEN|BROADCAST)/;

        this.data.forEach(line => {
            const { key } = line;
            if (key && key.match(keysToRemove)) {
                this.removeKey(key);
            }
        });

        super.update(connectionToSysconfig(connection));
    }
}

/**
 * Parser to read/write ifroute files
 *
 * @see {@link IfrouteFile}
 * @see ifroute(5) man page
 *
 * @todo Add support for writing the content.
 */
class IfrouteParser {
    parse(content) {
        // Replace multiple spaces and tabs with a single space before split the content
        const lines = content.replace(/[ |\t]+/g, ' ').split(/\n/);

        return lines.reduce((routes, line) => {
            line = line.trim();

            // Skip comments and empty lines
            if (line.startsWith("#") || line === "") return routes;

            // Remove dashes by undefined
            const columns = line.split(/\s/).map(column => column !== "-" ? column : undefined);
            let [destination, gateway, netmask, device, ...options] = columns;
            options = (options || []).join(" ");
            routes.push({ destination, gateway, netmask, device, options });

            return routes;
        }, []);
    }

    stringify(data) {
        return data.map(({ destination, gateway, netmask, options }) => {
            // The interface/device (4th column) is actually not needed because at this point routes are
            // being writing in its ifroute-<interface> file.
            return [destination, gateway, netmask, undefined, options]
                    .map(v => v || "-")
                    .join("\t");
        }).join("\n");
    }
}

/**
 * Class to handle the interface static routing files
 *
 * Files can be
 *
 *    /etc/sysconfig/network/ifroute-<interface>, and
 *    /etc/sysconfig/network/routes
 *
 * @see ifroute(5) man page
 */
class IfrouteFile {
    /**
     * @param {string} device - Interface name
     */
    constructor(device) {
        const BASE_PATH = '/etc/sysconfig/network';

        this.path = [BASE_PATH, device ? `ifroute-${device}` : "routes"].join("/");
        this.device = device;
        this.parser = new IfrouteParser();
        this.file = cockpit.file(this.path, { syntax: this.parser, superuser: "required" });
    }

    async read() {
        const content = await this.file.read();
        const result = content || [];

        if (!this.device) return result;

        return result.map((route) => {
            route.device ||= this.device;
            return route;
        });
    }

    // FIXME: to be consistent with SysconfigFile, it should not write the file, just update
    // the contents.
    async update(routes) {
        return this.file.replace(routes);
    }
}

export {
    IfcfgFile,
    IfrouteParser,
    IfrouteFile,
    SysconfigParser,
    SysconfigFile
};
