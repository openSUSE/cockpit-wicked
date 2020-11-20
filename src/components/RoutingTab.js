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

import cockpit from 'cockpit';
import React, { useEffect } from 'react';
import { useNetworkDispatch, useNetworkState, fetchRoutes } from '../context/network';
import { Card, CardBody, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import RoutesList from './RoutesList';
import AddRoute from './AddRoute';

const RoutingTab = () => {
    const dispatch = useNetworkDispatch();
    const { routes } = useNetworkState();

    useEffect(() => { fetchRoutes(dispatch) }, [dispatch]);

    const routesList = routes ? Object.values(routes) : [];

    return (
        <>
            <Toolbar id="routing-toolbar">
                <ToolbarContent>
                    <ToolbarItem>
                        <AddRoute />
                    </ToolbarItem>
                </ToolbarContent>
            </Toolbar>
            <Card>
                <CardBody>
                    <RoutesList routes={routesList} />
                </CardBody>
            </Card>
        </>
    );
};

export default RoutingTab;
