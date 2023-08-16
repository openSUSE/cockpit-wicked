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

import React from 'react';
import bootProtocol from '../lib/model/bootProtocol';

import { FormSelect, FormSelectOption } from '@patternfly/react-core';

// FIXME: These are the boot protocols supported by wicked. Improve the selector to choose them
// dynamically according to the network backend in use.
const supportedBootProtocols = [
    bootProtocol.NONE,
    bootProtocol.STATIC,
    bootProtocol.DHCP
];

const bootProtocolOptions = supportedBootProtocols.map(bootProto => {
    return { value: bootProto, label: bootProtocol.label(bootProto) };
});

const BootProtoSelector = ({ value, onChange }) => {
    return (
        <FormSelect value={value} onChange={(_e, val) => onChange(val)} id="bootProto">
            {bootProtocolOptions.map((option, index) => (
                <FormSelectOption key={option.value} value={option.value} label={option.label} />
            ))}
        </FormSelect>
    );
};

export default BootProtoSelector;
