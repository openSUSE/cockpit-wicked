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
import {
    Button,
    Checkbox,
    Form,
    FormGroup,
    Modal,
    ModalVariant,
    TextInput
} from '@patternfly/react-core';
import cockpit from 'cockpit';
import { useNetworkDispatch, useNetworkState, addConnection, updateConnection } from '../context/network';
import interfaceType from '../lib/model/interfaceType';

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
        <Modal
            variant={ModalVariant.small}
            title={isEditing ? _("Edit Bridge") : _("Add Bridge")}
            isOpen={isOpen}
            onClose={onClose}
            actions={[
                <Button key="confirm" variant="primary" onClick={addOrUpdateConnection} isDisabled={isIncomplete()}>
                    {isEditing ? _("Change") : _("Add")}
                </Button>,
                <Button key="cancel" variant="link" onClick={onClose}>
                    {_("Cancel")}
                </Button>
            ]}
        >
            <Form>
                <FormGroup
                    label={_("Name")}
                    isRequired
                    fieldId="interface-name"
                    helperText={_("Please, provide the interface name (e.g., br0)")}
                >
                    <TextInput
                        isRequired
                        id="interface-name"
                        value={name}
                        onChange={setName}
                    />
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
                            onChange={handleSelectedPorts(name)}
                        />
                    ))}
                </FormGroup>
            </Form>
        </Modal>
    );
};

export default BridgeForm;
