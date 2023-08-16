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
 * Set of factory functions to convert JSON data from Wicked into connection model objects.
 *
 * @module wicked/connections
 * @see module:model
 */

import model from '../model';
import startMode from '../model/startMode';
import addressType from '../model/addressType';
import bootProtocol from '../model/bootProtocol';
import interfaceType from '../model/interfaceType';
import bondingMode from '../model/bondingMode';
import wirelessMode from '../model/wirelessMode';
import wirelessAuthMode from '../model/wirelessAuthMode';
import { typeFromWicked } from './utils';

const START_MODE = {
    boot: startMode.AUTO,
    hotplug: startMode.HOTPLUG,
    ifplugd: startMode.IFPLUGD,
    manual: startMode.MANUAL,
};

const startModeFor = (config) => {
    if (!config.control) return startMode.OFF;

    const { mode, boot_stage, persistent } = config.control;

    if (mode === 'boot') {
        return (boot_stage === 'localfs' && persistent === 'true')
            ? startMode.NFSROOT
            : startMode.AUTO;
    } else {
        return START_MODE[mode];
    }
};

// TODO: it only supports DHCP, static and none.
const bootProtoFor = (config) => {
    const ipv4_dhcp = config['ipv4:dhcp'];
    const ipv6_dhcp = config['ipv6:dhcp'];

    if (ipv4_dhcp?.enabled === 'true' || ipv6_dhcp?.enabled === 'true') {
        return bootProtocol.DHCP;
    } else if (config['ipv4:static'] || config['ipv6:static']) {
        return bootProtocol.STATIC;
    } else {
        return bootProtocol.NONE;
    }
};

const addressesFromConfig = (type, addresses) => {
    return addresses.map(addr => {
        const { local, label } = addr;
        return model.createAddressConfig(
            { type, local, label }
        );
    });
};

const ipConfig = (config, type = 'ipv4') => {
    let addresses = [];
    let bootProto;
    const wickedAddresses = config[`${type}:static`];
    const wickedDhcp = config[`${type}:dhcp`];

    if (wickedAddresses) {
        addresses = addressesFromConfig(addressType[type.toUpperCase()], wickedAddresses);
    }

    if (wickedDhcp?.enabled === 'true') {
        bootProto = bootProtocol.DHCP;
    } else if (addresses.length > 0) {
        bootProto = bootProtocol.STATIC;
    } else {
        bootProto = bootProtocol.NONE;
    }

    return {
        bootProto,
        addresses
    };
};

/**
 * Creates a connection from a Wicked configuration
 *
 * @function createConnection(config)
 *
 * @param {object} config - Connection configuration data from Wicked
 * @param {string} config.name - Connection name
 * @param {object} config.link - Connection link settings
 * @param {object} config.link.mtu - Connection MTU
 * @param {object} config.link.master - Master interface
 * @param {object} config.bridge - Bridge settings
 * @param {object} config.bond - Bonding settings
 * @param {object} config.vlan - Vlan settings
 * @return {Connection} Connection configuration model object
 */
const createConnection = (config) => {
    const { name } = config;
    const type = typeFromWicked(config);
    const mtu = config?.link?.mtu ? parseInt(config.link.mtu) : undefined;
    const usedBy = config?.link?.master;

    const connection = model.createConnection({
        ...config,
        name,
        type,
        startMode: startModeFor(config),
        mtu,
        ipv4: ipConfig(config, 'ipv4'),
        ipv6: ipConfig(config, 'ipv6'),
        bootProto: bootProtoFor(config),
        usedBy,
        ...propsByType(type, config)
    });

    return connection;
};

const propsByType = (type, config) => {
    const fn = propsByConnectionType[type];

    return (fn && fn(config)) || {};
};

const wirelessModeFor = (mode) => {
    if (mode === 'ad-hoc') return wirelessMode.AD_HOC;
    if (mode === 'ap') return wirelessMode.MASTER;

    return wirelessMode.MANAGED;
};

const wirelessAuthModeFor = (network) => {
    if (network.wpa_psk) return wirelessAuthMode.WPA_PSK;
    if (network.wpa_eap) return wirelessAuthMode.WPA_EAP;
    if (network.wep) {
        if (network.wep.auth_algo === "open") return wirelessAuthMode.WEP_OPEN;
        return wirelessAuthMode.WEP_SHARED;
    }

    return wirelessAuthMode.NONE;
};

const propsByAuthMode = (mode, config) => {
    const fn = propsByWirelessAuthMode[mode];

    return (fn && fn(config)) || {};
};

const propsByWirelessAuthMode = {
    // FIXME: Add pending auth modes
    [wirelessAuthMode.WPA_PSK]: ({ wpa_psk }) => {
        const { passphrase } = wpa_psk;
        return { password: passphrase };
    }
};

const networkFrom = (wireless) => wireless.networks ? wireless.networks[0] : wireless.network;

const propsByConnectionType = {
    [interfaceType.BONDING]: ({ bond }) => {
        const { slaves = [], mode = bondingMode.ACTIVE_BACKUP, options = "", miimon = { frequency: "100" } } = bond;
        const interfaces = slaves.map(i => i.device);
        const opts = [`miimon=${miimon.frequency}`, options].join(' ');
        return { bond: { interfaces, mode, options: opts } };
    },
    [interfaceType.BRIDGE]: ({ bridge }) => {
        const { ports } = bridge;
        return { bridge: { ports: ports.map(p => p.device) } };
    },
    [interfaceType.VLAN]: ({ vlan }) => {
        const { tag, device } = vlan;
        return { vlan: { parentDevice: device, vlanId: tag } };
    },
    [interfaceType.WIRELESS]: ({ wireless }) => {
        const { ap_scan } = wireless;
        const first_network = networkFrom(wireless);

        if (!first_network) return { wireless: { ap_scan } };
        const authMode = wirelessAuthModeFor(first_network);

        return {
            wireless: {
                ap_scan, authMode,
                essid: first_network.essid,
                mode: wirelessModeFor(first_network.mode),
                // FIXME: we should use and object instead of destructuring the props
                ...propsByAuthMode(authMode, first_network)
            }
        };
    }
};

export {
    createConnection
};
