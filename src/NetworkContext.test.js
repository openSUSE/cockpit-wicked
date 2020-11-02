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

import { addConnection, updateConnection, actionTypes } from './NetworkContext';
import model from './lib/model';
import interfaceType from './lib/model/interfaceType';
import NetworkClient from './lib/NetworkClient';

jest.mock('./lib/NetworkClient');

describe('#addConnection', () => {
    beforeAll(() => {
        NetworkClient.mockImplementation(() => {
            return {
                addConnection: (conn) => Promise.resolve(conn)
            };
        });
    });

    it('asks the network client to add the connection', () => {
        const dispatchFn = jest.fn();

        expect.assertions(1);
        return addConnection(dispatchFn, { name: 'eth0', type: interfaceType.BRIDGE })
                .then(result => {
                    expect(result).toEqual(expect.objectContaining({ name: 'eth0' }));
                });
    });
});

describe('#updateConnection', () => {
    beforeAll(() => {
        NetworkClient.mockImplementation(() => {
            return {
                updateConnection: (conn) => Promise.resolve(conn)
            };
        });
    });

    it('asks the network client to update the connection', () => {
        const dispatchFn = jest.fn();
        const conn = model.createConnection({ name: 'eth0' });

        expect.assertions(1);
        return updateConnection(dispatchFn, conn, { name: 'eth1' })
                .then(result => {
                    expect(result).toEqual(expect.objectContaining({ name: 'eth1' }));
                });
    });

    it('dispatches a UPDATE_CONNECTION action', () => {
        const dispatchFn = jest.fn();
        const conn = model.createConnection({ name: 'eth0' });

        return updateConnection(dispatchFn, conn, { name: 'eth1' })
                .then(result => {
                    expect(dispatchFn).toHaveBeenCalledWith(
                        expect.objectContaining({ type: actionTypes.UPDATE_CONNECTION })
                    );
                });
    });
});
