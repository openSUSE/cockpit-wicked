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

import React from "react";
import '@testing-library/jest-dom/extend-expect';
import UnmanagedInterfacesList from "./UnmanagedInterfacesList";
import { createInterface } from '../lib/model/interfaces';
import interfaceType from '../lib/model/interfaceType';
import { createAddressConfig } from '../lib/model/address';
import { customRender } from '../../test/helpers';

const interfaces = [
    createInterface(
        {
            name: 'virbr0',
            type: interfaceType.BRIDGE,
            managed: false,
            addresses: [createAddressConfig({ local: '192.168.122.1/24' })]
        }
    )
];

describe('UnmanagedInterfacesList', () => {
    test('shows the interfaces names and IPs', () => {
        const { getByText } = customRender(
            <UnmanagedInterfacesList interfaces={interfaces} />
        );

        expect(getByText('virbr0')).toBeInTheDocument();
        expect(getByText('Bridge')).toBeInTheDocument();
        expect(getByText('192.168.122.1/24')).toBeInTheDocument();
    });
});
