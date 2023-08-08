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
import {
    Card,
    CardBody,
    CardTitle,
    CardHeader,
    EmptyState,
    EmptyStateIcon,
    Text,
    TextVariants,
    Title
} from '@patternfly/react-core';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import RoutesList from './RoutesList';
import AddRoute from './AddRoute';

const _ = cockpit.gettext;

const RoutingTab = () => {
    const dispatch = useNetworkDispatch();
    const { routes } = useNetworkState();

    useEffect(() => { fetchRoutes(dispatch) }, [dispatch]);

    const routesList = routes ? Object.values(routes) : [];

    const routesNotFound = () => (
        <EmptyState>
            <EmptyStateIcon icon={InfoCircleIcon} />
            <Title headingLevel="h4" size="lg">
                {_('No user-defined routes were found.')}
            </Title>
            <AddRoute />
        </EmptyState>
    );

    if (routesList.length === 0) {
        return routesNotFound();
    }

    return (
        <Card>
            <CardHeader actions={{ actions: <AddRoute /> }}>
                <CardTitle>
                    <Text component={TextVariants.h2}>{_("User-defined Routes")}</Text>
                </CardTitle>
            </CardHeader>
            <CardBody>
                <RoutesList routes={routesList} />
            </CardBody>
        </Card>
    );
};

export default RoutingTab;
