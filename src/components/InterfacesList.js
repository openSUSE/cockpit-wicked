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

const InterfacesList = ({ interfaces = [], connections = [] }) => {
    const [rows, setRows] = useState([]);
    const [types, setTypes] = useState([]);
    const [filterByType, setFilterByType] = useState([]);
    const [openRows, setOpenRows] = useState([]);

    const columns = [
        { title: _("Name"), cellFormatters: [expandable] },
        { title: _("Type") }
    ];

    /**
     * Builds the needed structure for rendering the interfaces and their details in an expandable
     * Patternfly/Table
     */
    const buildRows = () => {
        let parentId = 0;

        return interfaces.reduce((list, i) => {
            if (filterByType.length && !filterByType.includes(i.type)) {
                return list;
            }

            const conn = connections.find(c => i.name == c.name);

            list.push(
                {
                    isOpen: openRows.includes(parentId),
                    cells: [
                        i.name,
                        i.type
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
        const uniqueTypes = [...new Set(interfaces.map((i) => i.type))];
        setTypes(uniqueTypes);
    }, [interfaces]);

    useEffect(() => {
        setRows(buildRows());
    }, [interfaces, connections, openRows, filterByType]);

    return (
        <Card>
            <CardHeader>
                <CardActions>
                    <TypesFilter
                        types={types}
                        onSelect={(selectedTypes) => {
                            setOpenRows([]);
                            setFilterByType(selectedTypes);
                        }}
                    />
                </CardActions>
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
