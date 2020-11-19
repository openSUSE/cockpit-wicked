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

import {
    SET_CONNECTIONS,
    ADD_CONNECTION,
    UPDATE_CONNECTION,
    DELETE_CONNECTION
} from './actions';

export function connectionsReducer(state, action) {
    switch (action.type) {
    case SET_CONNECTIONS: {
        return action.payload.reduce((all, connData) => {
            const conn = createConnection(connData);
            return { ...all, [conn.id]: conn };
        }, {});
    }

    case ADD_CONNECTION: {
        const conn = action.payload;
        return { ...state, [conn.id]: conn };
    }

    case UPDATE_CONNECTION: {
        const conn = action.payload;
        return { ...state, [conn.id]: conn };
    }

    case DELETE_CONNECTION: {
        const conn = action.payload;
        const { [conn.id]: _value, ...connections } = state;

        return connections;
    }

    default: {
        return state;
    }
    }
}
