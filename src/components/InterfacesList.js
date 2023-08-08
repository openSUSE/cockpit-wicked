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
import {
    TableVariant,
    cellWidth,
    expandable,
    truncate
} from '@patternfly/react-table';
import { Table, TableBody, TableHeader } from '@patternfly/react-table/deprecated';
import { Spinner } from '@patternfly/react-core';
import AlertIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import InterfaceDetails from "./InterfaceDetails";
import interfaceType from '../lib/model/interfaceType';
import interfaceStatus from '../lib/model/interfaceStatus';
import { createConnection } from '../lib/model/connections';

const _ = cockpit.gettext;

const InterfacesList = ({ interfaces = [], connections = [] }) => {
    const [rows, setRows] = useState([]);
    const [openRows, setOpenRows] = useState([]);

    const columns = [
        { title: "", props: { className: "status-column" } },
        { title: _("Name"), cellFormatters: [expandable] },
        { title: _("Type") },
        { title: _("Status"), transforms: [cellWidth(10)], cellTransforms: [truncate] },
        { title: _("Addresses") }
    ];

    const interfaceAddresses = (iface) => {
        if (iface.addresses.length === 0) return;

        return iface.addresses.map(i => i.local).join(', ');
    };

    const renderStatusIcon = (iface) => {
        if (!iface.status) return;

        if (iface.error) {
            return <><AlertIcon /></>;
        } else if (iface.status !== interfaceStatus.READY) {
            return <><Spinner size="md" /></>;
        }
    };

    const renderStatusText = (iface) => {
        const linkText = iface.link ? _('Up') : _('Down');

        if (!iface.status || iface.status === interfaceStatus.READY) {
            return linkText;
        } else {
            return interfaceStatus.label(iface.status);
        }
    };

    /**
     * Returns the connection for given interface name or a fake one if it does not exist yet
     *
     * When a connection does not exist yet, the user should be able to create one by configuring
     * the interface. To achieve that, a "default" connection object is needed, in order to build
     * the needed UI.
     *
     * @param {string} name - the interface/connection name
     * @return {module:model/connections~Connection}
     */
    const findOrCreateConnection = useCallback((name) => {
        return connections.find(c => c.name === name) || createConnection({ name, exists: false });
    }, [connections]);

    /**
     * Builds the needed structure for rendering the interfaces and their details in an expandable
     * Patternfly/Table
     */
    const buildRows = useCallback(() => {
        let parentId = 0;

        return interfaces.reduce((list, i) => {
            const conn = findOrCreateConnection(i.name);

            list.push(
                {
                    isOpen: openRows.includes(parentId),
                    cells: [
                        renderStatusIcon(i),
                        i.name,
                        interfaceType.label(i.type),
                        renderStatusText(i),
                        interfaceAddresses(i)
                    ]
                }
            );
            list.push(
                {
                    parent: parentId,
                    cells: [
                        "",
                        {
                            title: <InterfaceDetails iface={i} connection={conn} />,
                            props: { colSpan: 4 }
                        }
                    ]
                }
            );

            parentId += 2;

            return list;
        }, []);
    }, [interfaces, openRows, findOrCreateConnection]);

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
        <Table
            aria-label="Networking interfaces"
            variant={TableVariant.compact}
            onCollapse={onCollapseFn()}
            className="interfaces-list"
            cells={columns}
            rows={rows}
        >
            <TableHeader />
            <TableBody />
        </Table>
    );
};

export default InterfacesList;
