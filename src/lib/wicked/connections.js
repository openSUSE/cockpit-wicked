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


import model from '../model';
import interfaceType from '../model/interfaceType';
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
        return (boot_stage === 'localfs' && persistent === 'true') ?
            startMode.NFSROOT : startMode.AUTO;
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
}

const staticAddressesConfigurations = (type, addresses) => {
    return addresses.map(addr => {
        const { local, label } = addr;
        return model.createAddressConfig(
            { type, proto: bootProtocol.STATIC, address: local, label }
        );
    });
};

const addressesConfigurations = (config) => {
    let addresses = [];

    if (config['ipv4:dhcp']?.enabled === 'true') {
        addresses.push(
            model.createAddressConfig({ type: addressType.IPV4, proto: bootProtocol.DHCP })
        );
    }

    if (config['ipv6:dhcp']?.enabled === 'true') {
        addresses.push(
            model.createAddressConfig({ type: addressType.IPV6, proto: bootProtocol.DHCP })
        );
    }

    if (config['ipv4:static']?.addresses) {
        addresses = [
            ...addresses,
            ...staticAddressesConfigurations(addressType.IPV4, config['ipv4:static'].addresses)
        ];
    }

    if (config['ipv6:static']?.addresses) {
        addresses = [
            ...addresses,
            ...staticAddressesConfigurations(addressType.IPV6, config['ipv6:static'].addresses)
        ];
    }

    return addresses;
}

/**
 * Creates a connection from a Wicked configuration
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
        addresses: addressesConfigurations(config),
        bootProto: bootProtoFor(config)
    });
}

export {
    createConnection
}
