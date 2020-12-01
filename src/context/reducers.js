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

import { createConnection } from '../lib/model/connections';
import { createInterface } from '../lib/model/interfaces';
import { createRoute } from '../lib/model/routes';
import interfaceStatus from '../lib/model/interfaceStatus';
import actionTypes from './actionTypes';

export function connectionsReducer(state, action) {
    switch (action.type) {
    case actionTypes.SET_CONNECTIONS: {
        return action.payload.reduce((all, connData) => {
            const conn = createConnection(connData);
            return { ...all, [conn.id]: conn };
        }, {});
    }

    case actionTypes.ADD_CONNECTION: {
        const conn = action.payload;
        return { ...state, [conn.id]: conn };
    }

    case actionTypes.UPDATE_CONNECTION: {
        const conn = action.payload;
        return { ...state, [conn.id]: conn };
    }

    case actionTypes.DELETE_CONNECTION: {
        const conn = action.payload;
        const { [conn.id]: _value, ...connections } = state;

        return connections;
    }

    default: {
        return state;
    }
    }
}

export function interfacesReducer(state, action) {
    switch (action.type) {
    case actionTypes.SET_INTERFACES: {
        return action.payload.reduce((all, ifaceData) => {
            const iface = createInterface(ifaceData);
            return { ...all, [iface.id]: iface };
        }, {});
    }

    case actionTypes.UPDATE_INTERFACE: {
        const { name } = action.payload;
        const oldIface = Object.values(state).find(i => i.name === name);
        if (!oldIface) return state;

        // FIXME: we need to keep the old ID. Perhaps we should consider how we are handled the IDs.
        return {
            ...state,
            [oldIface.id]: { ...oldIface, ...action.payload, id: oldIface.id }
        };
    }

    case actionTypes.ADD_CONNECTION: {
        const conn = action.payload;

        // Configuring an existing iface?
        let iface = Object.values(state).find((i) => i.name === conn.name);

        // or just adding a new one?
        iface ||= createInterface({ name: conn.name, type: conn.type, managed: true });

        return {
            ...state,
            [iface.id]: { ...iface, status: interfaceStatus.CHANGING, error: null }
        };
    }

    case actionTypes.UPDATE_CONNECTION: {
        const { name } = action.payload;
        const iface = Object.values(state).find(i => i.name === name);
        return {
            ...state,
            [iface.id]: { ...iface, status: interfaceStatus.CHANGING, error: null }
        };
    }

    case actionTypes.DELETE_CONNECTION: {
        const conn = action.payload;
        const iface = Object.values(state).find(i => i.name === conn.name);

        if (!conn.virtual) {
            return {
                ...state,
                [iface.id]: { ...iface, status: interfaceStatus.CHANGING, error: null }
            };
        }

        const { [iface.id]: _ivalue, ...interfaces } = state;
        return interfaces;
    }

    case actionTypes.CONNECTION_ERROR: {
        const { connection: { name }, error: { message } } = action.payload;
        const iface = Object.values(state).find(i => i.name === name);
        return {
            ...state, [iface.id]: { ...iface, error: message, status: interfaceStatus.ERROR }
        };
    }

    default: {
        return state;
    }
    }
}

export function routesReducer(state, action) {
    switch (action.type) {
    case actionTypes.SET_ROUTES: {
        return action.payload.reduce((all, routeData) => {
            const route = createRoute(routeData);
            return { ...all, [route.id]: route };
        }, {});
    }

    case actionTypes.UPDATE_ROUTES: {
        return { ...action.payload };
    }

    default: {
        return state;
    }
    }
}

export function dnsReducer(state, action) {
    switch (action.type) {
    case actionTypes.SET_DNS: {
        return action.payload;
    }

    default: {
        return state;
    }
    }
}
