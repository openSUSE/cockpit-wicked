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

import { interfacesReducer, connectionsReducer, routesReducer, dnsReducer } from './reducers';
import { createConnection } from '../lib/model/connections';
import { createInterface } from '../lib/model/interfaces';
import actionTypes from './actionTypes';
import interfaceType from '../lib/model/interfaceType';
import interfaceStatus from '../lib/model/interfaceStatus';
import startModeEnum from '../lib/model/startMode';

describe('connectionsReducer', () => {
    describe('SET_CONNECTIONS', () => {
        it('set the interfaces', () => {
            const action = { type: actionTypes.SET_CONNECTIONS, payload: [{ name: 'eth0' }] };
            const newState = connectionsReducer({}, action);

            expect(Object.values(newState)).toEqual([
                expect.objectContaining({ name: 'eth0', type: interfaceType.ETHERNET })
            ]);
        });
    });

    describe('ADD_CONNECTION', () => {
        it('adds a connection', () => {
            const conn = createConnection({ name: 'eth0' });
            const action = { type: actionTypes.ADD_CONNECTION, payload: conn };
            const newState = connectionsReducer({}, action);

            expect(newState).toEqual({ [conn.id]: conn });
        });
    });

    describe('UPDATE_CONNECTION', () => {
        it('updates the connection with the same id', () => {
            const conn = createConnection({ name: 'eth0' });
            const updatedConn = { ...conn, startMode: startModeEnum.OFF };
            const state = { [conn.id]: conn };
            const action = { type: actionTypes.UPDATE_CONNECTION, payload: updatedConn };
            const newState = connectionsReducer(state, action);

            expect(newState).toEqual({
                [conn.id]: expect.objectContaining({ startMode: startModeEnum.OFF })
            });
        });
    });

    describe('DELETE_CONNECTION', () => {
        it('deletes the connection with the same id', () => {
            const conn = createConnection({ name: 'eth0' });
            const state = { [conn.id]: conn };
            const action = { type: actionTypes.DELETE_CONNECTION, payload: { id: conn.id } };
            const newState = connectionsReducer(state, action);

            expect(newState).toEqual({});
        });
    });
});

describe('interfacesReducer', () => {
    describe('SET_INTERFACES', () => {
        it('set the interfaces', () => {
            const action = { type: actionTypes.SET_INTERFACES, payload: [{ name: 'eth0' }] };
            const newState = interfacesReducer({}, action);

            expect(Object.values(newState)).toEqual([
                expect.objectContaining({ name: 'eth0', type: 'eth' })
            ]);
        });
    });

    describe('UPDATE_INTERFACE', () => {
        it('replace the interface keeping the id', () => {
            const eth0 = createInterface({ name: 'eth0' });
            const newIface = createInterface({ name: 'eth0', mac: '00:12:34:56:78' });
            const state = { [eth0.id]: eth0 };
            const action = { type: actionTypes.UPDATE_INTERFACE, payload: newIface };
            const newState = interfacesReducer(state, action);

            expect(newState).toEqual({
                [eth0.id]: { ...newIface, id: eth0.id }
            });
        });

        it('returns the same state if the original interface is not found', () => {
            const newIface = createInterface({ name: 'eth0', mac: '00:12:34:56:78' });
            const action = { type: actionTypes.UPDATE_INTERFACE, payload: newIface };
            const newState = interfacesReducer({}, action);

            expect(newState).toEqual({});
        });
    });

    describe('ADD_CONNECTION', () => {
        it('sets the status to CHANGING is the interface existed', () => {
            const conn = createConnection({ name: 'eth0' });
            const eth0 = createInterface({ name: 'eth0' });
            const state = { [eth0.id]: eth0 };
            const action = { type: actionTypes.ADD_CONNECTION, payload: conn };
            const newState = interfacesReducer(state, action);

            expect(newState).toEqual({
                [eth0.id]: expect.objectContaining({ status: interfaceStatus.CHANGING, error: null })
            });
        });
    });

    describe('UPDATE_CONNECTION', () => {
        it('sets the status to CHANGING and resets the error (if any)', () => {
            const conn = createConnection({ name: 'eth0' });
            const eth0 = { ...createInterface({ name: 'eth0' }), error: 'something went wrong' };
            const state = { [eth0.id]: eth0 };
            const action = { type: actionTypes.UPDATE_CONNECTION, payload: conn };
            const newState = interfacesReducer(state, action);

            const { [eth0.id]: newIface } = newState;
            expect(newIface.status).toEqual(interfaceStatus.CHANGING);
            expect(newIface.error).toBeNull();
        });
    });

    describe('DELETE_CONNECTION', () => {
        it('sets the status to CHANGING if it is physical', () => {
            const conn = createConnection({ name: 'eth0' });
            const eth0 = createInterface({ name: 'eth0' });
            const state = { [eth0.id]: eth0 };
            const action = { type: actionTypes.DELETE_CONNECTION, payload: conn, error: null };
            const newState = interfacesReducer(state, action);

            const { [eth0.id]: newIface } = newState;
            expect(newIface.status).toEqual(interfaceStatus.CHANGING);
        });

        it('removes the interface if it was virtual', () => {
            const conn = createConnection({ name: 'br0', type: interfaceType.BRIDGE });
            const br0 = createInterface({ name: 'br0', type: interfaceType.BRIDGE });
            const state = { [br0.id]: br0 };
            const action = { type: actionTypes.DELETE_CONNECTION, payload: conn };
            const newState = interfacesReducer(state, action);

            expect(newState).toEqual({});
        });
    });

    describe('CONNECTION_ERROR', () => {
        it('sets the status to ERROR and sets the error message', () => {
            const conn = createConnection({ name: 'eth0' });
            const error = new Error('some error');
            const eth0 = createInterface({ name: 'eth0' });
            const state = { [eth0.id]: eth0 };
            const action = {
                type: actionTypes.CONNECTION_ERROR, payload: { connection: conn, error }
            };
            const newState = interfacesReducer(state, action);

            const { [eth0.id]: newIface } = newState;
            expect(newIface.status).toEqual(interfaceStatus.ERROR);
            expect(newIface.error).toBe('some error');
        });
    });
});

describe('routesReducer', () => {
    describe('SET_ROUTES', () => {
        it('set the routes', () => {
            const action = {
                type: actionTypes.SET_ROUTES, payload: [
                    { gateway: '192.168.1.1', isDefault: true }
                ]
            };
            const newState = routesReducer({}, action);

            expect(Object.values(newState)).toEqual([
                expect.objectContaining({ gateway: '192.168.1.1', isDefault: true })
            ]);
        });
    });
});

describe('dnsReducer', () => {
    describe('SET_DNS', () => {
        it('set the dns settings', () => {
            const action = { type: actionTypes.SET_DNS, payload: { nameServers: ['1.2.3.4'] } };
            const newState = dnsReducer({}, action);

            expect(newState).toEqual({ nameServers: ['1.2.3.4'] });
        });
    });
});
