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
    Form,
    FormGroup,
    Modal,
    ModalVariant,
    Split,
    SplitItem,
    Stack,
    StackItem,
    Title
} from '@patternfly/react-core';

import { useNetworkDispatch, updateConnection } from '../NetworkContext';
import BootProtoSelector from "./BootProtoSelector";
import AddressesDataList from "./AddressesDataList";

const _ = cockpit.gettext;

const IPSettingsForm = ({ ipVersion = 'ipv4', connection, isOpen, onClose }) => {
    const dispatch = useNetworkDispatch();
    const settings = connection[ipVersion];
    const [bootProto, setBootProto] = useState(settings.bootProto);
    const [addresses, setAddresses] = useState(settings.addresses);

    const handleSubmit = () => {
        /**
         * TODO: performs a clean up:
         *    1. Remove duplicates: same address and same label
         * TODO: performs validations:
         *    2. Validate addresses ips
         *    3. Check if addresses using more than one label
         *    4. Check labels being used more than once
         * TODO: show messages in the form
         *    5. General error/warning
         *    6. If possible, highlight affected addresses
         */

        const promise = updateConnection(dispatch, connection, { [ipVersion]: { bootProto, addresses } });
        promise.then(onClose).catch(console.error);
    };

    return (
        <Modal
            variant={ModalVariant.medium}
            title={_(`${ipVersion.toUpperCase()} Settings`)}
            isOpen={isOpen}
            onClose={onClose}
            actions={[
                <Button key="confirm" variant="primary" onClick={handleSubmit}>
                    {_("Apply")}
                </Button>,
                <Button key="cancel" variant="link" onClick={onClose}>
                    {_("Cancel")}
                </Button>
            ]}
        >
            <Form>
                <FormGroup label={_("Boot Protocol")} isRequired>
                    <BootProtoSelector value={bootProto} onChange={setBootProto} />
                </FormGroup>

                <FormGroup label={_("Addresses")}>
                    <AddressesDataList addresses={addresses} updateAddresses={setAddresses} />
                </FormGroup>
            </Form>
        </Modal>
    );
};

export default IPSettingsForm;
