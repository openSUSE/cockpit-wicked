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

import cockpit from 'cockpit';

const _ = cockpit.gettext;
const NC_ = cockpit.noop;

const STATIC = 'static';
const DHCP = 'dhcp';
const DHCP4 = 'dhcp4';
const DHCP6 = 'dhcp6';
const AUTOIP = 'autoip';
const DHCP_AUTOIP = 'dhcp+autoip';
const NONE = 'none';

const values = [
    STATIC,
    DHCP,
    DHCP4,
    DHCP6,
    AUTOIP,
    DHCP_AUTOIP,
    NONE
];

const labels = {
    [STATIC]: NC_("Static"),
    [DHCP]: NC_("DHCP"),
    [DHCP4]: NC_("DHCPv4"),
    [DHCP6]: NC_("DHCPv6"),
    [AUTOIP]: NC_("AUTOIP"),
    [DHCP_AUTOIP]: NC_("DHCP+AUTOIP"),
    [NONE]: NC_("None")
};

const label = (proto) => _(labels[proto]);

export default {
    STATIC,
    DHCP,
    DHCP4,
    DHCP6,
    AUTOIP,
    DHCP_AUTOIP,
    NONE,
    values,
    labels
};
