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
import { act, screen, getByLabelText } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { resetClient } from '../context/network';
import { createInterface } from '../lib/model/interfaces';
import { createRoute } from '../lib/model/routes';
import RoutingTab from './RoutingTab';
import { customRender } from '../tests';

import NetworkClient from '../lib/NetworkClient';

jest.mock('../lib/NetworkClient');

describe('RoutingTab', () => {
    const defaultRoute = createRoute({ destination: '192.168.2.0/24', gateway: '192.168.2.1' });
    const getRoutesMock = jest.fn(() => Promise.resolve([defaultRoute]));

    beforeAll(() => {
        resetClient();
        NetworkClient.mockImplementation(() => {
            return {
                getRoutes: getRoutesMock,
                updateRoutes: jest.fn()
            };
        });
    });

    test('list routes', async() => {
        act(() => {
            customRender(<RoutingTab />, { value: { routes: [] } });
        });

        expect(await screen.findByRole('row', { name: '192.168.2.0/24 192.168.2.1' })).toBeInTheDocument();
    });

    test('add a default route', async() => {
        act(() => {
            customRender(<RoutingTab />, { value: { routes: [] } });
        });

        expect(await screen.findByText('192.168.2.1')).toBeInTheDocument();
        userEvent.click(screen.getByRole('button', { name: 'Add Route' }));

        expect(await screen.findByRole('dialog')).toBeInTheDocument();

        const dialog = screen.getByRole('dialog');
        userEvent.type(getByLabelText(dialog, /gateway/i), '192.168.1.1');
        userEvent.type(getByLabelText(dialog, /destination/i), '192.168.1.0/24');
        userEvent.click(screen.getByRole('button', { name: 'Add' }));
        expect(await screen.findByText('192.168.1.1')).toBeInTheDocument();
    });
});
