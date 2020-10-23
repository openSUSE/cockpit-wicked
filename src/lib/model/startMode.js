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

const AUTO = "auto";
const HOTPLUG = "hotplug";
const IFPLUGD = "ifplugd";
const MANUAL = "manual";
const NFSROOT = "nfsroot";
const OFF = "off";

const values = [
    AUTO,
    HOTPLUG,
    IFPLUGD,
    MANUAL,
    NFSROOT,
    OFF
];

const labels = {
    [AUTO]: NC_("On Boot"),
    [HOTPLUG]: NC_("On Hotplug"),
    [IFPLUGD]: NC_("On Cable Connection"),
    [MANUAL]: NC_("Manual"),
    [NFSROOT]: NC_("On NFSroot"),
    [OFF]: NC_("Never")
};

const label = (mode) => _(labels[mode]);

export default {
    AUTO,
    HOTPLUG,
    IFPLUGD,
    MANUAL,
    NFSROOT,
    OFF,
    label,
    values
};
