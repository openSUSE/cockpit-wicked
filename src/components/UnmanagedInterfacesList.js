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
    truncate
} from '@patternfly/react-table';
import { Table, TableBody, TableHeader } from '@patternfly/react-table/deprecated';
import interfaceType from '../lib/model/interfaceType';
import interfaceStatus from '../lib/model/interfaceStatus';

const _ = cockpit.gettext;

const UnmanagedInterfacesList = ({ interfaces = [] }) => {
    const [rows, setRows] = useState([]);

    const columns = [
        { title: _("Name") },
        { title: _("Type") },
        { title: _("Status"), transforms: [cellWidth(10)], cellTransforms: [truncate] },
        { title: _("Addresses") }
    ];

    const interfaceAddresses = (iface) => {
        if (iface.addresses.length === 0) return;

        return iface.addresses.map(i => i.local).join(', ');
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
     * Builds the needed structure for rendering unmanaged interfaces
     */
    const buildRows = useCallback(() => {
        return interfaces.reduce((list, i) => {
            list.push(
                {
                    cells: [
                        i.name,
                        interfaceType.label(i.type),
                        renderStatusText(i),
                        interfaceAddresses(i)
                    ]
                }
            );

            return list;
        }, []);
    }, [interfaces]);

    useEffect(() => {
        setRows(buildRows());
    }, [buildRows]);

    return (
        <Table
            aria-label="Unmanaged networking interfaces"
            variant={TableVariant.compact}
            className="interfaces-list"
            cells={columns}
            rows={rows}
        >
            <TableHeader />
            <TableBody />
        </Table>
    );
};

export default UnmanagedInterfacesList;
