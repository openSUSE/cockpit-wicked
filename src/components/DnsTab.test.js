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
import { act, screen, getByRole, getByLabelText } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { resetClient } from '../context/network';
import { customRender } from '../../test/helpers';
import model from '../lib/model';
import DnsTab from './DnsTab';

import NetworkClient from '../lib/NetworkClient';

jest.mock('../lib/NetworkClient');

describe('DnsTab', () => {
    const dnsSettings = model.createDnsSettings({
        policy: 'auto',
        nameServers: ['8.8.8.8'],
        searchList: ['suse.com']
    });
    const getDnsSettingsMock = jest.fn(() => Promise.resolve(dnsSettings));

    beforeAll(() => {
        resetClient();
        NetworkClient.mockImplementation(() => {
            return {
                getConnections: jest.fn(() => Promise.resolve([])),
                getInterfaces: jest.fn(() => Promise.resolve([])),
                getDnsSettings: getDnsSettingsMock,
                updateDnsSettings: jest.fn(),
                onInterfaceChange: jest.fn()
            };
        });
    });

    test('inspect DNS settings', async () => {
        act(() => {
            customRender(<DnsTab />, {});
        });

        expect(await screen.findByText('auto')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'auto' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '8.8.8.8' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'suse.com' })).toBeInTheDocument();
    });

    test('change DNS settings', async () => {
        act(() => {
            customRender(<DnsTab />, {});
        });

        expect(await screen.findByText('auto')).toBeInTheDocument();
        userEvent.click(screen.getByRole('link', { name: 'auto' }));
        const dialog = await screen.findByRole('dialog');
        userEvent.type(getByLabelText(dialog, /search/i), ' foo.bar');
        userEvent.click(getByRole(dialog, 'button', { name: 'Apply' }));
        expect(await screen.findByText('suse.com foo.bar')).toBeInTheDocument();
    });
});
