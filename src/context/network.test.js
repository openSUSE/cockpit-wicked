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

import {
    addConnection,
    updateConnection,
    deleteConnection,
    serviceIsActive,
    actionTypes,
    resetClient
} from './network';
import interfaceType from '../lib/model/interfaceType';
import interfaceStatus from '../lib/model/interfaceStatus';
import NetworkClient from '../lib/NetworkClient';

jest.mock('../lib/NetworkClient');

describe('#addConnection', () => {
    const addConnectionMock = jest.fn(conn => Promise.resolve(conn));
    const reloadConnectionMock = jest.fn(name => Promise.resolve());

    beforeAll(() => {
        resetClient();
        NetworkClient.mockImplementation(() => {
            return {
                addConnection: addConnectionMock,
                reloadConnection: reloadConnectionMock
            };
        });
    });

    afterAll(() => {
        addConnectionMock.mockClear();
        reloadConnectionMock.mockClear();
    });

    it('asks the network client to add the connection', async () => {
        const dispatchFn = jest.fn();

        const addedConn = await addConnection(
            dispatchFn, { name: 'eth0', type: interfaceType.BRIDGE }
        );

        expect(addedConn).toEqual(expect.objectContaining({ name: 'eth0' }));
        expect(addConnectionMock).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'eth0' })
        );
        expect(reloadConnectionMock).toHaveBeenCalledWith('eth0');
    });

    it('dispatches an ADD_CONNECTION action', async () => {
        const dispatchFn = jest.fn();

        await addConnection(dispatchFn, { name: 'eth0', type: interfaceType.BRIDGE });

        expect(dispatchFn).toHaveBeenCalledWith(
            expect.objectContaining(
                {
                    type: actionTypes.ADD_CONNECTION,
                    payload: expect.objectContaining({ name: 'eth0' })
                }
            )
        );
    });

    it('updates the interface status during the process', async () => {
        const dispatchFn = jest.fn();

        await addConnection(dispatchFn, { name: 'eth0', type: interfaceType.BRIDGE });
        expect(dispatchFn).toHaveBeenCalledWith(
            expect.objectContaining(
                {
                    type: actionTypes.UPDATE_INTERFACE,
                    payload: expect.objectContaining({ name: 'eth0', status: interfaceStatus.CONFIGURING })
                }
            )
        );

        expect(dispatchFn).toHaveBeenCalledWith(
            expect.objectContaining(
                {
                    type: actionTypes.UPDATE_INTERFACE,
                    payload: expect.objectContaining({ name: 'eth0', status: interfaceStatus.READY })
                }
            )
        );
    });

    it('dispatches a CONNECTION_ERROR if something went wrong', async () => {
        const dispatchFn = jest.fn();
        const error = new Error({ message: 'something went wrong' });
        addConnectionMock.mockImplementation((conn) => { throw error });

        await addConnection(dispatchFn, { name: 'eth0', type: interfaceType.BRIDGE });

        expect(dispatchFn).toHaveBeenCalledWith(
            expect.objectContaining(
                {
                    type: actionTypes.CONNECTION_ERROR,
                    payload: expect.objectContaining({
                        error,
                        connection: expect.objectContaining({ name: 'eth0' })
                    })
                }
            )
        );
    });
});

describe('#updateConnection', () => {
    const updateConnectionMock = jest.fn(conn => Promise.resolve(conn));
    const reloadConnectionMock = jest.fn(name => Promise.resolve());

    beforeAll(() => {
        resetClient();
        NetworkClient.mockImplementation(() => {
            return {
                updateConnection: updateConnectionMock,
                reloadConnection: reloadConnectionMock
            };
        });
    });

    afterAll(() => {
        updateConnectionMock.mockClear();
        reloadConnectionMock.mockClear();
    });

    it('asks the network client to update the connection', async () => {
        const dispatchFn = jest.fn();

        const updatedConn = await updateConnection(
            dispatchFn, { name: 'eth1' }
        );

        expect(updatedConn).toEqual(expect.objectContaining({ name: 'eth1' }));
        expect(updateConnectionMock).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'eth1' })
        );
        expect(reloadConnectionMock).toHaveBeenCalledWith('eth1');
    });

    it('dispatches an UPDATE_CONNECTION action', async () => {
        const dispatchFn = jest.fn();

        await updateConnection(dispatchFn, { name: 'eth1' });

        expect(dispatchFn).toHaveBeenCalledWith(
            expect.objectContaining(
                {
                    type: actionTypes.UPDATE_CONNECTION,
                    payload: expect.objectContaining({ name: 'eth1' })
                }
            )
        );
    });

    it('updates the interface status during the process', async () => {
        const dispatchFn = jest.fn();

        await updateConnection(dispatchFn, { name: 'eth1' });

        expect(dispatchFn).toHaveBeenCalledWith(
            expect.objectContaining(
                {
                    type: actionTypes.UPDATE_INTERFACE,
                    payload: expect.objectContaining({ name: 'eth1', status: interfaceStatus.CONFIGURING })
                }
            )
        );

        expect(dispatchFn).toHaveBeenCalledWith(
            expect.objectContaining(
                {
                    type: actionTypes.UPDATE_INTERFACE,
                    payload: expect.objectContaining({ name: 'eth1', status: interfaceStatus.READY })
                }
            )
        );
    });

    it('dispatches a CONNECTION_ERROR if something went wrong', async () => {
        const dispatchFn = jest.fn();
        const error = new Error({ message: 'something went wrong' });
        updateConnectionMock.mockImplementation((conn) => { throw error });

        await updateConnection(dispatchFn, { name: 'eth0' });

        expect(dispatchFn).toHaveBeenCalledWith(
            expect.objectContaining(
                {
                    type: actionTypes.CONNECTION_ERROR,
                    payload: expect.objectContaining({
                        error,
                        connection: expect.objectContaining({ name: 'eth0' })
                    })
                }
            )
        );
    });
});

