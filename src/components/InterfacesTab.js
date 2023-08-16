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
import UnmanagedInterfacesList from './UnmanagedInterfacesList';
import AddConnectionMenu from './AddConnectionMenu';
import cockpit from 'cockpit';
import {
    useNetworkDispatch, useNetworkState, fetchInterfaces, fetchConnections, listenToInterfacesChanges
} from '../context/network';
import { Card, CardBody, CardHeader, CardTitle, Text, TextVariants } from '@patternfly/react-core';

const _ = cockpit.gettext;

const InterfacesTab = () => {
    const dispatch = useNetworkDispatch();
    const { interfaces, connections } = useNetworkState();

    useEffect(() => {
        fetchConnections(dispatch);
        fetchInterfaces(dispatch);
        listenToInterfacesChanges(dispatch);
    }, [dispatch]);

    const managedInterfacesList = interfaces ? Object.values(interfaces).filter((i) => i.managed || !i.virtual) : [];
    const unmanagedInterfacesList = interfaces ? Object.values(interfaces).filter((i) => !managedInterfacesList.includes(i)) : [];
    const connectionsList = connections ? Object.values(connections) : [];

    const renderUnmanagedInterfaces = () => {
        if (unmanagedInterfacesList.length === 0) return;

        return (
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Text component={TextVariants.h2}>{_("Unmanaged Interfaces")}</Text>
                    </CardTitle>
                </CardHeader>
                <CardBody>
                    <UnmanagedInterfacesList interfaces={unmanagedInterfacesList} />
                </CardBody>
            </Card>
        );
    };

    return (
        <>
            <Card>
                <CardHeader actions={{ actions: <AddConnectionMenu /> }}>
                    <CardTitle>
                        <Text component={TextVariants.h2}>{_("Interfaces")}</Text>
                    </CardTitle>
                </CardHeader>
                <CardBody>
                    <InterfacesList interfaces={managedInterfacesList} connections={connectionsList} />
                </CardBody>
            </Card>
            { renderUnmanagedInterfaces() }
        </>
    );
};

export default InterfacesTab;
