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

import { createInterface } from '../lib/model/interfaces';
import interfaceStatus from '../lib/model/interfaceStatus';

import {
    SET_INTERFACES,
    UPDATE_INTERFACE,
    ADD_CONNECTION,
    UPDATE_CONNECTION,
    DELETE_CONNECTION,
    CONNECTION_ERROR
} from './actions';

export function interfacesReducer(state, action) {
    switch (action.type) {
    case SET_INTERFACES: {
        return action.payload.reduce((all, ifaceData) => {
            const iface = createInterface(ifaceData);
            return { ...all, [iface.id]: iface };
        }, {});
    }

    case UPDATE_INTERFACE: {
        const { name } = action.payload;
        const oldIface = Object.values(state).find(i => i.name === name);
        if (!oldIface) return state;

        // FIXME: we need to keep the old ID. Perhaps we should consider how we are handled the IDs.
        return {
            ...state,
            [oldIface.id]: { ...oldIface, ...action.payload, id: oldIface.id }
        };
    }

    case ADD_CONNECTION: {
        const conn = action.payload;

        // Configuring an existing iface?
        let iface = Object.values(state).find((i) => i.name === conn.name);

        // or just adding a new one?
        iface ||= createInterface({ name: conn.name, type: conn.type });

        return {
            ...state,
            [iface.id]: { ...iface, status: interfaceStatus.IN_PROGRESS }
        };
    }

    case UPDATE_CONNECTION: {
        const { name } = action.payload;
        const iface = Object.values(state).find(i => i.name === name);
        const { error, ...updatedIface } = iface;
        return {
            ...state,
            [iface.id]: { ...updatedIface, status: interfaceStatus.IN_PROGRESS }
        };
    }

    case DELETE_CONNECTION: {
        const conn = action.payload;
        const iface = Object.values(state).find(i => i.name === conn.name);

        if (!conn.virtual) {
            return {
                ...state,
                status: interfaceStatus.IN_PROGRESS
            };
        }

        const { [iface.id]: _ivalue, ...interfaces } = state;
        return interfaces;
    }

    case CONNECTION_ERROR: {
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
