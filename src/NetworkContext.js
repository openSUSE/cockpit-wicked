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

import React from 'react';
import { createConnection, createInterface } from './lib/model';

const NetworkStateContext = React.createContext();
const NetworkDispatchContext = React.createContext();

// TODO: document and test this context.

const SET_INTERFACES = 'set_interfaces';
const SET_CONNECTIONS = 'set_connections';
const SET_ROUTES = 'set_routes';
const ADD_CONNECTION = 'add_connection';
const UPDATE_CONNECTION = 'update_connection';
const ADD_ROUTE = 'add_route';
const UPDATE_ROUTE = 'update_route';

const actionTypes = {
    SET_INTERFACES,
    SET_CONNECTIONS,
    SET_ROUTES,
    ADD_CONNECTION,
    UPDATE_CONNECTION,
    ADD_ROUTE,
    UPDATE_ROUTE
};

function networkReducer(state, action) {
    switch (action.type) {
    case SET_INTERFACES: {
        const interfaces = action.payload.reduce((all, iface) => {
            return { ...all, [iface.name]: createInterface(iface) };
        }, {});
        return { ...state, interfaces };
    }

    case SET_CONNECTIONS: {
        const connections = action.payload.reduce((all, conn) => {
            return { ...all, [conn.name]: createConnection(conn) };
        }, {});
        return { ...state, connections };
    }

    case SET_ROUTES: {
        return { ...state, routes: action.payload };
    }

    case ADD_CONNECTION: {
        const { interfaces } = state;
        const conn = createConnection(action.payload);
        return { ...state, interfaces: { ...interfaces, [conn.name]: conn } };
    }

    case UPDATE_CONNECTION: {
        const { name, changes } = action.payload;
        const { connections } = state;
        const conn = connections[name];
        return { ...state, connections: { ...connections, [name]: { ...conn, ...changes, modified: true } } };
    }

    default: {
        console.error("Unknown action", action.type, action.payload);
        return state;
    }
    }
}

function useNetworkState() {
    const context = React.useContext(NetworkStateContext);
    if (!context) {
        throw new Error('useNetworkState must be used within a NetworkProvider');
    }

    return context;
}

function useNetworkDispatch() {
    const context = React.useContext(NetworkDispatchContext);
    if (!context) {
        throw new Error('useNetworkDispatch must be used within a NetworkProvider');
    }

    return context;
}

function NetworkProvider({ children }) {
    const [state, dispatch] = React.useReducer(networkReducer, { interfaces: [], connections: [], routes: [] });

    return (
        <NetworkStateContext.Provider value={state}>
            <NetworkDispatchContext.Provider value={dispatch}>
                {children}
            </NetworkDispatchContext.Provider>
        </NetworkStateContext.Provider>
    );
}

export {
    NetworkProvider,
    useNetworkState,
    useNetworkDispatch,
    actionTypes

};
