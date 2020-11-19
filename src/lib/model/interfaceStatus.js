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

/**
 * This enum indicates the status interface within the workflow.
 *
 * - CONFIGURING: the configuration is being updated (writing files and so on).
 * - IN_PROGRESS: the interface is changing its status (according to the configuration or on demand).
 * - READY: the interface has been configured with no error.
 * - ERROR: the interface could not be configured accoding to the configuration.
 */
const CONFIGURING = 'configuring';
const IN_PROGRESS = 'in_progress';
const READY = 'ready';
const ERROR = 'error';

const labels = {
    [CONFIGURING]: NC_('Configuring'),
    [IN_PROGRESS]: NC_('Set-up in progress'),
    [READY]: NC_('Ready'),
    [ERROR]: NC_('Error'),
};

const label = (type) => _(labels[type]);

export default {
    CONFIGURING,
    IN_PROGRESS,
    READY,
    ERROR,
    label
};
