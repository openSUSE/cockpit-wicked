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
import IPInput from './IPInput';
import {
    Button,
    DataList,
    DataListItem,
    DataListItemRow,
    DataListItemCells,
    DataListCell,
    DataListAction,
    Stack,
    StackItem,
    Split,
    SplitItem,
} from '@patternfly/react-core';
import PlusIcon from '@patternfly/react-icons/dist/js/icons/plus-icon';
import MinusIcon from '@patternfly/react-icons/dist/js/icons/minus-icon';

const _ = cockpit.gettext;

const DnsSettings = ({ dns }) => {
    const { nameServers } = dns;

    const addNameserver = () => {
        console.log("Adding new nameserver");
    };

    const deleteNameserver = (index) => {
        console.log(`Deleting the nameServer ${index}`);
        nameServers.splice(index, 1);
    };

    const renderNameServer = (index, nameserver) => {
        const cells = [
            <DataListCell key={`nameserver-${index}`}>
                <IPInput
                  defaultValue={nameserver}
                  onChange={(value) => console.log("modifying value")}
                  onError={(value) => console.log("Invalid value", value, "for nameserver", index)}
                />
            </DataListCell>
        ];

        const renderDeleteAction = () => {
            if (nameServers.length === 1) return null;

            return (
                <DataListAction>
                    <Button variant="secondory" className="btn-sm" onClick={() => deleteNameserver(index)}>
                        <MinusIcon />
                    </Button>
                </DataListAction>
            );
        };

        return (
            <DataListItem key={`nameserver-${index}`}>
                <DataListItemRow>
                    <DataListItemCells dataListCells={cells} />
                    { renderDeleteAction() }
                </DataListItemRow>
            </DataListItem>
        );
    };

    return (
        <Stack className="data-list-form" hasGutter>
            <StackItem>
                <Split hasGutter>
                    <SplitItem isFilled />
                    <SplitItem>
                        <Button variant="primary" className="btn-sm" onClick={() => addNameserver() }>
                            <PlusIcon />
                        </Button>
                    </SplitItem>
                </Split>
            </StackItem>
            <StackItem>
                <DataList isCompact aria-label={_("Nameservers data list")}>
                    {nameServers.map((nameserver, index) => renderNameServer(index, nameserver))}
                </DataList>
            </StackItem>
        </Stack>
    );
};

export default DnsSettings;
