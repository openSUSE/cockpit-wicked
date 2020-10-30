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

import React, { useState } from 'react';
import { isValid, parseCIDR } from "ipaddr.js";
import { TextInput, ValidatedOptions } from '@patternfly/react-core';

import cockpit from 'cockpit';

const _ = cockpit.gettext;

/**
 *
 * Check if an IP is valid
 *
 * Sadly, the ipaddr.js library do not validate IPs with "192.168.1.1/32"
 * notation.
 *
 *    * https://github.com/whitequark/ipaddr.js/issues/13
 *    * https://github.com/whitequark/ipaddr.js/issues/25
 *
 * @param {string} value - An IP Address
 * @return {boolean} true if given IP is valid; false otherwise.
 */
const isValidIP = (value) => {
    const [ip, cidr] = value.split("/");

    if (!cidr) return isValid(ip);

    try {
        parseCIDR(value);
        return true;
    } catch {
        return false;
    }
};

const IPInput = ({ placeholder, onError, ...props }) => {
    const [validated, setValidated] = useState("default");

    return (
        <TextInput
            placeholder={ placeholder || _("IP Address")}
            validated={ValidatedOptions[validated]}
            onFocus={(e) => setValidated("default")}
            onBlur={(e) => {
                const value = e.target.value;

                if (value === "" || isValidIP(value)) {
                    return;
                }

                setValidated("error");
                onError(value);
            }}
            {...props}
        />
    );
};

export default IPInput;
