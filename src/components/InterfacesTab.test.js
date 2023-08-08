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
import { act, screen, getByText } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { resetClient } from '../context/network';
import { createInterface } from '../lib/model/interfaces';
import { createConnection } from '../lib/model/connections';
import { customRender } from '../../test/helpers';
import InterfacesTab from './InterfacesTab';

import NetworkClient from '../lib/NetworkClient';

jest.mock('../lib/NetworkClient');

describe('InterfacesTab', () => {
    const getConnectionsMock = jest.fn(() => Promise.resolve([]));
    const getInterfacesMock = jest.fn(() => Promise.resolve([eth0]));
    const addConnectionMock = jest.fn(() => Promise.resolve(createConnection({ name: 'eth0' })));
    const reloadConnectionMock = jest.fn(() => Promise.resolve(true));
    const eth0 = createInterface({ name: 'eth0', link: false });

    beforeAll(() => {
        resetClient();
        NetworkClient.mockImplementation(() => {
            return {
                getConnections: getConnectionsMock,
                getInterfaces: getInterfacesMock,
                addConnection: addConnectionMock,
                reloadConnection: reloadConnectionMock,
                onInterfaceChange: jest.fn()
            };
        });
    });

    test('configure an unconfigured interface', async () => {
        act(() => {
            customRender(<InterfacesTab />);
        });

        expect(await screen.findByText('eth0')).toBeInTheDocument();

        // open the dialog and apply the default configuration
        const expandButton = screen.getByRole('button', { name: 'Details' });
        userEvent.click(expandButton);
        const configureLink = screen.getByText('Not configured');
        userEvent.click(configureLink);
        const button = await screen.findByRole('button', { name: 'Apply' });
        userEvent.click(button);

        // FIXME: the 'Configuring' text is showing on screen but the render timing
        //        is difficult to "catch" during tests
        // the interface is finally being configured
        // expect(await screen.findByText('Configuring')).toBeInTheDocument();
    });

    test('handles an error when configuring an interface', async () => {
        const error = new Error('Something went wrong');
        reloadConnectionMock.mockImplementation(() => Promise.reject(error));

        act(() => {
            customRender(<InterfacesTab />);
        });

        expect(await screen.findByText('eth0')).toBeInTheDocument();

        // open the dialog and apply the default configuration
        const expandButton = screen.getByRole('button', { name: 'Details' });
        userEvent.click(expandButton);
        const configureLink = screen.getByText('Not configured');
        userEvent.click(configureLink);
        const button = await screen.findByRole('button', { name: 'Apply' });
        userEvent.click(button);

        // notify the user about the problem
        expect(await screen.findByText(/Something went wrong/i)).toBeInTheDocument();
    });

    test('the unmanaged interfaces list is not shown when it is empty', async () => {
        act(() => {
            customRender(<InterfacesTab />);
        });

        expect(await screen.findByText('eth0')).toBeInTheDocument();
        const table = screen.queryByRole('grid', { name: /unmanaged/i });
        expect(table).toBeNull();
    });

    test('not managed interfaces are shown in the unmanaged list', async () => {
        const virbr0 = createInterface({ name: 'virbr0', link: true, managed: false, virtual: true, type: 'br' });
        getInterfacesMock.mockImplementation(() => Promise.resolve([eth0, virbr0]));

        act(() => {
            customRender(<InterfacesTab />);
        });

        expect(await screen.findByText('eth0')).toBeInTheDocument();
        const table = screen.getByRole('grid', { name: /unmanaged/i });
        expect(getByText(table, 'virbr0')).toBeInTheDocument();
    });
});
