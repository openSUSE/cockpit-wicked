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

const NONE = 'no-encryption';
const WEP_OPEN = 'open';
const WEP_SHARED = 'sharedkey';
const WPA_PSK = 'psk';
const WPA_EAP = 'eap';

const values = [
    NONE,
    WEP_OPEN,
    WEP_SHARED,
    WPA_PSK,
    WPA_EAP
];

const labels = {
    [NONE]: NC_("No Encryption"),
    [WEP_OPEN]: NC_("WEP - Open"),
    [WEP_SHARED]: NC_("WEP - Shared Key"),
    [WPA_PSK]:  NC_("WPA-PSK (\"home\")"),
    [WPA_EAP]:  NC_("WPA-EAP (\"Enterprise\")")
};

const label = (mode) => _(labels[mode]);

export default {
    NONE,
    WEP_OPEN,
    WEP_SHARED,
    WPA_PSK,
    WPA_EAP,
    label,
    values
};
