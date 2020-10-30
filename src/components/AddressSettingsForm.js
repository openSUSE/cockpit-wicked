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

import React, { useState, useEffect } from 'react';
import cockpit from 'cockpit';
import bootProtocol from '../lib/model/bootProtocol';

import {
    Button,
    Modal,
    ModalVariant,
    Split,
    SplitItem,
    Stack,
    StackItem,
    Title
} from '@patternfly/react-core';

import { useNetworkState } from '../NetworkContext';
import BootProtoSelector from "./BootProtoSelector";
import AddressesDataList from "./AddressesDataList";
import RoutesDataList from "./RoutesDataList";

const _ = cockpit.gettext;

// TODO: create a connection when it does not exist yet?
const AddressSettingsForm = ({ connection, isOpen, onClose }) => {
    const { routes: currentRoutes } = useNetworkState();
    const currentAddresses = connection?.addresses || [];
    const additionalAddresses = currentAddresses.filter((addr) => addr.proto === bootProtocol.STATIC);

    const [bootProto, setBootProto] = useState(connection?.bootProto || bootProtocol.STATIC);
    const [routes, setRoutes] = useState(currentRoutes);
    const [addresses, setAddresses] = useState(additionalAddresses);

    return (
        <Modal
            variant={ModalVariant.small}
            title={_("Address Settings")}
            isOpen={isOpen}
            onClose={() => {
                // TODO: implement the business logic
                console.log("Now boot proto id", bootProto);
                console.log("Now addresses are", addresses);
                console.log("Now routes are", routes);
                console.log("Triggering #onClose");

                onClose();
            }}
            actions={[
                <Button key="confirm" variant="primary" onClick={() => {}}>
                    {_("Apply")}
                </Button>,
                <Button key="cancel" variant="link" onClick={onClose}>
                    {_("Cancel")}
                </Button>
            ]}
        >
            <Stack hasGutter>
                <StackItem>
                    <Split hasGutter>
                        <SplitItem isFilled>
                            <Title headingLevel="h2">{_("Boot Protocol")}</Title>
                        </SplitItem>
                        <SplitItem>
                            <BootProtoSelector value={bootProto} onChange={setBootProto} />
                        </SplitItem>
                    </Split>
                </StackItem>

                <StackItem>
                    <AddressesDataList addresses={addresses} updateAddresses={setAddresses} />
                </StackItem>

                <StackItem>
                    <RoutesDataList routes={routes} updateRoutes={setRoutes} />
                </StackItem>
            </Stack>
        </Modal>
    );
};

export default AddressSettingsForm;
