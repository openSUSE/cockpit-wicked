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
import { customRender } from "../../test/helpers";
import { createInterface } from '../lib/model/interfaces';
import { createConnection } from '../lib/model/connections';
import { createAddressConfig } from '../lib/model/address';
import InterfaceActions from "./InterfaceActions";

const ifaceAttrs = { name: 'eth0', mac: '00:d8:23:93:14:cc' };
const ifaceAddr = createAddressConfig({ local: '192.168.8.100/24' });
const enableIface = createInterface({ ...ifaceAttrs, addresses: [ifaceAddr] });
const disableIface = createInterface({ ...ifaceAttrs, link: false });
const connAttrs = { id: 1, name: 'eth0' };
const systemConnection = createConnection({ ...connAttrs });
const factoryConnection = createConnection({ ...connAttrs, exists: false });

jest.mock('../lib/NetworkClient');

describe('InterfaceActions', () => {
    describe('when interface is enabled', () => {
        test('includes an action to disable it', () => {
            customRender(
                <InterfaceActions iface={enableIface} connection={systemConnection} />
            );

            expect(screen.getByLabelText('Disable eth0')).toBeInTheDocument();
        });
    });

    describe('when interface is disabled', () => {
        test('includes an action to enable it', () => {
            customRender(
                <InterfaceActions iface={disableIface} connection={systemConnection} />
            );

            expect(screen.getByLabelText('Enable eth0')).toBeInTheDocument();
        });
    });

    describe('when the connection was loaded from the system', () => {
        test('includes an action to delete/reset it', () => {
            customRender(
                <InterfaceActions iface={enableIface} connection={systemConnection} />
            );

            expect(screen.getByLabelText('Reset eth0')).toBeInTheDocument();
        });
    });

    describe('when the connection was not loaded from the system', () => {
        test('does not include an action to delete/reset it', () => {
            customRender(
                <InterfaceActions iface={enableIface} connection={factoryConnection} />
            );

            expect(screen.queryByLabelText('Reset eth0')).not.toBeInTheDocument();
        });
    });

    describe('when delete/reset action is triggered', () => {
        test('shows a confirmation dialog', () => {
            customRender(
                <InterfaceActions iface={enableIface} connection={systemConnection} />
            );

            const deleteAction = screen.getByLabelText('Reset eth0');
            userEvent.click(deleteAction);

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            // Strings are being neither, formatted nor translated during tests. See __mocks__/cockpit.js
            expect(screen.getByText(/\$action .* configuration/, { selector:  'h1' })).toBeInTheDocument();
            expect(screen.getByText('Confirm', { selector: 'button' })).toBeInTheDocument();
        });
    });
});
