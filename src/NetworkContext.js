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

const NetworkStateContext = React.createContext();
const NetworkDispatchContext = React.createContext();

// TODO: document and test this context.

function networkReducer(state, action) {
    switch (action.type) {
    case 'set_interfaces': {
        const interfaces = action.payload.reduce((all, iface) => {
            return { ...all, [iface.name]: iface };
        }, {});
        return { ...state, interfaces };
    }

    case 'set_connections': {
        const connections = action.payload.reduce((all, conn) => {
            return { ...all, [conn.name]: conn };
        }, {});
        return { ...state, connections };
    }

    case 'set_routes': {
        return { ...state, routes: action.payload };
    }

    case 'add_interface': {
        const { interfaces } = state;
        const { name } = action.payload;
        return { ...state, interfaces: { ...interfaces, [name]: action.payload } };
    }

    case 'update_connection': {
        const { name, changes } = action.payload;
        const { connections } = state;
        const conn = connections[name];
        return { ...state, connections: { ...connections, [name]: { ...conn, ...changes, modified: true } } };
    }

    default: {
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
    useNetworkDispatch
};
