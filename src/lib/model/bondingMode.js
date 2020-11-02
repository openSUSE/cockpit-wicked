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

const BALANCE_RR = 'balance-rr';
const ACTIVE_BACKUP = 'active-backup';
const BALANCE_XOR = 'balance-xor';
const BROADCAST = 'broadcast'
const DLA_802_3AD = '802.3ad'
const BALANCE_TLB = 'balance-tlb';
const BALANCE_ALB = 'balance-alb';

const values = [
    BALANCE_RR,
    ACTIVE_BACKUP,
    BALANCE_XOR,
    BROADCAST,
    DLA_802_3AD,
    BALANCE_TLB,
    BALANCE_ALB
];

const labels = {
    [BALANCE_RR]: NC_("Round Robin"),
    [ACTIVE_BACKUP]: NC_("Active Backup"),
    [BALANCE_XOR]: NC_("Balance XOR"),
    [BROADCAST]: NC_("Broadcast"),
    [DLA_802_3AD]: NC_("802.3ad Dynamic Link Aggregation"),
    [BALANCE_TLB]: NC_("Adaptive Transmit Load Balancing"),
    [BALANCE_ALB]: NC_("Adaptive Load Balancing")

};

const label = (mode) => _(labels[mode]);

export default {
    BALANCE_RR,
    ACTIVE_BACKUP,
    BALANCE_XOR,
    BROADCAST,
    DLA_802_3AD,
    BALANCE_TLB,
    BALANCE_ALB,
    label,
    values
};
