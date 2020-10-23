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
import { createConnection, createInterface, createRoute } from './lib/model';

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
        const interfaces = action.payload.reduce((all, ifaceData) => {
            const iface = createInterface(ifaceData);
            return { ...all, [iface.id]: iface };
        }, {});
        return { ...state, interfaces };
    }

    case SET_CONNECTIONS: {
        const connections = action.payload.reduce((all, connData) => {
            const conn = createConnection(connData);
            return { ...all, [conn.id]: conn };
        }, {});
        return { ...state, connections };
    }

    case SET_ROUTES: {
        const routes = action.payload.reduce((all, routeData) => {
            const route = createRoute(routeData);
            return { ...all, [route.id]: route };
        }, {});

        return { ...state, routes };
    }

    case ADD_CONNECTION: {
        const { interfaces, connections } = state;
        const conn = createConnection(action.payload);
        const iface = createInterface({ name: conn.name, type: conn.type });
        return {
            ...state,
            interfaces: { ...interfaces, [iface.id]: iface },
            connections: { ...connections, [conn.id]: { ...conn, modified: true } }
        };
    }

    case ADD_ROUTE: {
        const { routes } = state;
        const route = createRoute(action.payload);
        return { ...state, routes: { ...routes, [route.id]: route } };
    }

    case UPDATE_CONNECTION: {
        const { id, changes } = action.payload;
        const { connections } = state;
        const conn = connections[id];
        // FIXME: what about updating the interface name?
        return { ...state, connections: { ...connections, [id]: { ...conn, ...changes, modified: true } } };
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
