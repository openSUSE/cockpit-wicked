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
 * Classes to deal with sysconfig network configuration files
 *
 * @module wicked/files
 */

import cockpit from 'cockpit';

/**
 * @ignore
 */
const connectionToSysconfig = (connection) => {
    return {
        NAME: connection.name,
        BOOTPROTO: connection.bootProto,
        STARTMODE: connection.startMode
    };
};

/**
 * Parser to read/write the configuration data
 *
 * @todo Add support for reading the content.
 */
class SysconfigParser {
    stringify(data) {
        return Object
                .entries(data)
                .map(([k, v]) => `${k}="${v}"`)
                .join("\n")
                .concat("\n");
    }
}

/**
 * Class to handle an `ifcfg-[name]` configuration file
 */
class IfcfgFile {
    /**
     * @param {string} Interface's name
     */
    constructor(path) {
        this.path = path;
    }

    /**
     * Update file content using the data from the given connection
     *
     * @param {Connection} connection - Connection containing the data to write to the file
     * @return {Promise<string,object>} Promise from the cockpit.file `replace()` function
     */
    update(connection) {
        const sysconfigData = connectionToSysconfig(connection);
        const file = cockpit.file(this.path, { syntax: new SysconfigParser(), superuser: "require" });
        return file.replace(sysconfigData);
    }
}

export {
    IfcfgFile,
    SysconfigParser
};
