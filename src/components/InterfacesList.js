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
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, TableVariant, expandable } from '@patternfly/react-table';
import InterfaceDetails from "./InterfaceDetails";
import interfaceType from '../lib/model/interfaceType';
import { useNetworkDispatch, deleteConnection, changeConnectionState } from '../context/network';

const _ = cockpit.gettext;

const InterfacesList = ({ interfaces = [], connections = [] }) => {
    const [rows, setRows] = useState([]);
    const [openRows, setOpenRows] = useState([]);
    const dispatch = useNetworkDispatch();

    const columns = [
        { title: _("Name"), cellFormatters: [expandable] },
        { title: _("Type") },
        { title: _("Status") },
        { title: _("Addresses") }
    ];

    const removeConnection = useCallback((connection) => {
        deleteConnection(dispatch, connection);
    }, [dispatch]);

    const changeState = useCallback((connection, state) => {
        changeConnectionState(dispatch, connection, state);
    }, [dispatch]);

    const interfaceAddresses = (iface) => {
        if (iface.addresses.length === 0) return;

        return iface.addresses.map(i => i.local).join(', ');
    };

    /**
     * Builds the needed structure for rendering the interfaces and their details in an expandable
     * Patternfly/Table
     */
    const buildRows = useCallback(() => {
        let parentId = 0;

        return interfaces.reduce((list, i) => {
            const conn = connections.find(c => i.name == c.name);

            list.push(
                {
                    isOpen: openRows.includes(parentId),
                    cells: [
                        i.name,
                        interfaceType.label(i.type),
                        i.link ? _('Up') : _('Down'),
                        interfaceAddresses(i)
                    ]
                }
            );
            list.push(
                {
                    parent: parentId,
                    cells: [
                        {
                            title: <InterfaceDetails iface={i} connection={conn} removeConnection={removeConnection} changeConnectionState={changeState} />
                        }
                    ]
                }
            );

            parentId += 2;

            return list;
        }, []);
    }, [connections, interfaces, openRows, removeConnection, changeState]);

    /**
     * Keeps the openRows internal state up to date using the information provided by the
     * Patternfly/Table#onCollapse event
     */
    const onCollapseFn = () => (event, rowKey, isOpen) => {
        if (isOpen && !openRows.includes(rowKey)) {
            setOpenRows([...openRows, rowKey]);
        } else {
            setOpenRows(openRows.filter(k => k != rowKey));
        }
    };

    useEffect(() => {
        setRows(buildRows());
    }, [buildRows]);

    return (
        <Card>
            <CardHeader>
                <CardTitle><h2>{_("Interfaces")}</h2></CardTitle>
            </CardHeader>
            <CardBody>
                <Table
                    aria-label="Networking interfaces"
                    variant={TableVariant.compact}
                    onCollapse={onCollapseFn()}
                    cells={columns}
                    rows={rows}
                >
                    <TableHeader />
                    <TableBody />
                </Table>
            </CardBody>
        </Card>
    );
};

export default InterfacesList;
