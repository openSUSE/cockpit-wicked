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
import { Button, Checkbox, Form, FormGroup, Modal, ModalVariant, Select, SelectOption, SelectVariant, TextInput } from '@patternfly/react-core';
import cockpit from 'cockpit';
import { useNetworkDispatch, actionTypes } from '../NetworkContext';

const _ = cockpit.gettext;

const RouteForm = ({ isOpen, onClose, route }) => {
    const [selectIsOpen, setSelectIsOpen] = useState(false);
    const isEditing = !!route;
    const [is_default, setDefault] = useState(route?.is_default);
    const [gateway, setGateway] = useState(route?.gateway || "");
    const [destination, setDestination] = useState(route?.destination || "");
    const [device, setDevice] = useState(route?.device || "");
    const [options, setOptions] = useState(route?.options || "");
    const dispatch = useNetworkDispatch();

    const select_options = [
        <SelectOption key="any" value="" />,
        <SelectOption key="eth0" value="eth0" />,
        <SelectOption key="eth1" value="eth1" />
    ];

    const updateRoute = () => {
        dispatch({
            type: actionTypes.UPDATE_ROUTE,
            payload: { id: route.id, changes: { is_default, destination, gateway, device, options } }
        });
    };

    const addOrUpdateRoute = () => {
        if (isEditing) {
            updateRoute();
        } else {
            addRoute();
        }
        onClose();
    };

    const addRoute = () => {
        dispatch({
            type: actionTypes.ADD_ROUTE,
            payload: { default: is_default, destination, gateway, interface: device, options }
        });
    };

    const isInComplete = () => {
        if (!is_default && destination.length == 0) return true;
        if (gateway.length == 0) return true;

        return false;
    };

    return (
        <Modal
            variant={ModalVariant.small}
            title={isEditing ? _("Edit Route") : _("Add Route")}
            isOpen={isOpen}
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
                    fieldId="is_default"
                >
                    <Checkbox
                        id="is_default"
                        isChecked={is_default}
                        onChange={setDefault}
                    />
                </FormGroup>

                { !is_default &&
                    <FormGroup
                        label={_("Destination")}
                        isRequired={!is_default}
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
                    label={_("Gateway")}
                    isRequired
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
                    isRequired
                    fieldId="device"
                >
                    <Select
                      variant={SelectVariant.single}
                      onToggle={(selectIsOpen) => setSelectIsOpen(isOpen)}
                      selections={[device]}
                      onSelect={(event, selection) => {
                          setDevice(selection);
                          setSelectIsOpen(false);
                      }}
                      isOpen={selectIsOpen}
                    >
                        {select_options}
                    </Select>
                </FormGroup>
                <FormGroup
                    label={_("Options")}
                    isRequired
                    fieldId="options"
                >
                    <TextInput
                        isRequired
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
