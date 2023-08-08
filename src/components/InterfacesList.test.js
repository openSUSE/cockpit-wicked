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
import userEvent from '@testing-library/user-event';
import { screen } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import InterfacesList from "./InterfacesList";
import { customRender } from "../../test/helpers";
import { createInterface } from '../lib/model/interfaces';
import { createConnection } from '../lib/model/connections';
import { createAddressConfig } from '../lib/model/address';

const interfaces = [
    createInterface(
        {
            name: 'eth0',
            mac: '00:d8:23:93:14:cc',
            addresses: [createAddressConfig({ local: '192.168.8.100/24' })]
        }
    )
];

const connections = [
    createConnection({ id: 1, name: 'eth0' })
];

describe('InterfacesList', () => {
    test('shows the interfaces names and IPs', () => {
        customRender(
            <InterfacesList interfaces={interfaces} connections={connections} />
        );

        expect(screen.getByText('eth0')).toBeInTheDocument();
        expect(screen.getByText('192.168.8.100/24')).toBeInTheDocument();
    });

    test('display details', async () => {
        customRender(
            <InterfacesList interfaces={interfaces} connections={connections} />
        );

        expect(screen.getByText('00:d8:23:93:14:cc')).not.toBeVisible();
        expect(screen.getByText('On Boot')).not.toBeVisible();

        const expandButton = screen.getByRole('button', { name: 'Details' });
        userEvent.click(expandButton);
        // Updating the dom takes a while
        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(screen.getByText('00:d8:23:93:14:cc')).toBeVisible();
        expect(screen.getByText('On Boot')).toBeVisible();
    });

    test('include actions into details', async () => {
        customRender(
            <InterfacesList interfaces={interfaces} connections={connections} />
        );

        expect(screen.getByLabelText('Disable eth0')).not.toBeVisible();
        expect(screen.getByLabelText('Reset eth0')).not.toBeVisible();

        const expandButton = screen.getByRole('button', { name: 'Details' });
        userEvent.click(expandButton);

        // Updating the dom takes a while
        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(screen.getByLabelText('Disable eth0')).toBeVisible();
        expect(screen.getByLabelText('Reset eth0')).toBeVisible();
    });

    test('when the connection is not configured', () => {
        customRender(
            <InterfacesList interfaces={interfaces} connections={[]} />
        );

        expect(screen.getByText('eth0')).toBeInTheDocument();
        expect(screen.getByText('Not configured')).toBeInTheDocument();
    });
});
