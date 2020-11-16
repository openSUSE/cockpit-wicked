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
import { createConnection, mergeConnection } from '../lib/model/connections';
import { createInterface } from '../lib/model/interfaces';
import { createRoute } from '../lib/model/routes';
import NetworkClient from '../lib/NetworkClient';

const NetworkStateContext = React.createContext();
const NetworkDispatchContext = React.createContext();

// TODO: document and test this context.

const SET_INTERFACES = 'set_interfaces';
const SET_CONNECTIONS = 'set_connections';
const SET_ROUTES = 'set_routes';
const UPDATE_ROUTES = 'update_routes';
const ADD_CONNECTION = 'add_connection';
const DELETE_CONNECTION = 'delete_connection';
const UPDATE_CONNECTION = 'update_connection';
const UPDATE_INTERFACE = 'update_interface';

const actionTypes = {
    SET_INTERFACES,
    SET_CONNECTIONS,
    SET_ROUTES,
    UPDATE_ROUTES,
    ADD_CONNECTION,
    DELETE_CONNECTION,
    UPDATE_CONNECTION,
    UPDATE_INTERFACE
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

    case UPDATE_ROUTES: {
        return { ...state, routes: action.payload };
    }

    case ADD_CONNECTION: {
        const { interfaces, connections } = state;
        const conn = action.payload;
        const iface = createInterface({ name: conn.name, type: conn.type });
        return {
            ...state,
            interfaces: { ...interfaces, [iface.id]: iface },
            connections: { ...connections, [conn.id]: conn }
        };
    }

    case DELETE_CONNECTION: {
        const { interfaces, connections } = state;
        const conn = action.payload;
        const { [conn.id]: _value, ...nextConnections } = connections;

        if (!conn.virtual) return { ...state, connections: nextConnections };

        const iface = Object.values(interfaces).find(i => i.name === conn.name);
        const { [iface.id]: _ivalue, ...nextInterfaces } = interfaces;

        return { ...state, interfaces: nextInterfaces, connections: nextConnections };
    }

    case UPDATE_CONNECTION: {
        const { id } = action.payload;
        const { connections } = state;
        return { ...state, connections: { ...connections, [id]: action.payload } };
    }

    case UPDATE_INTERFACE: {
        const { interfaces } = state;
        const { name } = action.payload;
        const oldIface = Object.values(interfaces).find(i => i.name === name);
        if (!oldIface) return state;

        // FIXME: we need to keep the old ID. Perhaps we should consider how we are handled the IDs.
        return {
            ...state, interfaces:
            { ...interfaces, [oldIface.id]: { ...action.payload, id: oldIface.id } }
        };
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

/**
 * FIXME: needed to use a function in order to delay building the object and
 * make the tests to work
 */
let _networkClient;
const networkClient = () => {
    if (_networkClient) return _networkClient;

    _networkClient = new NetworkClient();
    return _networkClient;
};

/**
 * Creates a connection using the NetworkClient
 *
 * If the create was successful, it dispatches the ADD_CONNECTION action.
 *
 * @todo Notify when something went wrong.
 *
 * @param {function} dispatch - Dispatch function
 * @param {Object} attrs - Attributes for the new connection
 * @return {Promise}
 */
async function addConnection(dispatch, attrs) {
    const addedConn = createConnection(attrs);
    dispatch({ type: ADD_CONNECTION, payload: addedConn });
    return await networkClient().addConnection(addedConn);
}

/**
 * Updates a connection using the NetworkClient
 *
 * If the update was successful, it dispatches the UPDATE_CONNECTION action.
 *
 * @todo Notify when something went wrong.
 *
 * @param {function} dispatch - Dispatch function
 * @param {Connection} connection - Connection to update
 * @param {Object|Connection} changes - Changes to apply to the connection
 * @return {Promise}
 */
async function updateConnection(dispatch, connection, changes) {
    const updatedConn = mergeConnection(connection, changes);
    dispatch({ type: UPDATE_CONNECTION, payload: updatedConn });
    // FIXME: handle errors
    return await networkClient().updateConnection(updatedConn);
}

async function deleteConnection(dispatch, connection) {
    dispatch({ type: DELETE_CONNECTION, payload: connection });

    return await networkClient().removeConnection(connection);
}

async function changeConnectionState(dispatch, connection, setUp) {
    if (setUp) {
        return await networkClient().setUpConnection(connection);
    } else {
        return await networkClient().setDownConnection(connection);
    }
}

// FIXME
function deleteRoute(dispatch, routes, routeId) {
    const nextRoutes = routes.filter((r) => r.id !== routeId);
    networkClient().updateRoutes(nextRoutes);
    dispatch({ type: UPDATE_ROUTES, payload: nextRoutes });
}

// FIXME
function updateRoute(dispatch, routes, routeId, changes) {
    const route = routes[routeId];
    const nextRoutes = { ...routes, [routeId]: { ...route, ...changes } };
    networkClient().updateRoutes(nextRoutes);
    dispatch({ type: UPDATE_ROUTES, payload: nextRoutes });
}

// FIXME
function addRoute(dispatch, routes, attrs) {
    const route = createRoute(attrs);
    const nextRoutes = { ...routes, [route.id]: route };
    networkClient().updateRoutes(nextRoutes);
    dispatch({ type: UPDATE_ROUTES, payload: nextRoutes });
}

/**
 * Returns if service for interacting with network is active or not
 *
 * @return {Promise.<boolean>} Promise that resolves to true if service is active or false if not
 */
function serviceIsActive() {
    return networkClient().isActive()
            .then(result => result)
            .catch((error) => {
                console.error(error);
                return false;
            });
}

/**
 * Fetches the interfaces using the NetworkClient
 *
 * @param {function} dispatch - Dispatch function
 */
function fetchInterfaces(dispatch) {
    networkClient().getInterfaces()
            .then(result => dispatch({ type: actionTypes.SET_INTERFACES, payload: result }))
            .catch(console.error);
}

/**
 * Fetches the connections list using the NetworkClient
 *
 * @param {function} dispatch - Dispatch function
 */
function fetchConnections(dispatch) {
    networkClient().getConnections()
            .then(result => dispatch({ type: actionTypes.SET_CONNECTIONS, payload: result }))
            .catch(console.error);
}

/**
 * Fetches the list of routes using the NetworkClient
 *
 * @param {function} dispatch - Dispatch function
 */
function fetchRoutes(dispatch) {
    networkClient().getRoutes()
            .then(result => dispatch({ type: actionTypes.SET_ROUTES, payload: result }))
            .catch(console.error);
}

/**
 * Starts listening for interface changes
 *
 * @param {function} dispatch - Dispatch function
 */
function listenToInterfacesChanges(dispatch) {
    networkClient().onInterfaceChange((signal, iface) => {
        dispatch({ type: actionTypes.UPDATE_INTERFACE, payload: iface });
    });
}

/**
 * Resets the network client
 *
 * @ignore
 *
 * @fixme Convenience method just for testing. We need to find a better
 * way to mock the client so this function is not needed anymore.
 */
function resetClient() {
    _networkClient = undefined;
}

export {
    NetworkProvider,
    useNetworkState,
    useNetworkDispatch,
    actionTypes,
    addConnection,
    deleteConnection,
    updateConnection,
    changeConnectionState,
    fetchInterfaces,
    fetchConnections,
    fetchRoutes,
    serviceIsActive,
    addRoute,
    updateRoute,
    deleteRoute,
    listenToInterfacesChanges,
    resetClient
};
