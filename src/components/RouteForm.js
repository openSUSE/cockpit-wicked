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
import { Button, Checkbox, Form, FormGroup, Modal, ModalVariant, FormSelect, FormSelectOption, TextInput } from '@patternfly/react-core';
import cockpit from 'cockpit';
import { useNetworkDispatch, useNetworkState, addRoute, updateRoute } from '../context/network';

const _ = cockpit.gettext;

const RouteForm = ({ isOpen, onClose, route }) => {
    const isEditing = !!route;
    const [isDefault, setIsDefault] = useState(route?.isDefault || false);
    const [gateway, setGateway] = useState(route?.gateway || "");
    const [destination, setDestination] = useState(route?.destination || "");
    const [device, setDevice] = useState(route?.device || "");
    const [options, setOptions] = useState(route?.options || "");
    const { interfaces, routes } = useNetworkState();
    const [candidateInterfaces, setCandidateInterfaces] = useState([]);
    const dispatch = useNetworkDispatch();

    useEffect(() => {
        setCandidateInterfaces([{ name: "" }, ...Object.values(interfaces)]);
    }, [interfaces]);

    const addOrUpdateRoute = () => {
        if (isEditing) {
            updateRoute(dispatch, routes, route.id, buildRouteData());
        } else {
            addRoute(dispatch, routes, buildRouteData());
        }

        onClose();
    };

    const buildRouteData = () => {
        return {
            isDefault,
            destination: isDefault ? "default" : destination,
            gateway,
            device,
            options
        };
    };

    const isInComplete = () => {
        if (!isDefault && destination.length == 0) return true;
        if (gateway.length == 0) return true;

        return false;
    };

    return (
        <Modal
            variant={ModalVariant.small}
            title={isEditing ? _("Edit Route") : _("Add Route")}
            isOpen={isOpen}
            onClose={onClose}
            actions={[
                <Button key="confirm" variant="primary" onClick={addOrUpdateRoute} isDisabled={isInComplete()}>
                    {isEditing ? _("Change") : _("Add")}
                </Button>,
                <Button key="cancel" variant="link" onClick={onClose}>
                    {_("Cancel")}
                </Button>
            ]}
        >
            <Form>
                <FormGroup
                    label={_("Default route")}
                    fieldId="isDefault"
                >
                    <Checkbox
                        id="isDefault"
                        isChecked={isDefault}
                        onChange={setIsDefault}
                    />
                </FormGroup>

                { !isDefault &&
                    <FormGroup
                        isRequired
                        label={_("Destination")}
                        fieldId="destination"
                        helperText={_("Destination")}
                    >
                        <TextInput
                            isRequired
                            id="destination"
                            value={destination}
                            onChange={setDestination}
                        />
                    </FormGroup>}

                <FormGroup
                    isRequired
                    label={_("Gateway")}
                    fieldId="gateway"
                >
                    <TextInput
                        isRequired
                        id="gateway"
                        value={gateway}
                        onChange={setGateway}
                    />
                </FormGroup>

                <FormGroup
                    label={_("Device")}
                    fieldId="device"
                >
                    <FormSelect value={device} onChange={setDevice} id="device">
                        {candidateInterfaces.map(({ name }, index) => (
                            <FormSelectOption key={index} value={name} label={name} />
                        ))}
                    </FormSelect>
                </FormGroup>

                <FormGroup
                    label={_("Options")}
                    fieldId="options"
                >
                    <TextInput
                        id="options"
                        value={options}
                        onChange={setOptions}
                    />
                </FormGroup>
            </Form>
        </Modal>
    );
};

export default RouteForm;
