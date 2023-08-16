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
import { Checkbox, FormGroup, HelperText, HelperTextItem, TextInput } from '@patternfly/react-core';
import cockpit from 'cockpit';
import { useNetworkDispatch, useNetworkState, addConnection, updateConnection } from '../context/network';
import interfaceType from '../lib/model/interfaceType';
import ModalForm from './ModalForm';

const _ = cockpit.gettext;

const BridgeForm = ({ isOpen, onClose, connection }) => {
    const { bridge } = connection || {};
    const isEditing = !!connection;
    const [name, setName] = useState(connection?.name || "");
    const [selectedPorts, setSelectedPorts] = useState(bridge?.ports || []);
    const [candidatePorts, setCandidatePorts] = useState([]);
    const { interfaces } = useNetworkState();
    const dispatch = useNetworkDispatch();

    useEffect(() => {
        if (isEditing) {
            setCandidatePorts(Object.values(interfaces).filter(i => i.name !== connection.name));
        } else {
            setCandidatePorts(Object.values(interfaces));
        }
    }, [connection, isEditing, interfaces]);

    const addOrUpdateConnection = () => {
        if (isEditing) {
            updateConnection(
                dispatch, connection, { name, bridge: { ports: selectedPorts } }
            );
        } else {
            addConnection(
                dispatch, { name, type: interfaceType.BRIDGE, bridge: { ports: selectedPorts, } }
            );
        }
        onClose();
    };

    const handleSelectedPorts = (name) => (value) => {
        if (value) {
            setSelectedPorts([...selectedPorts, name]);
        } else {
            setSelectedPorts(selectedPorts.filter(i => i !== name));
        }
    };

    const isIncomplete = () => {
        return (name === "" || selectedPorts.length === 0);
    };

    return (
        <ModalForm
            caption={connection?.name}
            title={isEditing ? _("Edit Bridge") : _("Add Bridge")}
            isOpen={isOpen}
            onCancel={onClose}
            onSubmit={addOrUpdateConnection}
            onSubmitLabel={isEditing ? _("Change") : _("Add")}
            onSubmitDisable={isIncomplete()}
        >
            <FormGroup
                label={_("Name")}
                isRequired
                fieldId="interface-name"
            >
                <TextInput
                    isRequired
                    isDisabled={isEditing}
                    id="interface-name"
                    value={name}
                    onChange={(_e, val) => setName(val)}
                />
                <HelperText>
                    <HelperTextItem>
                        {_("Please, provide the interface name (e.g., br0)")}
                    </HelperTextItem>
                </HelperText>
            </FormGroup>

            <FormGroup
                label={_("Ports")}
                isRequired
            >
                {candidatePorts.map(({ name }) => (
                    <Checkbox
                        label={name}
                        key={name}
                        isChecked={selectedPorts.includes(name)}
                        onChange={(_e, val) => handleSelectedPorts(name)(val)}
                    />
                ))}
            </FormGroup>
        </ModalForm>
    );
};

export default BridgeForm;
