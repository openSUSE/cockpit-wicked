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
 * @typedef {Object} DnsSettings
 * @property {string} policy - Merge policy
 * @property {Array<string>} searchList - Domain names used for host-name lookup
 * @property {Array<string>} nameServers - Nameserver IP addresses to use for host-name lookup
 */

/**
 * @function
 *
 * Returns an object representing the global DNS settings
 *
 * @param {string}  args.policy - Name
 * @param {Array<string>} args.searchList - Domain names list
 * @param {Array<string>} args.nameServers - Whether the connection was loaded from the system or not
 *
 * @return {DnsSettings} DnsSettings object
 */
export const createDnsSettings = ({
    policy = "",
    searchList = [],
    nameServers = []
}) => {
    return {
        policy,
        searchList: searchList,
        nameServers: nameServers
    };
};
