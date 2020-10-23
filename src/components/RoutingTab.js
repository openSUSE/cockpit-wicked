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
import React, { useState, useEffect } from 'react';
import SaveChanges from './SaveChanges';
import { NetworkClient } from '../lib/network';
import { useNetworkDispatch, useNetworkState, actionTypes } from '../NetworkContext';
import { Button, Card, CardBody, CardTitle, Toolbar, ToolbarContent, ToolbarItem, Switch } from '@patternfly/react-core';
import RoutesList from './RoutesList';

const client = new NetworkClient();

const _ = cockpit.gettext;

const ForwardingSettings = () => {
    const [ipv4, setIPv4] = useState(false);
    const [ipv6, setIPv6] = useState(false);

    return (
        // TODO: It is not implemented yet and probably will be removed
        <Card>
            <CardTitle>{_("Forwarding")}</CardTitle>
            <CardBody>
                <dl className="details-list">
                    <dt>{_("IPv4 Forwarding")}</dt>
                    <dd><Switch id="simple-swith-ipv4" isChecked={ipv4} onChange={setIPv4} /></dd>
                    <dt>{_("IPv6 Forwarding")}</dt>
                    <dd><Switch id="simple-swith-ipv6" isChecked={ipv6} onChange={setIPv6} /></dd>
                </dl>
            </CardBody>
        </Card>
    );
};

const RoutingTab = () => {
    const dispatch = useNetworkDispatch();
    const { routes } = useNetworkState();

    useEffect(() => {
        client.getRoutes()
                .then(result => dispatch({ type: actionTypes.SET_ROUTES, payload: result }))
                .catch(console.error);
    }, [dispatch]);

    const routesList = routes ? Object.values(routes) : [];

    return (
        <>
            <Toolbar id="routing-toolbar">
                <ToolbarContent>
                    <ToolbarItem>
                        <Button variant="secondary">Add Route</Button>
                    </ToolbarItem>
                    <ToolbarItem>
                        <SaveChanges />
                    </ToolbarItem>
                </ToolbarContent>
            </Toolbar>
            <ForwardingSettings />
            <Card>
                <CardTitle>{_("Default routing table")}</CardTitle>
                <CardBody>
                    <Toolbar id="routing-toolbar">
                        <ToolbarContent>
                            <ToolbarItem className="pull-right">
                                <Button variant="secondary">Add Route</Button>
                            </ToolbarItem>
                        </ToolbarContent>
                    </Toolbar>
                    <RoutesList routes={routesList} />
                </CardBody>
            </Card>
        </>
    );
};

export default RoutingTab;
