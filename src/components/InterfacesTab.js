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

import React, { useEffect } from 'react';
import InterfacesList from './InterfacesList';
import AddBridge from './AddBridge';
import SaveChanges from './SaveChanges';
import { useNetworkDispatch, useNetworkState } from '../NetworkContext';
import { Button, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { NetworkClient } from '../lib/network';

const client = new NetworkClient();

const InterfacesTab = () => {
    const dispatch = useNetworkDispatch();
    const { interfaces, connections } = useNetworkState();

    // TODO: Only 1 call should be needed to get all this information
    useEffect(() => {
        client.getInterfaces()
                .then(result => dispatch({ type: 'set_interfaces', payload: result }))
                .catch(console.error);
    }, [dispatch]);

    useEffect(() => {
        client.getConnections()
                .then(result => dispatch({ type: 'set_connections', payload: result }))
                .catch(console.error);
    }, [dispatch]);

    const interfacesList = interfaces ? Object.values(interfaces) : [];
    const connectionsList = connections ? Object.values(connections) : [];

    return (
        <>
            <Toolbar id="interfaces-toolbar">
                <ToolbarContent>
                    <ToolbarItem>
                        <AddBridge />
                    </ToolbarItem>
                    <ToolbarItem>
                        <SaveChanges />
                    </ToolbarItem>
                </ToolbarContent>
            </Toolbar>
            <InterfacesList interfaces={interfacesList} connections={connectionsList} />
        </>
    );
};

export default InterfacesTab;
