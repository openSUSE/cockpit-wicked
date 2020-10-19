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
import { Card, CardHeader, CardActions, CardTitle, CardBody } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, TableVariant, expandable } from '@patternfly/react-table';
import InterfaceDetails from "./InterfaceDetails";
import TypesFilter from "./TypesFilter";

const _ = cockpit.gettext;

const columns = [
    { title: _("Name"), cellFormatters: [expandable] },
    { title: _("Type") },
    { title: _("IP address") },
    { title: _("Sending/Receiving") },
];

const onCollapseFn = (rows, setRows) => (event, rowKey, isOpen) => {
    const clonedRows = [...rows];

    clonedRows[rowKey].isOpen = isOpen;
    setRows(clonedRows);
};

const buildRows = (interfaces, connections, displayOnly = []) => {
    let parentId = 0;

    return interfaces.reduce((list, i) => {
        if (displayOnly.length && !displayOnly.includes(i.type)) {
            return list;
        }

        const conn = connections.find(c => i.name == c.name);

        list.push(
            {
                isOpen: false,
                cells: [
                    i.name,
                    i.type,
                    conn ? _("Configured") : _("Not configured"),
                    "0/0",
                ]
            }
        );
        list.push(
            {
                parent: parentId,
                cells: [
                    {
                        title: <InterfaceDetails iface={i} connection={conn} />
                    }
                ]
            }
        );

        parentId += 2;

        return list;
    }, []);
};

const InterfacesList = ({ interfaces = [], connections = [] }) => {
    const [rows, setRows] = useState([]);
    const [types, setTypes] = useState([]);
    const [filterByType, setFilterByType] = useState([]);

    useEffect(() => {
        const uniqueTypes = [...new Set(interfaces.map((i) => i.type))];
        setTypes(uniqueTypes);
    }, [interfaces]);

    useEffect(() => {
        const rows = buildRows(interfaces, connections, filterByType);
        setRows(rows);
    }, [interfaces, connections, filterByType]);

    return (
        <Card>
            <CardHeader>
                <CardActions>
                    <TypesFilter
                        types={types}
                        onSelect={(selectedTypes) => setFilterByType(selectedTypes)}
                    />
                </CardActions>
                <CardTitle><h2>{_("Interfaces")}</h2></CardTitle>
            </CardHeader>
            <CardBody>
                <Table
                    aria-label="Networking interfaces"
                    variant={TableVariant.compact}
                    onCollapse={onCollapseFn(rows, setRows)}
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
