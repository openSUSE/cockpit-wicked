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

import cockpit from "cockpit";
import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, TableVariant } from '@patternfly/react-table';
import { useNetworkDispatch } from '../NetworkContext';
import RouteForm from './RouteForm';

const _ = cockpit.gettext;

const columns = [
    { title: _("Destination") },
    { title: _("Gateway") },
    { title: _("Device") },
    { title: _("Options") },
    ''
];

const destination_text = (route) => {
    return route.is_default ? "default" : route.destination;
};

const RoutesList = ({ routes }) => {
    const [isFormOpen, setFormOpen] = useState(false);
    const [rows, setRows] = useState([]);
    const dispatch = useNetworkDispatch();
    const [route, setRoute] = useState();

    const editRoute = (event, rowId) => {
        setRoute(routes[rowId]);
        setFormOpen(true);
    };

    const deleteRoute = (event, rowId) => {
        dispatch({ type: 'set_routes', payload: routes.filter((value, index) => index !== rowId) });
    };

    const actions = [
        {
            title: _("Edit"),
            onClick: editRoute
        },
        {
            title: _("Delete"),
            onClick: deleteRoute
        }
    ];

    useEffect(() => {
        setRows(routes.map((route) => [destination_text(route), route.gateway, route.device, route.options]));
    }, [routes]);

    return (
        <>
            { isFormOpen && <RouteForm isOpen={isFormOpen} route={route} onClose={() => setFormOpen(false)} /> }
            <Card>
                <CardBody>
                    <Table
                    aria-label="Default Routing Table"
                    variant={TableVariant.compact}
                    cells={columns}
                    rows={rows}
                    actions={actions}
                    >
                        <TableHeader />
                        <TableBody />
                    </Table>
                </CardBody>
            </Card>
        </>
    );
};

export default RoutesList;