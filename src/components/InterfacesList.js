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
import React from 'react';
import { Card, CardTitle, CardBody } from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';

const _ = cockpit.gettext;

const columns = [
    { title: _("Name") },
    { title: _("Type") },
    { title: _("IP address") },
    { title: _("Sending/Receiving") },
];

const InterfacesList = ({ interfaces, connections }) => {
    const rows = interfaces.map(i => {
        const conn = connections.find(c => i.name == c.name);
        return [
            i.name,
            i.type,
            conn ? _("Configured") : _("Not configured"),
            "0/0",
        ];
    });

    return (
        <Card>
            <CardTitle>{_("Interfaces")}</CardTitle>
            <CardBody>
                <Table aria-label="Networking interfaces" cells={columns} rows={rows}>
                    <TableHeader />
                    <TableBody />
                </Table>
            </CardBody>
        </Card>
    );
};

export default InterfacesList;
