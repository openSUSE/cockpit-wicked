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
    { title: _("IP address") },
    { title: _("Sending") },
    { title: _("Receiving") }
];

const rows = [
    {
        cells: ["enp59s0u1u2", "192.168.8.107", "100", "50"]
    },
    {
        cells: ["enp59s0u1u3", "192.168.8.100", "10", "5"]
    }
];

const InterfacesList = () => {
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
