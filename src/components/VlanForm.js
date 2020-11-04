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
    Form,
    FormGroup,
    FormSelect,
    FormSelectOption,
    Modal,
    ModalVariant,
    TextInput,
} from '@patternfly/react-core';
import cockpit from 'cockpit';
import { useNetworkDispatch, useNetworkState, addConnection, updateConnection } from '../NetworkContext';
import interfaceType from '../lib/model/interfaceType';

const _ = cockpit.gettext;

const VlanForm = ({ isOpen, onClose, connection }) => {
    const { vlan } = connection || {};
    const isEditing = !!connection;
    const [name, setName] = useState(connection?.name);
    const [vlanId, setVlanId] = useState(vlan?.vlanId || 0);
    const [parentDevice, setParentDevice] = useState(vlan?.parentDevice);
    const [candidateInterfaces, setCandidateInterfaces] = useState([]);
    const { interfaces } = useNetworkState();
    const dispatch = useNetworkDispatch();
    const [suggestName, setSuggestName] = useState(!isEditing);

    useEffect(() => {
        setCandidateInterfaces([...Object.values(interfaces)]);
        if (!parentDevice) setParentDevice(Object.values(interfaces)[0]?.name);
    }, [interfaces]);

    useEffect(() => {
        proposeName();
    }, [vlanId, parentDevice]);

    const addOrUpdateConnection = () => {
        let promise = null;

        if (isEditing) {
            promise = updateConnection(dispatch, connection, { vlan: { name, vlanId, parentDevice } });
        } else {
            promise = addConnection(dispatch, { name, type: interfaceType.VLAN, vlan: { vlanId, parentDevice } });
        }

        promise.then(onClose).catch(console.error);
    };

    const isIncomplete = () => {
        if (name === "") return true;
        if (vlanId === "") return true;
        if (parentDevice === "") return true;

        return false;
    };

    const updateName = (value) => {
        setName(value);
        setSuggestName(false);
    };

    const proposeName = () => {
        if (!suggestName) return;
        setName(`${parentDevice}.${vlanId}`);
    };

    if (!parentDevice) return null;

    return (
        <Modal
            variant={ModalVariant.small}
            title={isEditing ? _("Edit VLAN") : _("Add VLAN")}
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
                    label={_("Parent")}
                    isRequired
                    fieldId="parentDevice"
                >

                    <FormSelect value={parentDevice} onChange={setParentDevice} id="parentDevice">
                        {candidateInterfaces.map(({ name }, index) => (
                            <FormSelectOption key={index} value={name} label={name} />
                        ))}
                    </FormSelect>
                </FormGroup>
                <FormGroup
                    label={_("VLAN ID")}
                    isRequired
                    fieldId="vlan_id"
                    helperText={_("Please, provide the VLAN ID (e.g., 10)")}
                >
                    <TextInput
                        isRequired
                        id="vlan_id"
                        value={vlanId}
                        onChange={setVlanId}
                        type="number"
                    />
                </FormGroup>

                <FormGroup
                    label={_("Name")}
                    isRequired
                    fieldId="interface-name"
                    helperText={_("Please, provide the interface name (e.g., vlan10)")}
                >
                    <TextInput
                        isRequired
                        id="interface-name"
                        value={name}
                        onChange={updateName}
                    />
                </FormGroup>
            </Form>
        </Modal>
    );
};

export default VlanForm;
