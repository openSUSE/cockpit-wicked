import React from 'react';
import { createConnection, mergeConnection } from '../lib/model/connections';
import { createRoute } from '../lib/model/routes';
import interfaceStatus from '../lib/model/interfaceStatus';
import NetworkClient from '../lib/NetworkClient';
import useRootReducer from '../lib/use-root-reducer';
import actionTypes from './actionTypes';

import { interfacesReducer, connectionsReducer, routesReducer, dnsReducer } from './reducers';

const NetworkStateContext = React.createContext();
const NetworkDispatchContext = React.createContext();

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
    const [state, dispatch] = useRootReducer({
        interfaces: React.useReducer(interfacesReducer, {}),
        connections: React.useReducer(connectionsReducer, {}),
        routes: React.useReducer(routesReducer, {}),
        dns: React.useReducer(dnsReducer, { searchList: [], nameServers: [] })
    });

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
 * It dispatches the actionTypes.ADD_CONNECTION action. Additionally, if it created the connection from a
 * default one (`exists: false`) the actionTypes.UPDATE_CONNECTION action will be dispatched too when the
 * NetworkClient finish its work.
 *
 * @todo Notify when something went wrong.
 *
 * @param {function} dispatch - Dispatch function
 * @param {Object} attrs - Attributes for the new connection
 * @return {Promise}
 */
async function addConnection(dispatch, attrs) {
    const addedConn = createConnection(attrs);
    dispatch({ type: actionTypes.UPDATE_INTERFACE, payload: { name: addedConn.name, status: interfaceStatus.CONFIGURING } });

    try {
        await networkClient().addConnection(addedConn);
        dispatch({ type: actionTypes.ADD_CONNECTION, payload: { ...addedConn, exists: true } });
        await networkClient().reloadConnection(addedConn.name);
        dispatch({ type: actionTypes.UPDATE_INTERFACE, payload: { name: addedConn.name, status: interfaceStatus.READY } });
    } catch (error) {
        dispatch({ type: actionTypes.CONNECTION_ERROR, payload: { error, connection: addedConn } });
    }

    return addedConn;
}

/**
 * Updates a connection using the NetworkClient
 *
 * If the update was successful, it dispatches the actionTypes.UPDATE_CONNECTION action.
 *
 * @param {function} dispatch - Dispatch function
 * @param {Connection} connection - Connection to update
 * @param {Object|Connection} changes - Changes to apply to the connection
 * @return {Promise}
 */
async function updateConnection(dispatch, connection, changes) {
    const updatedConn = mergeConnection(connection, changes);
    dispatch({ type: actionTypes.UPDATE_INTERFACE, payload: { name: updatedConn.name, status: interfaceStatus.CONFIGURING } });

    try {
        await networkClient().updateConnection(updatedConn);
        dispatch({ type: actionTypes.UPDATE_CONNECTION, payload: updatedConn });
        await networkClient().reloadConnection(updatedConn.name);
        dispatch({ type: actionTypes.UPDATE_INTERFACE, payload: { name: updatedConn.name, status: interfaceStatus.READY } });
    } catch (error) {
        dispatch({ type: actionTypes.CONNECTION_ERROR, payload: { error, connection: updatedConn } });
    }
    return updatedConn;
}

/**
 * Deletes a coonnection using the NetworkClient
 *
 * @param {function} dispatch - Dispatch function
 * @param {Connection} connection - Connection to delete
 * @return {Promise}
 */
async function deleteConnection(dispatch, connection) {
    dispatch({ type: actionTypes.UPDATE_INTERFACE, payload: { name: connection.name, status: interfaceStatus.CONFIGURING } });

    try {
        await networkClient().deleteConnection(connection);
        dispatch({ type: actionTypes.DELETE_CONNECTION, payload: connection });
        await networkClient().setDownConnection(connection);
        dispatch({ type: actionTypes.UPDATE_INTERFACE, payload: { name: connection.name, status: interfaceStatus.READY } });
    } catch (error) {
        dispatch({ type: actionTypes.CONNECTION_ERROR, payload: { error, connection } });
    }
}

/**
 * Activate/Deactivate a connection
 *
 * @param {function} dispatch - Dispatch function
 * @param {Connection} connection - Connection to activate/deactivate
 * @param {Boolean} setUp - Whether the connection should be activated (true) or deactivated (false)
 * @return {Promise}
 */
async function changeConnectionState(dispatch, connection, setUp) {
    dispatch({ type: actionTypes.UPDATE_INTERFACE, payload: { name: connection.name, status: interfaceStatus.CHANGING } });

    let result;
    try {
        if (setUp) {
            result = await networkClient().setUpConnection(connection);
        } else {
            result = await networkClient().setDownConnection(connection);
        }
    } catch (error) {
        dispatch({ type: actionTypes.CONNECTION_ERROR, payload: { error, connection } });
    }

    dispatch({ type: actionTypes.UPDATE_INTERFACE, payload: { name: connection.name, status: interfaceStatus.READY } });
    return result;
}

// FIXME
function deleteRoute(dispatch, routes, routeId) {
    const nextRoutes = routes.filter((r) => r.id !== routeId);
    networkClient().updateRoutes(nextRoutes);
    dispatch({ type: actionTypes.UPDATE_ROUTES, payload: nextRoutes });
}

// FIXME
function updateRoute(dispatch, routes, routeId, changes) {
    const route = routes[routeId];
    const nextRoutes = { ...routes, [routeId]: { ...route, ...changes } };
    networkClient().updateRoutes(nextRoutes);
    dispatch({ type: actionTypes.UPDATE_ROUTES, payload: nextRoutes });
}

// FIXME
function addRoute(dispatch, routes, attrs) {
    const route = createRoute(attrs);
    const nextRoutes = { ...routes, [route.id]: route };
    networkClient().updateRoutes(nextRoutes);
    dispatch({ type: actionTypes.UPDATE_ROUTES, payload: nextRoutes });
}

/**
 * Returns if service for interacting with network is active or not
 *
 * @return {Promise.<boolean>} Promise that resolves to true if service is active or false if not
 */
async function serviceIsActive() {
    try {
        return await networkClient().isActive();
    } catch (error) {
        return false;
    }
}

/**
 * Obtain the DNS settings using the NetworkClient
 *
 * @param {function} dispatch - Dispatch function
 */
function fetchDnsSettings(dispatch) {
    networkClient().getDnsSettings()
            .then(result => dispatch({ type: actionTypes.SET_DNS, payload: result }))
            .catch(console.error);
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
 * Fetches the list of wireless ESSIDs
 *
 * @param {string} name - Interface name
 * @return {Promise.<string[]>} List of ESSIDs.
 */
function fetchEssidList(name) {
    return networkClient().getEssidList(name);
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

async function updateDnsSettings(dispatch, changes) {
    dispatch({ type: actionTypes.SET_DNS, payload: changes });
    // FIXME: handle errors
    return await networkClient().updateDnsSettings(changes);
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
    fetchEssidList,
    serviceIsActive,
    fetchDnsSettings,
    updateDnsSettings,
    addRoute,
    updateRoute,
    deleteRoute,
    listenToInterfacesChanges,
    resetClient
};