describe('#deleteConnection', () => {
    const deleteConnectionMock = jest.fn(conn => Promise.resolve(conn));
    const setDownConnectionMock = jest.fn(name => Promise.resolve());

    beforeAll(() => {
        resetClient();
        NetworkClient.mockImplementation(() => {
            return {
                deleteConnection: deleteConnectionMock,
                setDownConnection: setDownConnectionMock
            };
        });
    });

    afterAll(() => {
        deleteConnectionMock.mockClear();
        setDownConnectionMock.mockClear();
    });

    it('asks the network client to delete the connection', async () => {
        const dispatchFn = jest.fn();

        await deleteConnection(dispatchFn, { name: 'eth0' });

        expect(deleteConnectionMock).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'eth0' })
        );
        expect(setDownConnectionMock).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'eth0' })
        );
    });

    it('dispatches an DELETE_CONNECTION action', async () => {
        const dispatchFn = jest.fn();

        await deleteConnection(dispatchFn, { name: 'eth0' });

        expect(dispatchFn).toHaveBeenCalledWith(
            expect.objectContaining(
                {
                    type: actionTypes.DELETE_CONNECTION,
                    payload: expect.objectContaining({ name: 'eth0' })
                }
            )
        );
    });

    it('updates the interface status during the process', async () => {
        const dispatchFn = jest.fn();

        await deleteConnection(dispatchFn, { name: 'eth0' });

        expect(dispatchFn).toHaveBeenCalledWith(
            expect.objectContaining(
                {
                    type: actionTypes.UPDATE_INTERFACE,
                    payload: expect.objectContaining({ name: 'eth0', status: interfaceStatus.CONFIGURING })
                }
            )
        );

        expect(dispatchFn).toHaveBeenCalledWith(
            expect.objectContaining(
                {
                    type: actionTypes.UPDATE_INTERFACE,
                    payload: expect.objectContaining({ name: 'eth0', status: interfaceStatus.READY })
                }
            )
        );
    });

    it('dispatches a CONNECTION_ERROR if something went wrong', async () => {
        const dispatchFn = jest.fn();
        const error = new Error({ message: 'something went wrong' });
        deleteConnectionMock.mockImplementation((conn) => { throw error });

        await deleteConnection(dispatchFn, { name: 'eth0' });

        expect(dispatchFn).toHaveBeenCalledWith(
            expect.objectContaining(
                {
                    type: actionTypes.CONNECTION_ERROR,
                    payload: expect.objectContaining({
                        error,
                        connection: expect.objectContaining({ name: 'eth0' })
                    })
                }
            )
        );
    });
});

describe('#serviceIsActive', () => {
    const isActiveMock = jest.fn();

    beforeAll(() => {
        resetClient();
        NetworkClient.mockImplementation(() => {
            return {
                isActive: isActiveMock
            };
        });
    });

    it('returns true if the service is active', async () => {
        isActiveMock.mockImplementation(() => Promise.resolve(true));
        const isActive = await serviceIsActive();
        expect(isActive).toBe(true);
    });

    it('returns false if the service is inactive', async () => {
        isActiveMock.mockImplementation(() => false);
        const isActive = await serviceIsActive();
        expect(isActive).toBe(false);
    });

    it('returns false if something went wrong', async () => {
        const error = new Error('unknown error');
        isActiveMock.mockImplementation(() => { throw error });
        const isActive = await serviceIsActive();
        expect(isActive).toBe(false);
    });
});
