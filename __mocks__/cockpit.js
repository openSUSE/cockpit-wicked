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

const fs = require('fs');
const path = require('path');

const wickedShowXml = fs.readFileSync(path.join(__dirname, 'show-xml.xml')).toString();
const wickedShowConfig = fs.readFileSync(path.join(__dirname, 'show-config.xml')).toString();

const spawnResponses = {
    '/usr/sbin/wicked show-xml': wickedShowXml,
    '/usr/sbin/wicked show-config': wickedShowConfig
};

const cockpit = {
    gettext: (text) => text,
    noop: (args) => args,
    spawn: (args) => {
        return new Promise((resolve, reject) => {
            process.nextTick(() => {
                const cmd = args.join(' ');
                const response = spawnResponses[cmd];
                resolve(response);
            });
        });
    },
    file: () => ({}),
    dbus: () => ({ subscribe: () => ({}) })
};

export default cockpit;
