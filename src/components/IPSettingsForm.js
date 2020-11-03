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

import React, { useState } from 'react';
import { isValidIP } from '../lib/utils';
import cockpit from 'cockpit';

import {
    Alert,
    Button,
    Form,
    FormGroup,
    Modal,
    ModalVariant
} from '@patternfly/react-core';

import { useNetworkDispatch, updateConnection } from '../NetworkContext';
import BootProtoSelector from "./BootProtoSelector";
import AddressesDataList from "./AddressesDataList";

const _ = cockpit.gettext;

const sanitize = (addresses) => {
    return addresses.filter((addr, index, collection) => {
    // Reject addresses without IP
        if (addr.address === undefined || addr.address.trim() === "") return false;

        // If duplicated (same address, same label), keep only one
        const idx = collection.findIndex((item) => item.address === addr.address && item.label === addr.label);
        return idx === index;
    });
};

const findInvalidIP = addresses => addresses.find((addr) => !isValidIP(addr.address));

const findRepeatedLabel = (addresses) => {
    return addresses.find((addr, idx, collection) => {
        const firstIdx = collection.findIndex((item) => item.label === addr.label);
        return idx !== firstIdx;
    });
};

const IPSettingsForm = ({ ipVersion = 'ipv4', connection, isOpen, onClose }) => {
    const dispatch = useNetworkDispatch();
    const settings = connection[ipVersion];
    const [bootProto, setBootProto] = useState(settings.bootProto);
    const [addresses, setAddresses] = useState(settings.addresses);
    const [errorMessages, setErrorMessages] = useState([]);
    const [isApplying, setIsApplying] = useState(false);

    const handleSubmit = () => {
        setErrorMessages([]);
        setIsApplying(true);

        /**
         * TODO: improve validations
         * TODO: highlight addresses with errors?
         */
        const errors = [];
        const sanitizedAddresses = sanitize(addresses);

        if (findInvalidIP(sanitizedAddresses)) {
            errors.push(_("There are invalid IPs"));
        }

        if (findRepeatedLabel(sanitizedAddresses)) {
            errors.push(_("There are repeated labels"));
        }

        // Do not proceed if errors were found
        if (errors.length) {
            setAddresses(sanitizedAddresses);
            setErrorMessages(errors);
            setIsApplying(false);
            return;
        }

        // If everything looks good, try to apply requested changes
        const promise = updateConnection(
            dispatch,
            connection,
            { [ipVersion]: { bootProto, addresses: sanitizedAddresses } }
        );

        promise
                .then(() => {
                    setIsApplying(false);
                    onClose();
                })
                .catch((error) => {
                    console.error(error);
                    setErrorMessages([_("Something went wrong. Please, try it again.")]);
                    setIsApplying(false);
                });
    };

    const renderErrors = () => {
        if (errorMessages.length === 0) return null;

        return errorMessages.map((error, idx) => (
            <Alert
key={idx}
              variant="danger"
              title={error}
              aria-live="polite"
              isInline
            />
        ));
    };

    return (
        <Modal
            variant={ModalVariant.medium}
            title={_(`${ipVersion.toUpperCase()} Settings`)}
            isOpen={isOpen}
            onClose={onClose}
            actions={[
                <Button
              spinnerAriaValueText={isApplying ? _("Applying changes") : undefined}
              isLoading={isApplying}
              isDisabled={isApplying}
              key="confirm" variant="primary"
              onClick={handleSubmit}
                >
                    {isApplying ? _("Applying changes") : _("Apply")}
                </Button>,
                <Button key="cancel" variant="link" onClick={onClose}>
                    {_("Cancel")}
                </Button>
            ]}
        >
            <Form>
                {renderErrors()}

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
