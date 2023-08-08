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
import { createRoute } from '../lib/model/routes';
import RoutingTab from './RoutingTab';
import { customRender } from '../../test/helpers';

import NetworkClient from '../lib/NetworkClient';

jest.mock('../lib/NetworkClient');

describe('RoutingTab', () => {
    const getRoutesMock = jest.fn();

    beforeAll(() => {
        resetClient();
        NetworkClient.mockImplementation(() => {
            return {
                getRoutes: getRoutesMock,
                updateRoutes: jest.fn()
            };
        });
    });

    describe('when routes were not found', () => {
        beforeAll(() => {
            getRoutesMock.mockImplementation(() => Promise.resolve([]));
        });

        test('display a message', async() => {
            act(() => { customRender(<RoutingTab />) });

            const result = await screen.findByText(/No user-defined routes were found/i);
            expect(result).toBeInTheDocument();
        });

        test('add a route', async() => {
            act(() => { customRender(<RoutingTab />) });

            userEvent.click(screen.getByRole('button', { name: 'Add Route' }));

            expect(await screen.findByRole('dialog')).toBeInTheDocument();
            const dialog = screen.getByRole('dialog');
            userEvent.type(getByLabelText(dialog, /gateway/i), '192.168.1.1');
            userEvent.type(getByLabelText(dialog, /destination/i), '192.168.1.0/24');
            userEvent.click(screen.getByRole('button', { name: 'Add' }));
            expect(await screen.findByText('192.168.1.1')).toBeInTheDocument();
        });
    });

    describe('when routes were found', () => {
        beforeAll(() => {
            const route0 = createRoute({ destination: '192.168.2.0/24', gateway: '192.168.2.1' });
            getRoutesMock.mockImplementation(() => Promise.resolve([route0]));
        });

        test('list routes', async() => {
            act(() => { customRender(<RoutingTab />) });

            expect(await screen.findByRole('row', { name: '192.168.2.0/24 192.168.2.1' })).toBeInTheDocument();
        });

        test('add a route', async() => {
            act(() => { customRender(<RoutingTab />) });

            expect(await screen.findByText('192.168.2.1')).toBeInTheDocument();
            userEvent.click(screen.getByRole('button', { name: 'Add Route' }));

            expect(await screen.findByRole('dialog')).toBeInTheDocument();
            const dialog = screen.getByRole('dialog');
            userEvent.type(getByLabelText(dialog, /gateway/i), '192.168.1.1');
            userEvent.type(getByLabelText(dialog, /destination/i), '192.168.1.0/24');
            userEvent.click(screen.getByRole('button', { name: 'Add' }));
            expect(await screen.findByText('192.168.1.1')).toBeInTheDocument();
        });

        test('modify a route', async() => {
            act(() => { customRender(<RoutingTab />) });

            expect(await screen.findByText('192.168.2.1')).toBeInTheDocument();
            userEvent.click(screen.getByRole('button', { name: 'Kebab toggle' }));
            userEvent.click(screen.getByText('Edit'));

            expect(await screen.findByRole('dialog')).toBeInTheDocument();
            const dialog = screen.getByRole('dialog');
            userEvent.type(getByLabelText(dialog, /gateway/i), '{backspace}2');
            userEvent.click(screen.getByText('Change'));
            expect(await screen.findByText('192.168.2.2')).toBeInTheDocument();
        });

        test('removes a route', async() => {
            act(() => { customRender(<RoutingTab />) });

            expect(await screen.findByText('192.168.2.1')).toBeInTheDocument();
            userEvent.click(screen.getByRole('button', { name: 'Kebab toggle' }));
            userEvent.click(screen.getByText('Delete'));
            expect(screen.queryByText('192.168.2.1')).toBeNull();
        });
    });
});
