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
            ? startMode.NFSROOT : startMode.AUTO;
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
            { type, label, address: local }
        );
    });
};

const ipConfig = (config) => {
    let addresses = [];
    let bootProto;

    if (config['ipv4:static']?.addresses) {
        addresses = addressesFromConfig(addressType.IPV4, config['ipv4:static'].addresses);
    }

    if (config['ipv4:dhcp']?.enabled === 'true') {
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
 * @return {Connection} Connection configuration model object
 */
const createConnection = (config) => {
    const { name } = config;
    const type = typeFromWicked(config);
    const mtu = config?.link?.mtu ? parseInt(config.link.mtu) : undefined;

    return model.createConnection({
        name,
        type,
        startMode: startModeFor(config),
        mtu,
        ipv4: ipConfig(config),
        bootProto: bootProtoFor(config)
    });
};

export {
    createConnection
};
