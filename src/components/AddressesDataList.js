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

import React from 'react';
import cockpit from 'cockpit';
import { createAddressConfig } from '../lib/model/address';

import {
    Button,
    DataList,
    DataListItem,
    DataListItemRow,
    DataListItemCells,
    DataListCell,
    DataListAction,
    TextInput,
    Stack,
    StackItem,
    Split,
    SplitItem,
} from '@patternfly/react-core';

import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import MinusIcon from '@patternfly/react-icons/dist/esm/icons/minus-icon';
import IPInput from './IPInput';

const _ = cockpit.gettext;

/**
 * Component for managing a collection of {@link module/model~AddressConfig}
 *
 * @param {Object} props - component props
 * @param {Array<{module/modell~AddressConfig}>} addresses - the addresses collection
 * @param {function} updateAddresses - callback function to be called when adding or removing
 *    addresses
 * @param {boolean} [allowEmpty=true] - whether the component should allow to delete all items
 */
const AddressesDataList = ({ addresses, updateAddresses, allowEmpty = true }) => {
    const addAddress = () => {
        const address = createAddressConfig();
        const currentAddresses = [...addresses];
        currentAddresses.push(address);
        updateAddresses(currentAddresses);
    };

    const updateAddress = (id, field, value) => {
        const nextAddresses = [...addresses];
        const address = nextAddresses.find((addr) => addr.id == id);
        address[field] = value;

        // TODO: check if this do not generate not needed re-renders
        updateAddresses(nextAddresses);
    };

    const deleteAddress = (id) => {
        const nextAddresses = [...addresses];
        const addressIdx = nextAddresses.findIndex((addr) => addr.id == id);
        nextAddresses.splice(addressIdx, 1);
        updateAddresses(nextAddresses);
    };

    const renderAddress = ({ id, local, label }) => {
        const renderDeleteAction = () => {
            if (!allowEmpty && addresses.length === 1) return null;

            return (
                <DataListAction>
                    <Button variant="secondory" className="btn-sm" onClick={() => deleteAddress(id)}>
                        <MinusIcon />
                    </Button>
                </DataListAction>
            );
        };

        const cells = [
            <DataListCell key={`address-${id}-local`}>
                <IPInput
                  defaultValue={local}
                  onChange={(_e, value) => updateAddress(id, 'local', value)}
                  placeholder={_("Address")}
                  aria-label={_("Address")}
                />
            </DataListCell>,
            <DataListCell key={`address-${id}-label`}>
                <TextInput
                  defaultValue={label}
                  onChange={(_e, value) => updateAddress(id, 'label', value)}
                  placeholder={_("Label")}
                  aria-label={_("Label")}
                />
            </DataListCell>
        ];

        return (
            <DataListItem key={`address-${id}`}>
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
                        <Button variant="primary" className="btn-sm" onClick={() => addAddress() }>
                            <PlusIcon />
                        </Button>
                    </SplitItem>
                </Split>
            </StackItem>
            <StackItem>
                <DataList isCompact aria-label={_("Addresses data list")}>
                    {addresses.map((address) => renderAddress(address))}
                </DataList>
            </StackItem>
        </Stack>
    );
};

export default AddressesDataList;
